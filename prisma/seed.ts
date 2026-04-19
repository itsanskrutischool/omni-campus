import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const DEMO_PASSWORD = "OmniCampus@123"
const USER_TEST_PHONE = "+919399840394"
const DEMO_OTP = "654321"
const DEMO_EMAILS: Record<string, string> = {
  SUPER_ADMIN: "superadmin@omnicampus.edu.in",
  ADMIN: "admin@omnicampus.edu.in",
  TEACHER: "teacher@omnicampus.edu.in",
  STUDENT: "student@omnicampus.edu.in",
  PARENT: "parent@omnicampus.edu.in",
  RECEPTION: "reception@omnicampus.edu.in",
}

const SCHOOL_PROFILE = {
  name: "Omni Campus Public School",
  slug: "st-xaviers",
  primaryColor: "#0f766e",
  boardMode: "CBSE",
  address: "Sector 18, Knowledge Corridor, Greater Noida West",
  phone: USER_TEST_PHONE,
  email: "hello@omnicampus.edu.in",
  website: "https://omnicampus.edu.in",
  affiliationNo: "2134567",
  schoolCode: "81654",
}

const ACADEMIC_YEAR = {
  name: "2025-26",
  startDate: new Date("2025-04-01"),
  endDate: new Date("2026-03-31"),
}

const CAMPUS_NAME = "Main Campus"

const classroomDefinitions = [
  { name: "Class 6", numeric: 6 },
  { name: "Class 9", numeric: 9 },
]

const scholasticSubjects = [
  ["English", "ENG"],
  ["Hindi", "HIN"],
  ["Mathematics", "MAT"],
  ["Science", "SCI"],
  ["Social Science", "SST"],
  ["Information Technology", "IT"],
] as const

const coScholasticSubjects = [
  ["Work Education", "WE"],
  ["Art Education", "AE"],
  ["Health & Physical Education", "HPE"],
] as const

const examBlueprints = [
  { name: "Term 1 Periodic Test", type: "PERIODIC_TEST", term: 1, maxMarks: 10, start: "2025-07-10", end: "2025-07-12" },
  { name: "Term 1 Notebook Submission", type: "NOTEBOOK_SUBMISSION", term: 1, maxMarks: 5, start: "2025-08-10", end: "2025-08-10" },
  { name: "Term 1 Subject Enrichment", type: "SUBJECT_ENRICHMENT", term: 1, maxMarks: 5, start: "2025-08-18", end: "2025-08-20" },
  { name: "Half Yearly Examination", type: "HALF_YEARLY", term: 1, maxMarks: 80, start: "2025-09-08", end: "2025-09-18" },
  { name: "Term 2 Periodic Test", type: "PERIODIC_TEST", term: 2, maxMarks: 10, start: "2025-12-08", end: "2025-12-10" },
  { name: "Term 2 Notebook Submission", type: "NOTEBOOK_SUBMISSION", term: 2, maxMarks: 5, start: "2026-01-09", end: "2026-01-09" },
  { name: "Term 2 Subject Enrichment", type: "SUBJECT_ENRICHMENT", term: 2, maxMarks: 5, start: "2026-01-18", end: "2026-01-19" },
  { name: "Annual Examination", type: "ANNUAL", term: 2, maxMarks: 80, start: "2026-02-18", end: "2026-03-02" },
] as const

function gradeFromPercentage(percentage: number) {
  if (percentage >= 91) return "A1"
  if (percentage >= 81) return "A2"
  if (percentage >= 71) return "B1"
  if (percentage >= 61) return "B2"
  if (percentage >= 51) return "C1"
  if (percentage >= 41) return "C2"
  if (percentage >= 33) return "D"
  return "E"
}

function scholasticGrade(marks: number, maxMarks: number) {
  return gradeFromPercentage((marks / maxMarks) * 100)
}

function coScholasticGrade(marks: number) {
  if (marks >= 80) return "A"
  if (marks >= 60) return "B"
  return "C"
}

function buildAcademicScore(base: number, variance: number, ceiling: number) {
  return Math.max(0, Math.min(ceiling, Math.round(base + variance)))
}

