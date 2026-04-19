import { NextRequest, NextResponse } from "next/server"
import { PayrollService } from "@/services/payroll.service"
import { generateBulkPayrollSchema, updatePayrollStatusSchema, createPayHeadSchema } from "@/lib/validation"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

// GET /api/payroll - Get all payrolls or statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")
    const stats = searchParams.get("stats")
    const staffId = searchParams.get("staffId")

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    if (stats === "true") {
      const monthParam = searchParams.get("month")
      const yearParam = searchParams.get("year")
      const month = monthParam ? parseInt(monthParam, 10) : new Date().getMonth() + 1
      const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()
      const result = await PayrollService.getPayrollStatistics(tenantId, month, year)
      return NextResponse.json(result)
    }

    if (staffId) {
      const result = await PayrollService.getStaffSalaryStructure(tenantId, staffId)
      return NextResponse.json(result)
    }

    const month = parseInt(searchParams.get("month") || "0")
    const year = parseInt(searchParams.get("year") || "0")

    const result = await PayrollService.getPayrolls(tenantId, { month, year })
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/payroll - Create payroll or generate bulk payroll
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const limitId = forwarded ? forwarded.split(",")[0]?.trim() : (realIp ?? "anonymous")
    const limitResult = rateLimit(limitId)

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(limitResult),
        }
      )
    }

    const body = await request.json()
    const { tenantId, action, ...data } = body

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    switch (action) {
      case "createPayHead":
        const validatedPayHead = createPayHeadSchema.parse(body)
        const payHead = await PayrollService.createPayHead(tenantId, data)
        return NextResponse.json(payHead)

      case "createSalaryTemplate":
        const salaryTemplate = await PayrollService.createSalaryTemplate(tenantId, data)
        return NextResponse.json(salaryTemplate)

      case "assignSalaryStructure":
        const salaryStructure = await PayrollService.assignSalaryStructure(tenantId, data)
        return NextResponse.json(salaryStructure)

      case "generatePayroll":
        const payroll = await PayrollService.generatePayroll(tenantId, data)
        return NextResponse.json(payroll)

      case "generateBulkPayroll":
        const validatedBulk = generateBulkPayrollSchema.parse(body)
        const bulkPayroll = await PayrollService.generateBulkPayroll(tenantId, data.month, data.year)
        return NextResponse.json(bulkPayroll)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/payroll - Update payroll status
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const limitId = forwarded ? forwarded.split(",")[0]?.trim() : (realIp ?? "anonymous")
    const limitResult = rateLimit(limitId)

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(limitResult),
        }
      )
    }

    const body = await request.json()
    const validated = updatePayrollStatusSchema.parse(body)
    const { tenantId, payrollId, status } = body

    if (!tenantId || !payrollId || !status) {
      return NextResponse.json({ error: "Tenant ID, payroll ID, and status are required" }, { status: 400 })
    }

    const result = await PayrollService.updatePayrollStatus(tenantId, payrollId, status)
    return NextResponse.json(result)
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
