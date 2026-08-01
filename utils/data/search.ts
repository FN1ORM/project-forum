import { createClient } from '@/utils/supabase/server'

export async function searchQuestions(query: string, pageNumber: number = 1, pageSize: number = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('search_questions', {
    search_term: query,
    page_number: pageNumber,
    page_size: pageSize
  })
  
  if (error) {
    console.error('Search error:', error)
    return { questions: [], totalCount: 0 }
  }

  if (!data || data.length === 0) {
    return { questions: [], totalCount: 0 }
  }

  // The RPC returns a flattened structure. 
  // We map it to match the standard Question shape expected by the UI.
  const questions = data.map((q: any) => ({
    id: q.id,
    title: q.title,
    body: q.body,
    created_at: q.created_at,
    subject_id: q.subject_id,
    is_solved: q.is_solved,
    solved_at: q.solved_at,
    solved_by: q.solved_by,
    author_id: q.author_id,
    author: { display_name: q.author_display_name },
    subjects: { name: q.subject_name, slug: q.subject_slug },
    solver: q.solver_display_name ? { display_name: q.solver_display_name } : null,
    voteCount: Number(q.vote_count) || 0
  }))

  const totalCount = Number(data[0].total_count) || 0

  return { questions, totalCount }
}
