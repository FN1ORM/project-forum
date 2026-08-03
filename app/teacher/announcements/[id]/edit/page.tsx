import { notFound } from 'next/navigation'
import { getAnnouncementById } from '@/utils/data/announcements'
import { AnnouncementForm } from '@/components/teacher/AnnouncementForm'

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const announcement = await getAnnouncementById(id)
    
    return (
      <div className="flex flex-col gap-6">
        <AnnouncementForm initialData={announcement} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
