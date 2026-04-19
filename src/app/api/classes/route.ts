import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const classes = await prisma.classRoom.findMany({
      where: { tenantId: session.user.tenantId },
      include: { sections: true },
      orderBy: { numeric: "asc" },
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error("[CLASSES_API] Error fetching classes:", error)
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
  }
}

type SingleClassPayload = {
  mode?: "single"
  name: string
  numeric: number
  sections?: string[]
}

type BulkClassPayload = {
  mode: "bulk"
  rows: Array<{
    name: string
    numeric: number
    sections?: string[] | string
  }>
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["ADMIN", "SUPER_ADMIN", "RECEPTION"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = (await req.json()) as SingleClassPayload | BulkClassPayload

    if (body.mode === "bulk") {
      const rows = Array.isArray(body.rows) ? body.rows : []
      const result = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[],
      }

      for (const [index, row] of rows.entries()) {
        const name = row.name?.trim()
        const numeric = Number(row.numeric)
        const sections = Array.isArray(row.sections)
          ? row.sections
          : typeof row.sections === "string"
            ? row.sections
                .split("|")
                .map((item) => item.trim())
                .filter(Boolean)
            : []

        if (!name || Number.isNaN(numeric)) {
          result.errors.push(`Row ${index + 1}: invalid class name or numeric value`)
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
          result.imported += 1
          continue
        }

        const existingSectionNames = new Set(existing.sections.map((section) => section.name.toLowerCase()))
        const missingSections = sections.filter((sectionName) => !existingSectionNames.has(sectionName.toLowerCase()))

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
          result.updated += 1
        } else {
          result.skipped += 1
        }
      }

      return NextResponse.json({
        success: true,
        message: "Bulk class import processed",
        ...result,
      })
    }

    const name = body.name?.trim()
    const numeric = Number(body.numeric)
    const sections = Array.isArray(body.sections) ? body.sections.map((item) => item.trim()).filter(Boolean) : []

    if (!name || Number.isNaN(numeric)) {
      return NextResponse.json({ error: "Name and numeric are required" }, { status: 400 })
    }

    const exists = await prisma.classRoom.findFirst({
      where: { tenantId: session.user.tenantId, numeric },
      select: { id: true },
    })

    if (exists) {
      return NextResponse.json({ error: "A class with this numeric value already exists" }, { status: 409 })
    }

    const created = await prisma.classRoom.create({
      data: {
        tenantId: session.user.tenantId,
        name,
        numeric,
        sections: {
          create: sections.map((sectionName) => ({ name: sectionName })),
        },
      },
      include: { sections: true },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("[CLASSES_API] Error creating classes:", error)
    return NextResponse.json({ error: "Failed to create classes" }, { status: 500 })
  }
}
