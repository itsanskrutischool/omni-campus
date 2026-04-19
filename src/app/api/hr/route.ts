import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/hr
 * Returns staff with department, designation, and payroll data for the current tenant.
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tenantId = session.user.tenantId

  try {
    
    const [staff, departments, designations] = await Promise.all([
      prisma.staff.findMany({
        where: { tenantId },
        include: {
          department: true,
          designation: true,
          payrolls: {
            orderBy: [{ year: "desc" }, { month: "desc" }],
            take: 1,
          },
        },
        orderBy: { empId: "asc" },
      }),
      prisma.department.findMany({
        where: { tenantId },
        include: {
          _count: { select: { staff: true } },
        },
      }),
      prisma.designation.findMany({
        where: { tenantId },
      }),
    ])

    console.log(`[API_HR] Success: Found ${staff.length} staff and ${departments.length} departments`)
    return NextResponse.json({ staff, departments, designations })
  } catch (error: any) {
    console.error(`[API_HR] Fetch error for tenant ${tenantId}:`, {
      message: error.message,
      stack: error.stack,
      code: error.code // Prisma error code
    })
    return NextResponse.json(
      { error: "Failed to fetch HR data", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/hr
 * Create a staff member, creating department/designation masters if required.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tenantId = session.user.tenantId
    const body = await req.json()
    const {
      name,
      email,
      phone,
      role,
      departmentName,
      designationName,
      joinDate,
      basicSalary,
      status = "ACTIVE",
    } = body

    if (!name || !email || !phone || !role || !joinDate) {
      return NextResponse.json({ error: "name, email, phone, role, and joinDate are required" }, { status: 400 })
    }

    const [count, foundDepartment, foundDesignation] = await Promise.all([
      prisma.staff.count({ where: { tenantId } }),
      departmentName
        ? prisma.department.findFirst({
            where: { tenantId, name: { equals: String(departmentName).trim(), mode: "insensitive" } },
          })
        : Promise.resolve(null),
      designationName
        ? prisma.designation.findFirst({
            where: { tenantId, name: { equals: String(designationName).trim(), mode: "insensitive" } },
          })
        : Promise.resolve(null),
    ])

    const ensuredDepartment =
      foundDepartment ||
      (departmentName
        ? await prisma.department.create({
            data: {
              tenantId,
              name: String(departmentName).trim(),
            },
          })
        : null)

    const ensuredDesignation =
      foundDesignation ||
      (designationName
        ? await prisma.designation.create({
            data: {
              tenantId,
              name: String(designationName).trim(),
            },
          })
        : null)

    const empId = `EMP${String(count + 1).padStart(4, "0")}`

    const staff = await prisma.staff.create({
      data: {
        tenantId,
        empId,
        name: String(name).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        role: String(role).trim(),
        departmentId: ensuredDepartment?.id || null,
        designationId: ensuredDesignation?.id || null,
        joinDate: new Date(joinDate),
        basicSalary: basicSalary ? Number(basicSalary) : null,
        status,
      },
      include: {
        department: true,
        designation: true,
      },
    })

    return NextResponse.json(staff, { status: 201 })
  } catch (error: any) {
    console.error("[API_HR] Create error:", error)
    return NextResponse.json({ error: error.message || "Failed to create staff" }, { status: 500 })
  }
}
