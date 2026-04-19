import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createStudent } from "@/services/student.service"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await req.json()
    const type = payload?.type
    const rows = Array.isArray(payload?.rows) ? payload.rows : []

    if (!type || rows.length === 0) {
      return NextResponse.json({ error: "Import type and rows are required" }, { status: 400 })
    }

    if (type === "CLASSROOMS") {
      let imported = 0
      let updated = 0
      let skipped = 0
      const errors: string[] = []

      for (const [index, row] of rows.entries()) {
        const name = String(row.name || row.className || "").trim()
        const numeric = Number(row.numeric || row.classNumeric)
        const sections = String(row.sections || "")
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean)

        if (!name || Number.isNaN(numeric)) {
          errors.push(`Row ${index + 1}: invalid class payload`)
          continue
        }

        const existing = await prisma.classRoom.findFirst({
          where: { tenantId: session.user.tenantId, numeric },
          include: { sections: true },
        })

        if (!existing) {
          await prisma.classRoom.create({
            data: {
              tenantId: session.user.tenantId,
              name,
              numeric,
              sections: {
                create: sections.map((sectionName) => ({ name: sectionName })),
              },
            },
          })
          imported += 1
          continue
        }

        const knownSections = new Set(existing.sections.map((section) => section.name.toLowerCase()))
        const missingSections = sections.filter((sectionName) => !knownSections.has(sectionName.toLowerCase()))

        await prisma.classRoom.update({
          where: { id: existing.id },
          data: {
            name,
            sections: {
              create: missingSections.map((sectionName) => ({ name: sectionName })),
            },
          },
        })

        if (missingSections.length > 0 || existing.name !== name) {
          updated += 1
        } else {
          skipped += 1
        }
      }

      return NextResponse.json({
        success: true,
        imported,
        updated,
        skipped,
        errors,
        message: "Classroom import completed",
      })
    }

    if (type === "STUDENTS") {
      let imported = 0
      let skipped = 0
      const errors: string[] = []

      for (const [index, row] of rows.entries()) {
        const studentName = String(row.name || "").trim()
        const dob = String(row.dob || row.dateOfBirth || "").trim()
        const phone = String(row.phone || row.mobile || "").trim()
        const gender = String(row.gender || "").trim().toUpperCase()
        const fatherName = String(row.fatherName || row.father || "").trim()
        const motherName = String(row.motherName || row.mother || "").trim()

        if (!studentName || !dob || !phone || !gender || !fatherName || !motherName) {
          skipped += 1
          errors.push(`Row ${index + 1}: missing one of name/dob/phone/gender/fatherName/motherName`)
          continue
        }

        const className = String(row.className || row.class || "").trim()
        const sectionName = String(row.sectionName || row.section || "").trim()

        const classroom = className
          ? await prisma.classRoom.findFirst({
              where: {
                tenantId: session.user.tenantId,
                OR: [
                  { name: { equals: className, mode: "insensitive" } },
                  ...(Number.isNaN(Number(className)) ? [] : [{ numeric: Number(className) }]),
                ],
              },
            })
          : null

        const section =
          classroom && sectionName
            ? await prisma.section.findFirst({
                where: {
                  classRoomId: classroom.id,
                  name: { equals: sectionName, mode: "insensitive" },
                },
              })
            : null

        try {
          await createStudent({
            tenantId: session.user.tenantId,
            campusId: session.user.campusId || undefined,
            name: studentName,
            gender,
            dob,
            fatherName,
            motherName,
            guardianName: row.guardianName || undefined,
            guardianPhone: row.guardianPhone || undefined,
            phone,
            emergencyContact: row.emergencyContact || undefined,
            classRoomId: classroom?.id,
            sectionId: section?.id || undefined,
            previousSchool: row.previousSchool || undefined,
            admissionStatus: row.admissionStatus || "ADMITTED",
            address: row.address || undefined,
            bloodGroup: row.bloodGroup || undefined,
            category: row.category || "GENERAL",
            religion: row.religion || undefined,
            aadhaar: row.aadhaar || undefined,
            pen: row.pen || undefined,
            notes: row.notes || "Imported via migration center",
          })
          imported += 1
        } catch (error: any) {
          skipped += 1
          errors.push(`Row ${index + 1}: ${error.message || "student import failed"}`)
        }
      }

      return NextResponse.json({
        success: true,
        imported,
        skipped,
        errors,
        message: "Student import completed",
      })
    }

    if (type === "TRANSPORT_ROUTES") {
      let imported = 0
      let updated = 0
      const errors: string[] = []

      for (const [index, row] of rows.entries()) {
        const name = String(row.name || row.routeName || "").trim()
        const stops = String(row.stops || "").trim()
        const vehicle = String(row.vehicle || "").trim()
        const driver = String(row.driver || "").trim()

        if (!name || !stops) {
          errors.push(`Row ${index + 1}: name and stops are required`)
          continue
        }

        const existing = await prisma.transportRoute.findFirst({
          where: { tenantId: session.user.tenantId, name: { equals: name, mode: "insensitive" } },
        })

        if (!existing) {
          await prisma.transportRoute.create({
            data: {
              tenantId: session.user.tenantId,
              name,
              stops,
              vehicle: vehicle || null,
              driver: driver || null,
            },
          })
          imported += 1
          continue
        }

        await prisma.transportRoute.update({
          where: { id: existing.id },
          data: {
            stops,
            vehicle: vehicle || null,
            driver: driver || null,
          },
        })
        updated += 1
      }

      return NextResponse.json({
        success: true,
        imported,
        updated,
        errors,
        message: "Transport route import completed",
      })
    }

    if (type === "STAFF") {
      let imported = 0
      let skipped = 0
      const errors: string[] = []

      for (const [index, row] of rows.entries()) {
        const name = String(row.name || "").trim()
        const email = String(row.email || "").trim()
        const phone = String(row.phone || "").trim()
        const role = String(row.role || "").trim()
        const joinDate = String(row.joinDate || "").trim()
        const departmentName = String(row.departmentName || row.department || "").trim()
        const designationName = String(row.designationName || row.designation || "").trim()

        if (!name || !email || !phone || !role || !joinDate) {
          skipped += 1
          errors.push(`Row ${index + 1}: missing one of name/email/phone/role/joinDate`)
          continue
        }

        try {
          let department = departmentName
            ? await prisma.department.findFirst({
                where: { tenantId: session.user.tenantId, name: { equals: departmentName, mode: "insensitive" } },
              })
            : null

          if (!department && departmentName) {
            department = await prisma.department.create({
              data: {
                tenantId: session.user.tenantId,
                name: departmentName,
              },
            })
          }

          let designation = designationName
            ? await prisma.designation.findFirst({
                where: { tenantId: session.user.tenantId, name: { equals: designationName, mode: "insensitive" } },
              })
            : null

          if (!designation && designationName) {
            designation = await prisma.designation.create({
              data: {
                tenantId: session.user.tenantId,
                name: designationName,
              },
            })
          }

          const existing = await prisma.staff.findFirst({
            where: { tenantId: session.user.tenantId, email: { equals: email, mode: "insensitive" } },
          })

          if (existing) {
            skipped += 1
            errors.push(`Row ${index + 1}: staff with this email already exists`)
            continue
          }

          const count = await prisma.staff.count({ where: { tenantId: session.user.tenantId } })
          await prisma.staff.create({
            data: {
              tenantId: session.user.tenantId,
              empId: `EMP${String(count + 1).padStart(4, "0")}`,
              name,
              email,
              phone,
              role,
              joinDate: new Date(joinDate),
              basicSalary: row.basicSalary ? Number(row.basicSalary) : null,
              status: row.status || "ACTIVE",
              departmentId: department?.id || null,
              designationId: designation?.id || null,
            },
          })

          imported += 1
        } catch (error: any) {
          skipped += 1
          errors.push(`Row ${index + 1}: ${error.message || "staff import failed"}`)
        }
      }

      return NextResponse.json({
        success: true,
        imported,
        skipped,
        errors,
        message: "Staff import completed",
      })
    }

    if (type === "FEE_STRUCTURES") {
      const academicYear =
        (await prisma.academicYear.findFirst({
          where: { tenantId: session.user.tenantId, isCurrent: true },
          orderBy: { startDate: "desc" },
        })) ||
        (await prisma.academicYear.findFirst({
          where: { tenantId: session.user.tenantId },
          orderBy: { startDate: "desc" },
        }))

      if (!academicYear) {
        return NextResponse.json({ error: "No academic year configured for fee import" }, { status: 400 })
      }

      let imported = 0
      let updated = 0
      const errors: string[] = []

      for (const [index, row] of rows.entries()) {
        const name = String(row.name || "").trim()
        const frequency = String(row.frequency || "").trim()
        const amount = Number(row.amount)
        const category = String(row.category || "").trim()
        const className = String(row.className || row.class || "").trim()

        if (!name || !frequency || Number.isNaN(amount)) {
          errors.push(`Row ${index + 1}: name, frequency, and amount are required`)
          continue
        }

        const classroom = className
          ? await prisma.classRoom.findFirst({
              where: {
                tenantId: session.user.tenantId,
                OR: [
                  { name: { equals: className, mode: "insensitive" } },
                  ...(Number.isNaN(Number(className)) ? [] : [{ numeric: Number(className) }]),
                ],
              },
            })
          : null

        const existing = await prisma.feeStructure.findFirst({
          where: {
            tenantId: session.user.tenantId,
            academicYearId: academicYear.id,
            name: { equals: name, mode: "insensitive" },
            classId: classroom?.id || null,
          },
        })

        if (!existing) {
          await prisma.feeStructure.create({
            data: {
              tenantId: session.user.tenantId,
              academicYearId: academicYear.id,
              name,
              amount,
              frequency,
              category: category || null,
              classId: classroom?.id || null,
            },
          })
          imported += 1
          continue
        }

        await prisma.feeStructure.update({
          where: { id: existing.id },
          data: {
            amount,
            frequency,
            category: category || null,
            classId: classroom?.id || null,
          },
        })
        updated += 1
      }

      return NextResponse.json({
        success: true,
        imported,
        updated,
        academicYear: academicYear.name,
        errors,
        message: "Fee structure import completed",
      })
    }

    return NextResponse.json({ error: "Unsupported import type" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
