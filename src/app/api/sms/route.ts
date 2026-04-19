import { NextRequest, NextResponse } from "next/server"
import { SMSService } from "@/services/sms.service"
import { requireAuth } from "@/lib/api-middleware"

// POST /api/sms/send - Send SMS
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const tenantId = body.tenantId || auth.user.tenants[0]?.id

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    if (body.action === "send-single") {
      const result = await SMSService.sendSMS(tenantId, auth.user.id, {
        to: body.to,
        body: body.body,
        template: body.template,
        variables: body.variables,
      })
      return NextResponse.json(result)
    }

    if (body.action === "send-bulk") {
      const result = await SMSService.sendBulkSMS(tenantId, auth.user.id, body.messages)
      return NextResponse.json(result)
    }

    if (body.action === "use-template") {
      const result = await SMSService.useTemplate(
        tenantId,
        auth.user.id,
        body.templateId,
        body.phone,
        body.variables
      )
      return NextResponse.json(result)
    }

    if (body.action === "fee-reminders") {
      const result = await SMSService.sendFeeReminders(tenantId, auth.user.id)
      return NextResponse.json(result)
    }

    if (body.action === "attendance-alerts") {
      const result = await SMSService.sendAttendanceAlerts(tenantId, auth.user.id, new Date(body.date))
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[SMS_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "SMS send failed" },
      { status: 500 }
    )
  }
}

// GET /api/sms - Get SMS analytics
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get("tenantId") || auth.user.tenants[0]?.id

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const analytics = await SMSService.getSMSAnalytics(
      tenantId,
      searchParams.get("fromDate") ? new Date(searchParams.get("fromDate")!) : undefined,
      searchParams.get("toDate") ? new Date(searchParams.get("toDate")!) : undefined
    )

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("[SMS_GET_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch SMS analytics" },
      { status: 500 }
    )
  }
}

// GET /api/sms/templates - Get SMS templates
export async function OPTIONS(req: NextRequest) {
  const templates = SMSService.getTemplates()
  return NextResponse.json({ templates })
}
