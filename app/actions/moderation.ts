'use server'

import { submitReport, updateReportStatus, toggleQuestionHidden, toggleAnswerHidden, toggleUserSuspension } from '@/utils/data/moderation'
import { revalidatePath } from 'next/cache'

export async function submitReportAction(formData: FormData) {
  const targetType = formData.get('targetType') as 'question' | 'answer'
  const targetId = formData.get('targetId') as string
  const reason = formData.get('reason') as string
  const description = formData.get('description') as string

  try {
    await submitReport({
      questionId: targetType === 'question' ? targetId : undefined,
      answerId: targetType === 'answer' ? targetId : undefined,
      reason,
      description
    })
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function updateReportStatusAction(formData: FormData) {
  const reportId = formData.get('reportId') as string
  const status = formData.get('status') as 'open' | 'dismissed' | 'resolved'
  await updateReportStatus(reportId, status)
  revalidatePath('/admin/moderation')
}

export async function toggleContentHiddenAction(formData: FormData) {
  const type = formData.get('type') as 'question' | 'answer'
  const id = formData.get('id') as string
  const isHidden = formData.get('isHidden') === 'true'
  if (type === 'question') {
    await toggleQuestionHidden(id, isHidden)
  } else {
    await toggleAnswerHidden(id, isHidden)
  }
  revalidatePath('/admin/moderation')
}

export async function toggleUserSuspensionAction(formData: FormData) {
  const userId = formData.get('userId') as string
  const isSuspended = formData.get('isSuspended') === 'true'
  await toggleUserSuspension(userId, isSuspended)
  revalidatePath('/admin/moderation')
}
