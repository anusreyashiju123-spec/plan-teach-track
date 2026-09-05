import { supabase } from "@/integrations/supabase/client";
import type {
  ClassSession,
  Module,
  ModuleWithTopics,
  Subject,
  Topic,
} from "@/lib/acadify";

export type TeacherProfile = {
  teacher_id: string;
  name: string;
  email: string;
  department: string;
  photo_url: string | null;
  setup_complete: boolean;
};

export type DraftTopic = {
  topic_id?: string;
  topic_name: string;
  estimated_classes: number;
};

export type DraftModule = {
  module_id?: string;
  module_number: number;
  module_name: string;
  estimated_classes: number;
  topics: DraftTopic[];
};

export type SyllabusDraft = {
  subject_id?: string;
  subject_name: string;
  subject_code: string;
  department: string;
  semester: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  total_classes: number;
  classes_per_week: number;
  modules: DraftModule[];
};

export type SubjectBundle = {
  subject: Subject;
  modules: ModuleWithTopics[];
  sessions: ClassSession[];
};

export const acadifyKeys = {
  teacher: ["acadify", "teacher"] as const,
  syllabus: ["acadify", "syllabus"] as const,
};

export async function fetchTeacher(): Promise<TeacherProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("teacher_id", user.id)
    .maybeSingle();
  if (error) throw error;

  if (!data) {
    const inserted = await supabase
      .from("teachers")
      .insert({
        teacher_id: user.id,
        name: (user.user_metadata?.["name"] as string) ?? "",
        email: user.email ?? "",
      })
      .select("*")
      .single();
    if (inserted.error) throw inserted.error;
    return inserted.data as TeacherProfile;
  }
  return data as TeacherProfile;
}

export async function fetchSyllabus(): Promise<SubjectBundle[]> {
  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!subjects?.length) return [];

  const subjectIds = subjects.map((s) => s.subject_id);
  const [{ data: modules, error: mErr }, { data: sessions, error: sErr }] = await Promise.all([
    supabase.from("modules").select("*").in("subject_id", subjectIds).order("module_number"),
    supabase
      .from("class_sessions")
      .select("*")
      .in("subject_id", subjectIds)
      .order("class_date", { ascending: false }),
  ]);
  if (mErr) throw mErr;
  if (sErr) throw sErr;

  const moduleIds = (modules ?? []).map((m) => m.module_id);
  let topics: Topic[] = [];
  if (moduleIds.length) {
    const { data, error: tErr } = await supabase
      .from("topics")
      .select("*")
      .in("module_id", moduleIds)
      .order("position");
    if (tErr) throw tErr;
    topics = (data ?? []) as Topic[];
  }

  return subjects.map((subject) => ({
    subject: subject as Subject,
    modules: ((modules ?? []) as Module[])
      .filter((m) => m.subject_id === subject.subject_id)
      .map((m) => ({ ...m, topics: topics.filter((t) => t.module_id === m.module_id) })),
    sessions: ((sessions ?? []) as ClassSession[]).filter(
      (s) => s.subject_id === subject.subject_id,
    ),
  }));
}

export function bundleToDraft(bundle: SubjectBundle): SyllabusDraft {
  return {
    subject_id: bundle.subject.subject_id,
    subject_name: bundle.subject.subject_name,
    subject_code: bundle.subject.subject_code,
    department: bundle.subject.department,
    semester: bundle.subject.semester,
    academic_year: bundle.subject.academic_year,
    start_date: bundle.subject.start_date ?? "",
    end_date: bundle.subject.end_date ?? "",
    total_classes: bundle.subject.total_classes,
    classes_per_week: bundle.subject.classes_per_week,
    modules: bundle.modules.map((m) => ({
      module_id: m.module_id,
      module_number: m.module_number,
      module_name: m.module_name,
      estimated_classes: m.estimated_classes,
      topics: m.topics.map((t) => ({
        topic_id: t.topic_id,
        topic_name: t.topic_name,
        estimated_classes: t.estimated_classes,
      })),
    })),
  };
}

export function emptyDraft(department = ""): SyllabusDraft {
  return {
    subject_name: "",
    subject_code: "",
    department,
    semester: "",
    academic_year: "",
    start_date: "",
    end_date: "",
    total_classes: 40,
    classes_per_week: 3,
    modules: [
      {
        module_number: 1,
        module_name: "",
        estimated_classes: 6,
        topics: [{ topic_name: "", estimated_classes: 1 }],
      },
    ],
  };
}

