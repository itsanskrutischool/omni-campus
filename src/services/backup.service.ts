import { prisma } from "@/lib/prisma"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import { AuditService } from "./audit.service"

const execAsync = promisify(exec)

// ─── Backup Service ─────────────────────────────────────────────────────

export class BackupService {
  private static readonly BACKUP_DIR = path.join(process.cwd(), "backups")

  /**
   * Create a database backup
   */
  static async createBackup(tenantId: string, options?: {
    name?: string
    description?: string
  }) {
    try {
      // Ensure backup directory exists
      if (!fs.existsSync(this.BACKUP_DIR)) {
        fs.mkdirSync(this.BACKUP_DIR, { recursive: true })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const backupName = options?.name || `backup-${timestamp}`
      const backupPath = path.join(this.BACKUP_DIR, `${backupName}.sql`)

      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is not set")
      }

      // Use pg_dump to create backup
      const command = `pg_dump "${databaseUrl}" > "${backupPath}"`
      await execAsync(command)

      const backupSize = fs.statSync(backupPath).size

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "BACKUP",
        entityType: "DatabaseBackup",
        entityId: backupName,
        summary: `Created database backup: ${backupName} (${(backupSize / 1024 / 1024).toFixed(2)} MB)`,
      })

      return {
        success: true,
        backup: {
          name: backupName,
          path: backupPath,
          size: backupSize,
          createdAt: new Date(),
          description: options?.description,
        },
      }
    } catch (error: any) {
      console.error("Backup creation failed:", error)
      throw new Error(`Failed to create backup: ${error.message}`)
    }
  }

  /**
   * List all backups
   */
  static async listBackups() {
    try {
      if (!fs.existsSync(this.BACKUP_DIR)) {
        return {
          success: true,
          backups: [],
        }
      }

      const files = fs.readdirSync(this.BACKUP_DIR)
      const backups = files
        .filter((file) => file.endsWith(".sql"))
        .map((file) => {
          const filePath = path.join(this.BACKUP_DIR, file)
          const stats = fs.statSync(filePath)
          return {
            name: file.replace(".sql", ""),
            path: filePath,
            size: stats.size,
            createdAt: stats.mtime,
          }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return {
        success: true,
        backups,
      }
    } catch (error: any) {
      console.error("Failed to list backups:", error)
      throw new Error(`Failed to list backups: ${error.message}`)
    }
  }

  /**
   * Restore from backup
   */
  static async restoreBackup(tenantId: string, backupName: string) {
    try {
      const backupPath = path.join(this.BACKUP_DIR, `${backupName}.sql`)

      if (!fs.existsSync(backupPath)) {
        throw new Error("Backup file not found")
      }

      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is not set")
      }

      // Use psql to restore backup
      const command = `psql "${databaseUrl}" < "${backupPath}"`
      await execAsync(command)

      await AuditService.log({
        tenantId,
        action: "UPDATE",
        module: "BACKUP",
        entityType: "DatabaseBackup",
        entityId: backupName,
        summary: `Restored database from backup: ${backupName}`,
      })

      return {
        success: true,
        message: "Backup restored successfully",
      }
    } catch (error: any) {
      console.error("Backup restoration failed:", error)
      throw new Error(`Failed to restore backup: ${error.message}`)
    }
  }

  /**
   * Delete a backup
   */
  static async deleteBackup(tenantId: string, backupName: string) {
    try {
      const backupPath = path.join(this.BACKUP_DIR, `${backupName}.sql`)

      if (!fs.existsSync(backupPath)) {
        throw new Error("Backup file not found")
      }

      fs.unlinkSync(backupPath)

      await AuditService.log({
        tenantId,
        action: "DELETE",
        module: "BACKUP",
        entityType: "DatabaseBackup",
        entityId: backupName,
        summary: `Deleted backup: ${backupName}`,
      })

      return {
        success: true,
        message: "Backup deleted successfully",
      }
    } catch (error: any) {
      console.error("Backup deletion failed:", error)
      throw new Error(`Failed to delete backup: ${error.message}`)
    }
  }

  /**
   * Get backup statistics
   */
  static async getBackupStatistics() {
    try {
      const { backups } = await this.listBackups()
      const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0)
      const oldestBackup = backups[backups.length - 1]
      const newestBackup = backups[0]

      return {
        success: true,
        statistics: {
          totalBackups: backups.length,
          totalSize,
          totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
          oldestBackup: oldestBackup?.createdAt || null,
          newestBackup: newestBackup?.createdAt || null,
        },
      }
    } catch (error: any) {
      console.error("Failed to get backup statistics:", error)
      throw new Error(`Failed to get backup statistics: ${error.message}`)
    }
  }

  /**
   * Schedule automated backup (this would typically use a cron job)
   */
  static async scheduleBackup(tenantId: string, schedule: string) {
    // This is a placeholder for scheduling backups
    // In a real implementation, you would use a cron job or similar
    // Example: using node-cron or integrating with the Queue system

    await AuditService.log({
      tenantId,
      action: "CREATE",
      module: "BACKUP",
      entityType: "BackupSchedule",
      summary: `Scheduled automated backup: ${schedule}`,
    })

    return {
      success: true,
      message: `Backup scheduled for: ${schedule}`,
    }
  }

  /**
   * Clean old backups (keep last N backups)
   */
  static async cleanOldBackups(tenantId: string, keepLast: number = 10) {
    try {
      const { backups } = await this.listBackups()

      if (backups.length <= keepLast) {
        return {
          success: true,
          message: "No backups to clean",
          deleted: 0,
        }
      }

      const backupsToDelete = backups.slice(keepLast)
      let deletedCount = 0

      for (const backup of backupsToDelete) {
        try {
          fs.unlinkSync(backup.path)
          deletedCount++
        } catch (error) {
          console.error(`Failed to delete backup ${backup.name}:`, error)
        }
      }

      await AuditService.log({
        tenantId,
        action: "DELETE",
        module: "BACKUP",
        entityType: "DatabaseBackup",
        summary: `Cleaned old backups, deleted ${deletedCount} files`,
      })

      return {
        success: true,
        message: `Cleaned ${deletedCount} old backups`,
        deleted: deletedCount,
      }
    } catch (error: any) {
      console.error("Failed to clean old backups:", error)
      throw new Error(`Failed to clean old backups: ${error.message}`)
    }
  }
}
