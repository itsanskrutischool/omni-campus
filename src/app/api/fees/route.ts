import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { FeeService } from "@/services/fee.service"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const structures = await FeeService.getFeeStructures(session.user.tenantId)
    return NextResponse.json(structures)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    // We assume the user creates it within an active academic year, simplified for demo
    // We would normally look this up via tenant. 
    const payload = await req.json()
    
    // Look up an active academic year for this tenant
    const academicYear = await prisma.academicYear.findFirst({
      where: { 
        tenantId: session.user.tenantId,
        isCurrent: true 
      }
    })

    if (!academicYear) {
      return NextResponse.json({ error: "No active academic year found for tenant" }, { status: 400 })
    }
    
    const structure = await FeeService.createFeeStructure(session.user.tenantId, academicYear.id, payload)
    return NextResponse.json(structure)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
