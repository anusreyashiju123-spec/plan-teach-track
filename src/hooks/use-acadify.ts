import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { acadifyKeys, fetchSyllabus, fetchTeacher } from "@/lib/syllabus";

export function useTeacher() {
  return useQuery({ queryKey: acadifyKeys.teacher, queryFn: fetchTeacher });
}

export function useSyllabus() {
  return useQuery({ queryKey: acadifyKeys.syllabus, queryFn: fetchSyllabus });
}

export function useAcadifyRefresh() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: acadifyKeys.teacher });
    queryClient.invalidateQueries({ queryKey: acadifyKeys.syllabus });
  };
}

export function useAcadifyMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const refresh = useAcadifyRefresh();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => refresh(),
  });
}
