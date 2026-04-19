import { NextRequest, NextResponse } from "next/server"

// SMS API temporarily disabled
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: "SMS API temporarily disabled" }, { status: 503 })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: "SMS API temporarily disabled" }, { status: 503 })
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({ error: "SMS API temporarily disabled" }, { status: 503 })
}