async function ensureTenant() {
  return prisma.tenant.upsert({
    where: { slug: SCHOOL_PROFILE.slug },
    update: SCHOOL_PROFILE,
    create: SCHOOL_PROFILE,
  })
}

async function ensureAcademicYear(tenantId: string) {
  let year = await prisma.academicYear.findFirst({
    where: { tenantId, name: ACADEMIC_YEAR.name },
  })

  if (year) {
    year = await prisma.academicYear.update({
      where: { id: year.id },
      data: {
        ...ACADEMIC_YEAR,
        isCurrent: true,
      },
    })
  } else {
    year = await prisma.academicYear.create({
      data: {
        ...ACADEMIC_YEAR,
        isCurrent: true,
        tenantId,
      },
    })
  }

  await prisma.academicYear.updateMany({
    where: {
      tenantId,
      id: { not: year.id },
      isCurrent: true,
    },
    data: { isCurrent: false },
  })

  return year
}

async function ensureCampus(tenantId: string) {
  const existingCampus = await prisma.campus.findFirst({
    where: { tenantId, name: CAMPUS_NAME },
  })

  if (existingCampus) {
    return prisma.campus.update({
      where: { id: existingCampus.id },
      data: { name: CAMPUS_NAME },
    })
  }

  return prisma.campus.create({
    data: {
      name: CAMPUS_NAME,
      tenantId,
    },
  })
}

async function ensureUserWithRole(params: {
  role: string
  tenantId: string
  campusId: string
  hashedPassword: string
}) {
  const { role, tenantId, campusId, hashedPassword } = params
  const email = DEMO_EMAILS[role]

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name: `${role.replace("_", " ")} Demo`,
      phone: USER_TEST_PHONE,
      isActive: true,
    },
    create: {
      email,
      password: hashedPassword,
      name: `${role.replace("_", " ")} Demo`,
      phone: USER_TEST_PHONE,
      isActive: true,
    },
  })

  const tenantUser = await prisma.tenantUser.findFirst({
    where: {
      userId: user.id,
      tenantId,
      role,
    },
  })

  if (tenantUser) {
    await prisma.tenantUser.update({
      where: { id: tenantUser.id },
      data: { campusId },
    })
  } else {
    await prisma.tenantUser.create({
      data: {
        userId: user.id,
        tenantId,
        role,
        campusId,
      },
    })
  }

  return user
}

async function ensureExam(params: {
  tenantId: string
  academicYearId: string
  blueprint: (typeof examBlueprints)[number]
}) {
  const { tenantId, academicYearId, blueprint } = params
  const existingExam = await prisma.exam.findFirst({
    where: {
      tenantId,
      academicYearId,
      name: blueprint.name,
      type: blueprint.type,
      term: blueprint.term,
    },
  })

  if (existingExam) {
    return prisma.exam.update({
      where: { id: existingExam.id },
      data: {
        startDate: new Date(blueprint.start),
        endDate: new Date(blueprint.end),
      },
    })
  }

  return prisma.exam.create({
    data: {
      name: blueprint.name,
      type: blueprint.type,
      term: blueprint.term,
      startDate: new Date(blueprint.start),
      endDate: new Date(blueprint.end),
      tenantId,
      academicYearId,
    },
  })
}

async function ensureClassroom(params: {
  tenantId: string
  name: string
  numeric: number
}) {
  const { tenantId, name, numeric } = params
  const existingClassroom = await prisma.classRoom.findFirst({
    where: {
      tenantId,
      name,
    },
  })

  if (existingClassroom) {
    return prisma.classRoom.update({
      where: { id: existingClassroom.id },
      data: { numeric },
    })
  }

  return prisma.classRoom.create({
    data: {
      tenantId,
      name,
      numeric,
    },
  })
}

async function ensureSection(classRoomId: string, name: string) {
  const existingSection = await prisma.section.findFirst({
    where: {
      classRoomId,
      name,
    },
  })

  if (existingSection) {
    return existingSection
  }

  return prisma.section.create({
    data: {
      classRoomId,
      name,
    },
  })
}

