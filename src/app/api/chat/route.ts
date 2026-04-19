import { NextRequest, NextResponse } from "next/server"

// Chat API temporarily disabled due to Prisma client issues
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: "Chat API temporarily disabled" }, { status: 503 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: "Chat API temporarily disabled" }, { status: 503 })
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: "Chat API temporarily disabled" }, { status: 503 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: "Chat API temporarily disabled" }, { status: 503 })
}
