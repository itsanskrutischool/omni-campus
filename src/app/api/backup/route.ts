import { NextRequest, NextResponse } from "next/server"
import { BackupService } from "@/services/backup.service"

// GET /api/backup - List backups or get backup statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stats = searchParams.get("stats")

    if (stats === "true") {
      const result = await BackupService.getBackupStatistics()
      return NextResponse.json(result)
    }

    const result = await BackupService.listBackups()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/backup - Create backup, schedule backup, or clean old backups
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "createBackup":
        const backup = await BackupService.createBackup("SYSTEM", data)
        return NextResponse.json(backup)

      case "scheduleBackup":
        const schedule = await BackupService.scheduleBackup("SYSTEM", data.schedule)
        return NextResponse.json(schedule)

      case "cleanOldBackups":
        const clean = await BackupService.cleanOldBackups("SYSTEM", data.keepLast)
        return NextResponse.json(clean)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/backup - Restore from backup
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { backupName } = body

    if (!backupName) {
      return NextResponse.json({ error: "Backup name is required" }, { status: 400 })
    }

    const result = await BackupService.restoreBackup("SYSTEM", backupName)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/backup - Delete backup
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const backupName = searchParams.get("backupName")

    if (!backupName) {
      return NextResponse.json({ error: "Backup name is required" }, { status: 400 })
    }

    const result = await BackupService.deleteBackup("SYSTEM", backupName)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