async function ensureSubject(params: {
  tenantId: string
  classRoomId: string
  name: string
  code: string
  type: "SCHOLASTIC" | "CO_SCHOLASTIC"
}) {
  const { tenantId, classRoomId, name, code, type } = params
  const existingSubject = await prisma.subject.findFirst({
    where: {
      tenantId,
      classRoomId,
      code,
    },
  })

  if (existingSubject) {
    return prisma.subject.update({
      where: { id: existingSubject.id },
      data: { name, type },
    })
  }

  return prisma.subject.create({
    data: {
      tenantId,
      classRoomId,
      name,
      code,
      type,
    },
  })
}

async function ensureStudent(params: {
  tenantId: string
  campusId: string
  classRoomId: string
  sectionId: string
  classroomNumeric: number
  sectionName: string
  sectionIndex: number
  studentIndex: number
}) {
  const {
    tenantId,
    campusId,
    classRoomId,
    sectionId,
    classroomNumeric,
    sectionName,
    sectionIndex,
    studentIndex,
  } = params

  const serial = `${classroomNumeric}${sectionName}${String(studentIndex).padStart(2, "0")}`
  const isOtpDemoStudent = classroomNumeric === 6 && sectionName === "A" && studentIndex === 1

  return prisma.student.upsert({
    where: {
      admissionNumber: `OCS${serial}`,
    },
    update: {
      tenantId,
      campusId,
      classRoomId,
      sectionId,
      rollNumber: `${sectionIndex * 10 + studentIndex}`,
      name: `Student ${classroomNumeric}-${sectionName}${studentIndex}`,
      gender: studentIndex % 2 === 0 ? "FEMALE" : "MALE",
      dob: new Date(2010 + (10 - classroomNumeric), studentIndex % 12, 10 + studentIndex),
      fatherName: isOtpDemoStudent ? "Demo Guardian" : "Rahul Sharma",
      motherName: isOtpDemoStudent ? "Demo Mother" : "Neha Sharma",
      guardianName: "Primary Guardian",
      guardianPhone: isOtpDemoStudent
        ? USER_TEST_PHONE
        : `+91987654${String(classroomNumeric * 100 + studentIndex).padStart(4, "0")}`,
      phone: isOtpDemoStudent
        ? USER_TEST_PHONE
        : `+91999988${String(classroomNumeric * 100 + studentIndex).padStart(4, "0")}`,
      address: "Greater Noida West",
      admissionStatus: "ADMITTED",
      status: "ACTIVE",
    },
    create: {
      tenantId,
      campusId,
      classRoomId,
      sectionId,
      admissionNumber: `OCS${serial}`,
      rollNumber: `${sectionIndex * 10 + studentIndex}`,
      name: `Student ${classroomNumeric}-${sectionName}${studentIndex}`,
      gender: studentIndex % 2 === 0 ? "FEMALE" : "MALE",
      dob: new Date(2010 + (10 - classroomNumeric), studentIndex % 12, 10 + studentIndex),
      fatherName: isOtpDemoStudent ? "Demo Guardian" : "Rahul Sharma",
      motherName: isOtpDemoStudent ? "Demo Mother" : "Neha Sharma",
      guardianName: "Primary Guardian",
      guardianPhone: isOtpDemoStudent
        ? USER_TEST_PHONE
        : `+91987654${String(classroomNumeric * 100 + studentIndex).padStart(4, "0")}`,
      phone: isOtpDemoStudent
        ? USER_TEST_PHONE
        : `+91999988${String(classroomNumeric * 100 + studentIndex).padStart(4, "0")}`,
      address: "Greater Noida West",
      admissionStatus: "ADMITTED",
      status: "ACTIVE",
    },
  })
}

async function ensureAttendance(studentId: string, studentIndex: number) {
  await prisma.attendanceRecord.createMany({
    data: Array.from({ length: 24 }, (_, day) => ({
      studentId,
      date: new Date(2025, 3, 1 + day),
      status: day % (studentIndex + 5) === 0 ? "ABSENT" : "PRESENT",
    })),
    skipDuplicates: true,
  })
}

