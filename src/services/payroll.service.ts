import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

// ─── Payroll Service ─────────────────────────────────────────────────────

export class PayrollService {
  /**
   * Create a new pay head (salary component)
   */
  static async createPayHead(tenantId: string, data: {
    name: string
    code: string
    type: "EARNING" | "DEDUCTION"
    isPercent: boolean
    amount: number
  }) {
    try {
      const payHead = await prisma.payHead.create({
        data: {
          ...data,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "PAYROLL",
        entityType: "PayHead",
        entityId: payHead.id,
        summary: `Created pay head: ${payHead.name}`,
      })

      return {
        success: true,
        payHead,
      }
    } catch (error: any) {
      console.error("Pay head creation failed:", error)
      throw new Error(`Failed to create pay head: ${error.message}`)
    }
  }

  /**
   * Get all pay heads for a tenant
   */
  static async getPayHeads(tenantId: string) {
    try {
      const payHeads = await prisma.payHead.findMany({
        where: { tenantId },
        orderBy: { type: "asc" },
      })

      return {
        success: true,
        payHeads,
      }
    } catch (error: any) {
      console.error("Failed to fetch pay heads:", error)
      throw new Error(`Failed to fetch pay heads: ${error.message}`)
    }
  }

  /**
   * Create a salary template
   */
  static async createSalaryTemplate(tenantId: string, data: {
    name: string
    records: Array<{
      payHeadId: string
      isPercent: boolean
      amount: number
    }>
  }) {
    try {
      const template = await prisma.salaryTemplate.create({
        data: {
          name: data.name,
          tenantId,
          records: {
            create: data.records,
          },
        },
        include: {
          records: {
            include: {
              payHead: true,
            },
          },
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "PAYROLL",
        entityType: "SalaryTemplate",
        entityId: template.id,
        summary: `Created salary template: ${template.name}`,
      })

      return {
        success: true,
        template,
      }
    } catch (error: any) {
      console.error("Salary template creation failed:", error)
      throw new Error(`Failed to create salary template: ${error.message}`)
    }
  }

  /**
   * Get all salary templates for a tenant
   */
  static async getSalaryTemplates(tenantId: string) {
    try {
      const templates = await prisma.salaryTemplate.findMany({
        where: { tenantId },
        include: {
          records: {
            include: {
              payHead: true,
            },
          },
        },
        orderBy: { name: "asc" },
      })

      return {
        success: true,
        templates,
      }
    } catch (error: any) {
      console.error("Failed to fetch salary templates:", error)
      throw new Error(`Failed to fetch salary templates: ${error.message}`)
    }
  }

  /**
   * Assign salary structure to staff
   */
  static async assignSalaryStructure(tenantId: string, data: {
    staffId: string
    templateId: string
    effectiveFrom: Date
  }) {
    try {
      const template = await prisma.salaryTemplate.findUnique({
        where: { id: data.templateId },
        include: { records: true },
      })

      if (!template) {
        throw new Error("Salary template not found")
      }

      const structure = await prisma.salaryStructure.create({
        data: {
          staffId: data.staffId,
          templateId: data.templateId,
          effectiveFrom: data.effectiveFrom,
          tenantId,
          records: {
            create: template.records.map((record: any) => ({
              payHeadId: record.payHeadId,
              isPercent: record.isPercent,
              amount: record.amount,
            })),
          },
        },
        include: {
          records: {
            include: {
              payHead: true,
            },
          },
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "PAYROLL",
        entityType: "SalaryStructure",
        entityId: structure.id,
        summary: `Assigned salary structure to staff: ${data.staffId}`,
      })

      return {
        success: true,
        structure,
      }
    } catch (error: any) {
      console.error("Salary structure assignment failed:", error)
      throw new Error(`Failed to assign salary structure: ${error.message}`)
    }
  }

  /**
   * Get salary structure for a staff member
   */
  static async getStaffSalaryStructure(tenantId: string, staffId: string) {
    try {
      const structure = await prisma.salaryStructure.findFirst({
        where: {
          staffId,
          tenantId,
        },
        include: {
          records: {
            include: {
              payHead: true,
            },
          },
          template: true,
        },
        orderBy: {
          effectiveFrom: "desc",
        },
      })

      return {
        success: true,
        structure,
      }
    } catch (error: any) {
      console.error("Failed to fetch salary structure:", error)
      throw new Error(`Failed to fetch salary structure: ${error.message}`)
    }
  }

  /**
   * Generate payroll for a staff member for a specific month/year
   */
  static async generatePayroll(tenantId: string, data: {
    staffId: string
    month: number
    year: number
  }) {
    try {
      const staff = await prisma.staff.findUnique({
        where: { id: data.staffId },
        include: {
          salaryStructures: {
            where: {
              effectiveFrom: {
                lte: new Date(data.year, data.month, 1),
              },
            },
            include: {
              records: {
                include: {
                  payHead: true,
                },
              },
            },
            orderBy: {
              effectiveFrom: "desc",
            },
            take: 1,
          },
        },
      })

      if (!staff) {
        throw new Error("Staff not found")
      }

      if (!staff.salaryStructures[0]) {
        throw new Error("No salary structure assigned to this staff")
      }

      const structure = staff.salaryStructures[0]
      const basicSalary = staff.basicSalary || 0

      let allowances = 0
      let deductions = 0

      for (const record of structure.records) {
        const amount = record.isPercent
          ? (basicSalary * record.amount) / 100
          : record.amount

        if (record.payHead.type === "EARNING") {
          allowances += amount
        } else {
          deductions += amount
        }
      }

      const netSalary = basicSalary + allowances - deductions

      const payroll = await prisma.payroll.create({
        data: {
          staffId: data.staffId,
          tenantId,
          month: data.month,
          year: data.year,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          status: "PENDING",
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "PAYROLL",
        entityType: "Payroll",
        entityId: payroll.id,
        summary: `Generated payroll for staff: ${staff.name} for ${data.month}/${data.year}`,
      })

      return {
        success: true,
        payroll,
      }
    } catch (error: any) {
      console.error("Payroll generation failed:", error)
      throw new Error(`Failed to generate payroll: ${error.message}`)
    }
  }

  /**
   * Generate payroll for all staff for a specific month/year
   */
  static async generateBulkPayroll(tenantId: string, month: number, year: number) {
    try {
      const staff = await prisma.staff.findMany({
        where: { tenantId, status: "ACTIVE" },
      })

      const results = []
      const errors = []

      for (const staffMember of staff) {
        try {
          const result = await this.generatePayroll(tenantId, {
            staffId: staffMember.id,
            month,
            year,
          })
          results.push({
            staffId: staffMember.id,
            staffName: staffMember.name,
            success: true,
            payroll: result.payroll,
          })
        } catch (error: any) {
          errors.push({
            staffId: staffMember.id,
            staffName: staffMember.name,
            success: false,
            error: error.message,
          })
        }
      }

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "PAYROLL",
        entityType: "Payroll",
        summary: `Bulk generated payroll for ${results.length} staff, ${errors.length} failed`,
      })

      return {
        success: true,
        results,
        errors,
        total: staff.length,
        successCount: results.length,
        errorCount: errors.length,
      }
    } catch (error: any) {
      console.error("Bulk payroll generation failed:", error)
      throw new Error(`Failed to generate bulk payroll: ${error.message}`)
    }
  }

  /**
   * Get payroll records for a tenant
   */
  static async getPayrolls(tenantId: string, filters?: {
    month?: number
    year?: number
    staffId?: string
    status?: string
  }) {
    try {
      const where: any = { tenantId }

      if (filters?.month) where.month = filters.month
      if (filters?.year) where.year = filters.year
      if (filters?.staffId) where.staffId = filters.staffId
      if (filters?.status) where.status = filters.status

      const payrolls = await prisma.payroll.findMany({
        where,
        include: {
          staff: true,
        },
        orderBy: [
          { year: "desc" },
          { month: "desc" },
        ],
      })

      return {
        success: true,
        payrolls,
      }
    } catch (error: any) {
      console.error("Failed to fetch payrolls:", error)
      throw new Error(`Failed to fetch payrolls: ${error.message}`)
    }
  }

  /**
   * Update payroll status (approve/paid)
   */
  static async updatePayrollStatus(tenantId: string, payrollId: string, status: "PENDING" | "APPROVED" | "PAID") {
    try {
      const payroll = await prisma.payroll.update({
        where: { id: payrollId },
        data: {
          status,
          paymentDate: status === "PAID" ? new Date() : null,
        },
        include: {
          staff: true,
        },
      })

      await AuditService.log({
        tenantId,
        action: "UPDATE",
        module: "PAYROLL",
        entityType: "Payroll",
        entityId: payrollId,
        summary: `Updated payroll status to ${status} for staff: ${payroll.staff.name}`,
      })

      return {
        success: true,
        payroll,
      }
    } catch (error: any) {
      console.error("Payroll status update failed:", error)
      throw new Error(`Failed to update payroll status: ${error.message}`)
    }
  }

  /**
   * Get payroll statistics
   */
  static async getPayrollStatistics(tenantId: string, month: number, year: number) {
    try {
      const payrolls = await prisma.payroll.findMany({
        where: {
          tenantId,
          month,
          year,
        },
      })

      const totalBasicSalary = payrolls.reduce((sum, p) => sum + p.basicSalary, 0)
      const totalAllowances = payrolls.reduce((sum, p) => sum + p.allowances, 0)
      const totalDeductions = payrolls.reduce((sum, p) => sum + p.deductions, 0)
      const totalNetSalary = payrolls.reduce((sum, p) => sum + p.netSalary, 0)

      const statusCounts = {
        PENDING: payrolls.filter((p) => p.status === "PENDING").length,
        APPROVED: payrolls.filter((p) => p.status === "APPROVED").length,
        PAID: payrolls.filter((p) => p.status === "PAID").length,
      }

      return {
        success: true,
        statistics: {
          totalPayrolls: payrolls.length,
          totalBasicSalary,
          totalAllowances,
          totalDeductions,
          totalNetSalary,
          statusCounts,
        },
      }
    } catch (error: any) {
      console.error("Failed to fetch payroll statistics:", error)
      throw new Error(`Failed to fetch payroll statistics: ${error.message}`)
    }
  }
}
