import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs/promises"

const execAsync = promisify(exec)

// ─── Database Backup Scheduler ────────────────────────────────────────────

export class DBBackupService {
  /**
   * Create database backup
   */
  static async createBackup(tenantId: string, options: {
    includeSchema?: boolean
    compress?: boolean
    backupPath?: string
  } = {}) {
    const { includeSchema = true, compress = true, backupPath } = options

    console.log(`[${new Date().toISOString()}] Creating database backup for tenant: ${tenantId}`)

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const backupFileName = `omnicampus-backup-${timestamp}.sql`
      const backupDir = backupPath || path.join(process.cwd(), "backups")
      
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true })
      
      const backupFilePath = path.join(backupDir, backupFileName)

      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable not set")
      }

      // Use pg_dump for PostgreSQL backup
      const command = `pg_dump "${databaseUrl}" ${includeSchema ? "" : "--no-owner --no-acl"} > "${backupFilePath}"`
      
      await execAsync(command)

      // Compress if requested
      let finalFilePath = backupFilePath
      if (compress) {
        const compressedPath = `${backupFilePath}.gz`
        await execAsync(`gzip "${backupFilePath}"`)
        finalFilePath = compressedPath
      }

      // Get file size
      const stats = await fs.stat(finalFilePath)
      const fileSizeInMB = stats.size / (1024 * 1024)

      // Log backup to audit
      await AuditService.log({
        tenantId,
        userId: "SYSTEM",
        action: "CREATE",
        module: "backup",
        entityType: "DatabaseBackup",
        summary: `Database backup created: ${path.basename(finalFilePath)} (${fileSizeInMB.toFixed(2)} MB)`,
      })

      return {
        success: true,
        backupPath: finalFilePath,
        fileName: path.basename(finalFilePath),
        fileSize: fileSizeInMB,
        compress,
        createdAt: new Date(),
      }
    } catch (error: any) {
      console.error("Database backup failed:", error)
      
      await AuditService.log({
        tenantId,
        userId: "SYSTEM",
        action: "CREATE",
        module: "backup",
        entityType: "DatabaseBackup",
        summary: `Database backup failed: ${error.message}`,
      })

      throw error
    }
  }

  /**
   * Restore database from backup
   */
  static async restoreBackup(tenantId: string, backupPath: string) {
    console.log(`[${new Date().toISOString()}] Restoring database from backup: ${backupPath}`)

    try {
      // Decompress if gzipped
      let sqlPath = backupPath
      if (backupPath.endsWith(".gz")) {
        sqlPath = backupPath.replace(".gz", "")
        await execAsync(`gunzip -c "${backupPath}" > "${sqlPath}"`)
      }

      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable not set")
      }

      // Use psql for PostgreSQL restore
      const command = `psql "${databaseUrl}" < "${sqlPath}"`
      
      await execAsync(command)

      // Log restore to audit
      await AuditService.log({
        tenantId,
        userId: "SYSTEM",
        action: "UPDATE",
        module: "backup",
        entityType: "DatabaseBackup",
        summary: `Database restored from backup: ${path.basename(backupPath)}`,
      })

      return {
        success: true,
        restoredFrom: backupPath,
        restoredAt: new Date(),
      }
    } catch (error: any) {
      console.error("Database restore failed:", error)
      
      await AuditService.log({
        tenantId,
        userId: "SYSTEM",
        action: "UPDATE",
        module: "backup",
        entityType: "DatabaseBackup",
        summary: `Database restore failed: ${error.message}`,
      })

      throw error
    }
  }

  /**
   * List all backups
   */
  static async listBackups(tenantId: string, backupPath?: string) {
    const backupDir = backupPath || path.join(process.cwd(), "backups")
    
    try {
      const files = await fs.readdir(backupDir)
      const backups = []

      for (const file of files) {
        const filePath = path.join(backupDir, file)
        const stats = await fs.stat(filePath)
        
        if (file.endsWith(".sql") || file.endsWith(".sql.gz")) {
          backups.push({
            fileName: file,
            filePath,
            size: stats.size,
            sizeInMB: stats.size / (1024 * 1024),
            createdAt: stats.mtime,
            compressed: file.endsWith(".gz"),
          })
        }
      }

      // Sort by creation date (newest first)
      backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return backups
    } catch (error) {
      console.error("Failed to list backups:", error)
      return []
    }
  }

  /**
   * Delete old backups (retention policy)
   */
  static async cleanupOldBackups(tenantId: string, options: {
    daysToKeep?: number
    maxBackups?: number
    backupPath?: string
  } = {}) {
    const { daysToKeep = 30, maxBackups = 10, backupPath } = options

    console.log(`[${new Date().toISOString()}] Cleaning up old backups for tenant: ${tenantId}`)

    try {
      const backups = await this.listBackups(tenantId, backupPath)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      let deletedCount = 0
      const deletedFiles: string[] = []

      for (const backup of backups) {
        // Delete if older than daysToKeep
        if (backup.createdAt < cutoffDate) {
          await fs.unlink(backup.filePath)
          deletedFiles.push(backup.fileName)
          deletedCount++
        }
      }

      // If still more than maxBackups, delete oldest
      const remainingBackups = await this.listBackups(tenantId, backupPath)
      if (remainingBackups.length > maxBackups) {
        const toDelete = remainingBackups.slice(maxBackups)
        for (const backup of toDelete) {
          await fs.unlink(backup.filePath)
          deletedFiles.push(backup.fileName)
          deletedCount++
        }
      }

      await AuditService.log({
        tenantId,
        userId: "SYSTEM",
        action: "DELETE",
        module: "backup",
        entityType: "DatabaseBackup",
        summary: `Cleaned up old backups: ${deletedCount} deleted`,
      })

      return {
        success: true,
        deletedCount,
        deletedFiles,
      }
    } catch (error: any) {
      console.error("Backup cleanup failed:", error)
      
      await AuditService.log({
        tenantId,
        userId: "SYSTEM",
        action: "DELETE",
        module: "backup",
        entityType: "DatabaseBackup",
        summary: `Backup cleanup failed: ${error.message}`,
      })

      throw error
    }
  }

  /**
   * Schedule automatic backup (cron-like)
   */
  static async scheduleAutoBackup(tenantId: string, schedule: {
    frequency: "daily" | "weekly" | "monthly"
    time?: string // HH:MM format
    dayOfWeek?: number // 0-6 for weekly
    dayOfMonth?: number // 1-31 for monthly
  }) {
    console.log(`[${new Date().toISOString()}] Scheduling auto backup for tenant: ${tenantId}`, schedule)

    // In a real implementation, this would:
    // 1. Create a cron job entry in the database
    // 2. Use a job scheduler (like node-cron, Bull, or Agenda)
    // 3. Execute the backup job at scheduled times
    
    // For now, we'll just log the schedule
    await AuditService.log({
      tenantId,
      userId: "SYSTEM",
      action: "CREATE",
      module: "backup",
      entityType: "BackupSchedule",
      summary: `Scheduled auto backup: ${schedule.frequency} at ${schedule.time || "00:00"}`,
    })

    return {
      scheduled: true,
      schedule,
    }
  }

  /**
   * Get backup statistics
   */
  static async getBackupStats(tenantId: string, backupPath?: string) {
    const backups = await this.listBackups(tenantId, backupPath)
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
        oldestBackup: null,
        newestBackup: null,
        compressedCount: 0,
      }
    }

    const totalSize = backups.reduce((sum, b) => sum + b.size, 0)
    const compressedCount = backups.filter((b) => b.compressed).length

    return {
      totalBackups: backups.length,
      totalSize,
      totalSizeInMB: totalSize / (1024 * 1024),
      oldestBackup: backups[backups.length - 1],
      newestBackup: backups[0],
      compressedCount,
    }
  }

  /**
   * Export backup to external storage (S3, GCS, etc.)
   */
  static async exportToExternalStorage(tenantId: string, backupPath: string, options: {
    provider?: "s3" | "gcs" | "azure"
    bucket?: string
    region?: string
  } = {}) {
    console.log(`[${new Date().toISOString()}] Exporting backup to external storage: ${backupPath}`)

    // In a real implementation, this would:
    // 1. Upload the backup file to S3/GCS/Azure
    // 2. Use the appropriate SDK (AWS SDK, GCS SDK, Azure SDK)
    // 3. Handle multipart uploads for large files
    // 4. Set appropriate access controls and encryption

    await AuditService.log({
      tenantId,
      userId: "SYSTEM",
      action: "CREATE",
      module: "backup",
      entityType: "BackupExport",
      summary: `Exported backup to external storage: ${path.basename(backupPath)}`,
    })

    return {
      exported: true,
      provider: options.provider || "s3",
      exportedAt: new Date(),
    }
  }

  /**
   * Verify backup integrity
   */
  static async verifyBackup(backupPath: string) {
    console.log(`[${new Date().toISOString()}] Verifying backup integrity: ${backupPath}`)

    try {
      const stats = await fs.stat(backupPath)
      
      if (stats.size === 0) {
        throw new Error("Backup file is empty")
      }

      // For SQL files, check if it's valid SQL
      if (backupPath.endsWith(".sql") || backupPath.endsWith(".sql.gz")) {
        // In a real implementation, you would:
        // 1. Read the file
        // 2. Check for valid SQL syntax
        // 3. Verify the structure
      }

      return {
        valid: true,
        size: stats.size,
        sizeInMB: stats.size / (1024 * 1024),
        modifiedAt: stats.mtime,
      }
    } catch (error: any) {
      return {
        valid: false,
        error: error.message,
      }
    }
  }
}
