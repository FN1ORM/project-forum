import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

export async function createAttachment(file: File, questionId: string | null, answerId: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthenticated")

  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB')
  }
  
  const uuid = crypto.randomUUID()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  let storagePath = ''
  if (questionId) {
    storagePath = `questions/${questionId}/${uuid}-${sanitizedName}`
  } else if (answerId) {
    storagePath = `answers/${answerId}/${uuid}-${sanitizedName}`
  } else {
    throw new Error("Must provide questionId or answerId")
  }
  
  const { error: storageError } = await supabase.storage
    .from('attachments')
    .upload(storagePath, file)
    
  if (storageError) throw new Error(`Storage upload failed: ${storageError.message}`)

  const { data, error } = await supabase
    .from('attachments')
    .insert({
      question_id: questionId,
      answer_id: answerId,
      uploaded_by: user.id,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      file_size: file.size
    })
    .select()
    .single()

  if (error) {
    await supabase.storage.from('attachments').remove([storagePath])
    throw new Error(`Failed to save attachment metadata: ${error.message}`)
  }
  return data
}

async function attachSignedUrls(attachments: any[]) {
  if (attachments.length === 0) return []
  const supabase = await createClient()
  const paths = attachments.map(a => a.storage_path)
  
  // Signed URLs strictly generated ONLY for the attachments being returned for rendering
  const { data, error } = await supabase.storage.from('attachments').createSignedUrls(paths, 60 * 60)
  
  if (error || !data) return attachments.map(a => ({ ...a, signedUrl: null }))
  
  return attachments.map((att, i) => ({
    ...att,
    signedUrl: data[i]?.signedUrl || null
  }))
}

export async function getQuestionAttachments(questionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true })
    
  if (error) throw new Error(error.message)
  return attachSignedUrls(data)
}

export async function getAnswerAttachments(answerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('answer_id', answerId)
    .order('created_at', { ascending: true })
    
  if (error) throw new Error(error.message)
  return attachSignedUrls(data)
}

export async function deleteAttachment(attachmentId: string) {
  const supabase = await createClient()
  
  const { data: att } = await supabase.from('attachments').select('storage_path').eq('id', attachmentId).single()
  if (!att) return

  await supabase.storage.from('attachments').remove([att.storage_path])
  
  const { error } = await supabase.from('attachments').delete().eq('id', attachmentId)
  if (error) throw new Error(error.message)
}
