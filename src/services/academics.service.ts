// src/services/academics.service.ts

import { prisma } from "@/lib/prisma"

export interface SyllabusProgress {
  id: string
  subject: string
  grade: string
  completion: number
  status: "ON_TRACK" | "DELAYED" | "COMPLETED"
  lastLesson: string
}

export interface AcademicQuery {
  tenantId: string
  campusId?: string
}

type AcademicYearPayload = {
  name: string
  startDate: Date | string
  endDate: Date | string
  isCurrent?: boolean
}

type ClassRoomPayload = {
  name: string
  numeric: number
}

type SectionPayload = {
  name: string
}

const LESSONS = [
  "Foundational Concepts",
  "Advanced Patterns",
  "Strategic Applications",
  "Systems Integration",
  "Dynamic Analysis",
  "Global Perspectives",
] as const

export class AcademicsService {
  static async assertAcademicYearAccess(tenantId: string, id: string) {
    const academicYear = await prisma.academicYear.findFirst({
      where: { id, tenantId },
      select: { id: true },
    })

    if (!academicYear) {
      throw new Error("Academic year not found")
    }
  }

  static async assertClassRoomAccess(tenantId: string, id: string) {
    const classroom = await prisma.classRoom.findFirst({
      where: { id, tenantId },
      select: { id: true },
    })

    if (!classroom) {
      throw new Error("Classroom not found")
    }
  }

  static async assertSectionAccess(tenantId: string, id: string) {
    const section = await prisma.section.findFirst({
      where: {
        id,
        classRoom: { tenantId },
      },
      select: { id: true },
    })

    if (!section) {
      throw new Error("Section not found")
    }
  }

  /**
   * Fetches the trajectory of all subjects and identifies syllabus health.
   * Uses deterministic mock progression so the dashboard stays stable between refreshes.
   */
  static async getCurriculumTrajectory(query: AcademicQuery): Promise<SyllabusProgress[]> {
    const subjects = await prisma.subject.findMany({
      where: {
        tenantId: query.tenantId,
      },
      include: {
        classroom: true,
      },
      orderBy: [
        { classroom: { numeric: "asc" } },
        { name: "asc" },
      ],
    })

    return subjects.map((subject) => {
      const idNum = parseInt(subject.id.replace(/\D/g, ""), 10) || 0
      const completion = (idNum % 60) + 40
      const status: SyllabusProgress["status"] =
        completion === 100 ? "COMPLETED" : completion < 55 ? "DELAYED" : "ON_TRACK"
      const lastLesson = LESSONS[idNum % LESSONS.length]

      return {
        id: subject.id,
        subject: subject.name,
        grade: subject.classroom?.name || "Unassigned",
        completion,
        status,
        lastLesson,
      }
    })
  }

  /**
   * Aggregates global academic metrics.
   */
  static async getAcademicStats(query: AcademicQuery) {
    const trajectory = await this.getCurriculumTrajectory(query)

    const avgCompletion =
      trajectory.length > 0
        ? trajectory.reduce((acc, curr) => acc + curr.completion, 0) / trajectory.length
        : 0

    const delayed = trajectory.filter((item) => item.status === "DELAYED").length
    const totalStreams = trajectory.length

    return {
      globalProgress: `${avgCompletion.toFixed(1)}%`,
      courseVectors: totalStreams,
      syllabusAlerts: delayed,
      qualityIndex: "9.8",
    }
  }

  static async getAcademicYears(tenantId: string) {
    return prisma.academicYear.findMany({
      where: { tenantId },
      orderBy: { startDate: "desc" },
    })
  }

  static async createAcademicYear(tenantId: string, data: AcademicYearPayload) {
    return prisma.academicYear.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        tenantId,
      },
    })
  }

  static async updateAcademicYear(tenantId: string, id: string, data: Partial<AcademicYearPayload>) {
    await this.assertAcademicYearAccess(tenantId, id)

    return prisma.academicYear.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })
  }

  static async deleteAcademicYear(tenantId: string, id: string) {
    await this.assertAcademicYearAccess(tenantId, id)

    return prisma.academicYear.delete({
      where: { id },
    })
  }

  static async getClassRooms(tenantId: string) {
    return prisma.classRoom.findMany({
      where: { tenantId },
      include: {
        sections: true,
        subjects: true,
      },
      orderBy: { numeric: "asc" },
    })
  }

  static async createClassRoom(tenantId: string, data: ClassRoomPayload) {
    return prisma.classRoom.create({
      data: {
        ...data,
        tenantId,
      },
    })
  }

  static async updateClassRoom(tenantId: string, id: string, data: Partial<ClassRoomPayload>) {
    await this.assertClassRoomAccess(tenantId, id)

    return prisma.classRoom.update({
      where: { id },
      data,
    })
  }

  static async deleteClassRoom(tenantId: string, id: string) {
    await this.assertClassRoomAccess(tenantId, id)

    return prisma.classRoom.delete({
      where: { id },
    })
  }

  static async getSections(classId: string) {
    return prisma.section.findMany({
      where: { classRoomId: classId },
      orderBy: { name: "asc" },
    })
  }

  static async createSection(tenantId: string, classId: string, data: SectionPayload) {
    await this.assertClassRoomAccess(tenantId, classId)

    return prisma.section.create({
      data: {
        ...data,
        classRoomId: classId,
      },
    })
  }

  static async updateSection(tenantId: string, id: string, data: Partial<SectionPayload>) {
    await this.assertSectionAccess(tenantId, id)

    return prisma.section.update({
      where: { id },
      data,
    })
  }

  static async deleteSection(tenantId: string, id: string) {
    await this.assertSectionAccess(tenantId, id)

    return prisma.section.delete({
      where: { id },
    })
  }

  static async getSubjects(tenantId: string) {
    return prisma.subject.findMany({
      where: { tenantId },
      include: { classroom: true },
      orderBy: [
        { classroom: { numeric: "asc" } },
        { name: "asc" },
      ],
    })
  }
}
