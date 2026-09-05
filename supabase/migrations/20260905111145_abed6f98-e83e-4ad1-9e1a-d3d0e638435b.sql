CREATE TABLE public.teachers (
  teacher_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  setup_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teachers_own" ON public.teachers FOR ALL TO authenticated
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

CREATE TABLE public.subjects (
  subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  semester TEXT NOT NULL DEFAULT '',
  academic_year TEXT NOT NULL DEFAULT '',
  total_classes INTEGER NOT NULL DEFAULT 0,
  classes_per_week INTEGER NOT NULL DEFAULT 3,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subjects_own" ON public.subjects FOR ALL TO authenticated
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE INDEX subjects_teacher_idx ON public.subjects(teacher_id);

CREATE TABLE public.modules (
  module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(subject_id) ON DELETE CASCADE,
  module_number INTEGER NOT NULL DEFAULT 1,
  module_name TEXT NOT NULL DEFAULT '',
  estimated_classes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules_own" ON public.modules FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.subjects s WHERE s.subject_id = modules.subject_id AND s.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.subjects s WHERE s.subject_id = modules.subject_id AND s.teacher_id = auth.uid()));
CREATE INDEX modules_subject_idx ON public.modules(subject_id);

CREATE TABLE public.topics (
  topic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(module_id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL DEFAULT '',
  estimated_classes INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topics TO authenticated;
GRANT ALL ON public.topics TO service_role;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics_own" ON public.topics FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.modules m JOIN public.subjects s ON s.subject_id = m.subject_id WHERE m.module_id = topics.module_id AND s.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.modules m JOIN public.subjects s ON s.subject_id = m.subject_id WHERE m.module_id = topics.module_id AND s.teacher_id = auth.uid()));
CREATE INDEX topics_module_idx ON public.topics(module_id);

CREATE TABLE public.class_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(subject_id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(module_id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(topic_id) ON DELETE SET NULL,
  class_date DATE NOT NULL DEFAULT current_date,
  classes_used INTEGER NOT NULL DEFAULT 1,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_sessions TO authenticated;
GRANT ALL ON public.class_sessions TO service_role;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_own" ON public.class_sessions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.subjects s WHERE s.subject_id = class_sessions.subject_id AND s.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.subjects s WHERE s.subject_id = class_sessions.subject_id AND s.teacher_id = auth.uid()));
CREATE INDEX sessions_subject_idx ON public.class_sessions(subject_id);

CREATE OR REPLACE FUNCTION public.handle_new_teacher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.teachers (teacher_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (teacher_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_teacher();