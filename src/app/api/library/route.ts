import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { LibraryService } from "@/services/library.service"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantSlug = session.user.tenantSlug

    // Resolve tenant
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    // Check if this is an analytics request
    if (searchParams.get("analytics")) {
      const analytics = await LibraryService.getAnalytics(tenant.id)
      return NextResponse.json(analytics)
    }

    // Check for overdue books
    if (searchParams.get("overdue")) {
      const overdue = await LibraryService.getOverdueBooks(tenant.id)
      return NextResponse.json(overdue)
    }

    // Get books
    const result = await LibraryService.getBooks(tenant.id, {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      subject: searchParams.get("subject") || undefined,
      availableOnly: searchParams.get("availableOnly") === "true",
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Library GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch library data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenantSlug = session.user.tenantSlug
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const body = await request.json()
    const { action, ...data } = body

    if (action === "create") {
      const book = await LibraryService.createBook(tenant.id, data)
      return NextResponse.json(book, { status: 201 })
    }

    if (action === "issue") {
      const issue = await LibraryService.issueBook(tenant.id, {
        ...data,
        issuedBy: session.user.name || session.user.email,
      })
      return NextResponse.json(issue, { status: 201 })
    }

    if (action === "return") {
      const issue = await LibraryService.returnBook(tenant.id, data.issueId, {
        fine: data.fine,
        remarks: data.remarks,
      })
      return NextResponse.json(issue)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Library POST Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    )
  }
}