/** Creates or updates the whole syllabus, preserving topic completion state. */
export async function saveSyllabus(draft: SyllabusDraft): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("You are signed out. Please log in again.");

  const subjectPayload = {
    teacher_id: user.id,
    subject_name: draft.subject_name.trim(),
    subject_code: draft.subject_code.trim(),
    department: draft.department.trim(),
    semester: draft.semester.trim(),
    academic_year: draft.academic_year.trim(),
    total_classes: draft.total_classes,
    classes_per_week: draft.classes_per_week,
    start_date: draft.start_date || null,
    end_date: draft.end_date || null,
    updated_at: new Date().toISOString(),
  };

  let subjectId = draft.subject_id;
  if (subjectId) {
    const { error } = await supabase
      .from("subjects")
      .update(subjectPayload)
      .eq("subject_id", subjectId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("subjects")
      .insert(subjectPayload)
      .select("subject_id")
      .single();
    if (error) throw error;
    subjectId = data.subject_id;
  }

  const { data: existingModules, error: exErr } = await supabase
    .from("modules")
    .select("module_id")
    .eq("subject_id", subjectId);
  if (exErr) throw exErr;

  const keptModuleIds: string[] = [];

  for (const [index, mod] of draft.modules.entries()) {
    const payload = {
      subject_id: subjectId,
      module_number: mod.module_number || index + 1,
      module_name: mod.module_name.trim(),
      estimated_classes: mod.estimated_classes,
    };
    let moduleId = mod.module_id;
    if (moduleId) {
      const { error } = await supabase.from("modules").update(payload).eq("module_id", moduleId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("modules")
        .insert(payload)
        .select("module_id")
        .single();
      if (error) throw error;
      moduleId = data.module_id;
    }
    keptModuleIds.push(moduleId!);

    const { data: existingTopics, error: etErr } = await supabase
      .from("topics")
      .select("topic_id")
      .eq("module_id", moduleId);
    if (etErr) throw etErr;

    const keptTopicIds: string[] = [];
    for (const [tIndex, topic] of mod.topics.entries()) {
      const tPayload = {
        module_id: moduleId,
        topic_name: topic.topic_name.trim(),
        estimated_classes: topic.estimated_classes,
        position: tIndex,
      };
      if (topic.topic_id) {
        const { error } = await supabase
          .from("topics")
          .update(tPayload)
          .eq("topic_id", topic.topic_id);
        if (error) throw error;
        keptTopicIds.push(topic.topic_id);
      } else {
        const { data, error } = await supabase
          .from("topics")
          .insert(tPayload)
          .select("topic_id")
          .single();
        if (error) throw error;
        keptTopicIds.push(data.topic_id);
      }
    }

    const staleTopics = (existingTopics ?? [])
      .map((t) => t.topic_id)
      .filter((id) => !keptTopicIds.includes(id));
    if (staleTopics.length) {
      const { error } = await supabase.from("topics").delete().in("topic_id", staleTopics);
      if (error) throw error;
    }
  }

  const staleModules = (existingModules ?? [])
    .map((m) => m.module_id)
    .filter((id) => !keptModuleIds.includes(id));
  if (staleModules.length) {
    const { error } = await supabase.from("modules").delete().in("module_id", staleModules);
    if (error) throw error;
  }

  const { error: tErr } = await supabase
    .from("teachers")
    .update({ setup_complete: true, department: draft.department.trim(), updated_at: new Date().toISOString() })
    .eq("teacher_id", user.id);
  if (tErr) throw tErr;

  return subjectId!;
}

export async function setTopicCompleted(topicId: string, completed: boolean) {
  const { error } = await supabase
    .from("topics")
    .update({
      completed,
      completed_date: completed ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("topic_id", topicId);
  if (error) throw error;
}

export async function updateTopic(
  topicId: string,
  values: { topic_name: string; estimated_classes: number },
) {
  const { error } = await supabase.from("topics").update(values).eq("topic_id", topicId);
  if (error) throw error;
}

export async function deleteTopic(topicId: string) {
  const { error } = await supabase.from("topics").delete().eq("topic_id", topicId);
  if (error) throw error;
}

export async function addTopic(moduleId: string, position: number) {
  const { error } = await supabase
    .from("topics")
    .insert({ module_id: moduleId, topic_name: "New topic", estimated_classes: 1, position });
  if (error) throw error;
}

export async function updateModule(
  moduleId: string,
  values: { module_number: number; module_name: string; estimated_classes: number },
) {
  const { error } = await supabase.from("modules").update(values).eq("module_id", moduleId);
  if (error) throw error;
}

export async function deleteModule(moduleId: string) {
  const { error } = await supabase.from("modules").delete().eq("module_id", moduleId);
  if (error) throw error;
}

export async function addModule(subjectId: string, moduleNumber: number) {
  const { error } = await supabase
    .from("modules")
    .insert({
      subject_id: subjectId,
      module_number: moduleNumber,
      module_name: "New module",
      estimated_classes: 5,
    });
  if (error) throw error;
}

export async function recordClass(input: {
  subject_id: string;
  module_id: string | null;
  topic_id: string | null;
  class_date: string;
  classes_used: number;
  notes: string;
  markTopicComplete: boolean;
}) {
  const { error } = await supabase.from("class_sessions").insert({
    subject_id: input.subject_id,
    module_id: input.module_id,
    topic_id: input.topic_id,
    class_date: input.class_date,
    classes_used: input.classes_used,
    notes: input.notes,
  });
  if (error) throw error;

  if (input.markTopicComplete && input.topic_id) {
    await setTopicCompleted(input.topic_id, true);
  }
}

export async function updateTeacher(values: {
  name: string;
  department: string;
  photo_url?: string | null;
}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("You are signed out.");
  const { error } = await supabase
    .from("teachers")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("teacher_id", auth.user.id);
  if (error) throw error;
}