async function ensureScholasticMarks(params: {
  studentId: string
  subjectIds: { id: string; name: string }[]
  exams: { id: string; name: string; type: string; term: number }[]
  classroomNumeric: number
  studentIndex: number
}) {
  const { studentId, subjectIds, exams, classroomNumeric, studentIndex } = params

  for (const subject of subjectIds) {
    const subjectVariance = subject.name.length + studentIndex + classroomNumeric
    const markRows = exams.map((exam) => {
      const blueprint = examBlueprints.find((item) => item.name === exam.name)

      if (!blueprint) {
        throw new Error(`Missing exam blueprint for ${exam.name}`)
      }

      const marks = buildAcademicScore(
        blueprint.maxMarks * 0.72,
        (subjectVariance % 7) - 3 + (exam.term === 2 ? 1 : 0),
        blueprint.maxMarks
      )

      return {
        studentId,
        subjectId: subject.id,
        examId: exam.id,
        marks,
        maxMarks: blueprint.maxMarks,
        grade: scholasticGrade(marks, blueprint.maxMarks),
        remarks: exam.type === "ANNUAL" ? "Generated from demo seed" : null,
      }
    })

    await prisma.markEntry.createMany({
      data: markRows,
      skipDuplicates: true,
    })
  }
}

async function ensureCoScholasticMarks(params: {
  studentId: string
  subjectIds: { id: string }[]
  annualExamId: string
  classroomNumeric: number
  studentIndex: number
}) {
  const { studentId, subjectIds, annualExamId, classroomNumeric, studentIndex } = params

  await prisma.markEntry.createMany({
    data: subjectIds.map((subject) => {
      const score = buildAcademicScore(82, (studentIndex + classroomNumeric) % 9 - 4, 100)

      return {
        studentId,
        subjectId: subject.id,
        examId: annualExamId,
        marks: score,
        maxMarks: 100,
        grade: coScholasticGrade(score),
      }
    }),
    skipDuplicates: true,
  })
}

async function ensureGatePass(params: {
  tenantId: string
  studentId: string
  studentName: string
}) {
  const { tenantId, studentId, studentName } = params
  const existingGatePass = await prisma.gatePass.findFirst({
    where: {
      tenantId,
      studentId,
      parentPhone: USER_TEST_PHONE,
      reason: "Demo pickup",
    },
  })

  if (existingGatePass) {
    return prisma.gatePass.update({
      where: { id: existingGatePass.id },
      data: {
        studentName,
        parentName: "Demo Guardian",
        otp: DEMO_OTP,
        otpExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
        status: "REQUESTED",
        verifiedAt: null,
        verifiedBy: null,
        exitTime: null,
        notes: null,
      },
    })
  }

  return prisma.gatePass.create({
    data: {
      tenantId,
      studentId,
      studentName,
      parentName: "Demo Guardian",
      parentPhone: USER_TEST_PHONE,
      otp: DEMO_OTP,
      otpExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      reason: "Demo pickup",
      status: "REQUESTED",
    },
  })
}

async function ensureTransportRoute(tenantId: string) {
  const existingRoute = await prisma.transportRoute.findFirst({
    where: {
      tenantId,
      name: "Route Alpha",
    },
  })

  if (existingRoute) {
    return prisma.transportRoute.update({
      where: { id: existingRoute.id },
      data: {
        stops: "Sector 1, Sector 16B, Knowledge Park",
        vehicle: "UP16 AB 1122",
        driver: "Mahesh Yadav",
      },
    })
  }

  return prisma.transportRoute.create({
    data: {
      tenantId,
      name: "Route Alpha",
      stops: "Sector 1, Sector 16B, Knowledge Park",
      vehicle: "UP16 AB 1122",
      driver: "Mahesh Yadav",
    },
  })
}

