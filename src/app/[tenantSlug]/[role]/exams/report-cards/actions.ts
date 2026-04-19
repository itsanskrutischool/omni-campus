"use server"

import { ExamService } from "@/services/exam.service"
import { auth } from "@/lib/auth"

export async function getDetailedReportAction(studentId: string) {
  const session = await auth()
  if (!session?.user?.tenantId) throw new Error("Unauthorized")

  return await ExamService.getDetailedCBSEData(session.user.tenantId, studentId)
}