async function main() {
  console.log("Ensuring Omni Campus demo data...")

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12)

  const tenant = await ensureTenant()
  const year = await ensureAcademicYear(tenant.id)
  const campus = await ensureCampus(tenant.id)

  const roles = ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT", "RECEPTION"]
  for (const role of roles) {
    await ensureUserWithRole({
      role,
      tenantId: tenant.id,
      campusId: campus.id,
      hashedPassword,
    })
  }

  const exams = await Promise.all(
    examBlueprints.map((blueprint) =>
      ensureExam({
        tenantId: tenant.id,
        academicYearId: year.id,
        blueprint,
      })
    )
  )

  const annualExam = exams.find((exam) => exam.type === "ANNUAL")
  if (!annualExam) {
    throw new Error("Annual exam could not be created.")
  }

  for (const classroomDefinition of classroomDefinitions) {
    const classroom = await ensureClassroom({
      tenantId: tenant.id,
      name: classroomDefinition.name,
      numeric: classroomDefinition.numeric,
    })

    const sections = await Promise.all([
      ensureSection(classroom.id, "A"),
      ensureSection(classroom.id, "B"),
    ])

    const createdScholasticSubjects = await Promise.all(
      scholasticSubjects.map(([name, code]) =>
        ensureSubject({
          tenantId: tenant.id,
          classRoomId: classroom.id,
          name,
          code: `${code}-${classroomDefinition.numeric}`,
          type: "SCHOLASTIC",
        })
      )
    )

    const createdCoScholasticSubjects = await Promise.all(
      coScholasticSubjects.map(([name, code]) =>
        ensureSubject({
          tenantId: tenant.id,
          classRoomId: classroom.id,
          name,
          code: `${code}-${classroomDefinition.numeric}`,
          type: "CO_SCHOLASTIC",
        })
      )
    )

    for (const [sectionIndex, section] of sections.entries()) {
      for (let studentIndex = 1; studentIndex <= 3; studentIndex += 1) {
        const student = await ensureStudent({
          tenantId: tenant.id,
          campusId: campus.id,
          classRoomId: classroom.id,
          sectionId: section.id,
          classroomNumeric: classroomDefinition.numeric,
          sectionName: section.name,
          sectionIndex,
          studentIndex,
        })

        await ensureAttendance(student.id, studentIndex)
        await ensureScholasticMarks({
          studentId: student.id,
          subjectIds: createdScholasticSubjects.map((subject) => ({
            id: subject.id,
            name: subject.name,
          })),
          exams: exams.map((exam) => ({
            id: exam.id,
            name: exam.name,
            type: exam.type,
            term: exam.term,
          })),
          classroomNumeric: classroomDefinition.numeric,
          studentIndex,
        })
        await ensureCoScholasticMarks({
          studentId: student.id,
          subjectIds: createdCoScholasticSubjects.map((subject) => ({
            id: subject.id,
          })),
          annualExamId: annualExam.id,
          classroomNumeric: classroomDefinition.numeric,
          studentIndex,
        })

        if (classroomDefinition.numeric === 6 && section.name === "A" && studentIndex === 1) {
          await ensureGatePass({
            tenantId: tenant.id,
            studentId: student.id,
            studentName: student.name,
          })
        }
      }
    }
  }

  await ensureTransportRoute(tenant.id)

  const [classCount, sectionCount, studentCount, examCount, markCount, gatePassCount, attendanceCount] =
    await Promise.all([
      prisma.classRoom.count({ where: { tenantId: tenant.id } }),
      prisma.section.count({ where: { classRoom: { tenantId: tenant.id } } }),
      prisma.student.count({ where: { tenantId: tenant.id } }),
      prisma.exam.count({ where: { tenantId: tenant.id } }),
      prisma.markEntry.count({ where: { student: { tenantId: tenant.id } } }),
      prisma.gatePass.count({ where: { tenantId: tenant.id } }),
      prisma.attendanceRecord.count({ where: { student: { tenantId: tenant.id } } }),
    ])

  console.log("Demo seed complete.")
  console.log(`Tenant slug: ${tenant.slug}`)
  console.log(`Demo password: ${DEMO_PASSWORD}`)
  console.log(`OTP demo phone: ${USER_TEST_PHONE}`)
  console.log(`Sample OTP for gate pass demo: ${DEMO_OTP}`)
  console.log(
    `Counts -> classes: ${classCount}, sections: ${sectionCount}, students: ${studentCount}, exams: ${examCount}, marks: ${markCount}, gatePasses: ${gatePassCount}, attendance: ${attendanceCount}`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
