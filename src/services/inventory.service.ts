import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

// ─── Inventory Management Service ─────────────────────────────────────

export class InventoryService {
  /**
   * Create a stock category
   */
  static async createCategory(tenantId: string, data: {
    name: string
    code: string
  }) {
    try {
      const category = await prisma.stockCategory.create({
        data: {
          ...data,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "INVENTORY",
        entityType: "StockCategory",
        entityId: category.id,
        summary: `Created stock category: ${category.name}`,
      })

      return {
        success: true,
        category,
      }
    } catch (error: any) {
      console.error("Category creation failed:", error)
      throw new Error(`Failed to create category: ${error.message}`)
    }
  }

  /**
   * Get all stock categories
   */
  static async getCategories(tenantId: string) {
    try {
      const categories = await prisma.stockCategory.findMany({
        where: { tenantId },
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { name: "asc" },
      })

      return {
        success: true,
        categories,
      }
    } catch (error: any) {
      console.error("Failed to fetch categories:", error)
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }
  }

  /**
   * Create a stock item
   */
  static async createItem(tenantId: string, data: {
    name: string
    code: string
    categoryId: string
    unit: string
    minStock: number
    maxStock: number
    price: number
  }) {
    try {
      const item = await prisma.stockItem.create({
        data: {
          ...data,
          tenantId,
        },
        include: {
          category: true,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "INVENTORY",
        entityType: "StockItem",
        entityId: item.id,
        summary: `Created stock item: ${item.name}`,
      })

      return {
        success: true,
        item,
      }
    } catch (error: any) {
      console.error("Item creation failed:", error)
      throw new Error(`Failed to create item: ${error.message}`)
    }
  }

  /**
   * Get all stock items
   */
  static async getItems(tenantId: string, filters?: {
    categoryId?: string
  }) {
    try {
      const where: any = { tenantId }
      if (filters?.categoryId) where.categoryId = filters.categoryId

      const items = await prisma.stockItem.findMany({
        where,
        include: {
          category: true,
          balances: {
            include: {
              store: true,
            },
          },
        },
        orderBy: { name: "asc" },
      })

      return {
        success: true,
        items,
      }
    } catch (error: any) {
      console.error("Failed to fetch items:", error)
      throw new Error(`Failed to fetch items: ${error.message}`)
    }
  }

  /**
   * Create a stock store
   */
  static async createStore(tenantId: string, data: {
    name: string
    location: string
  }) {
    try {
      const store = await prisma.stockStore.create({
        data: {
          ...data,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "INVENTORY",
        entityType: "StockStore",
        entityId: store.id,
        summary: `Created stock store: ${store.name}`,
      })

      return {
        success: true,
        store,
      }
    } catch (error: any) {
      console.error("Store creation failed:", error)
      throw new Error(`Failed to create store: ${error.message}`)
    }
  }

  /**
   * Get all stock stores
   */
  static async getStores(tenantId: string) {
    try {
      const stores = await prisma.stockStore.findMany({
        where: { tenantId },
        include: {
          balances: {
            include: {
              item: true,
            },
          },
          _count: {
            select: { balances: true },
          },
        },
        orderBy: { name: "asc" },
      })

      return {
        success: true,
        stores,
      }
    } catch (error: any) {
      console.error("Failed to fetch stores:", error)
      throw new Error(`Failed to fetch stores: ${error.message}`)
    }
  }

  /**
   * Record a stock purchase
   */
  static async recordPurchase(tenantId: string, data: {
    itemId: string
    storeId: string
    quantity: number
    unitPrice: number
    supplier?: string
    invoiceNo?: string
  }) {
    try {
      const totalPrice = data.quantity * data.unitPrice

      const purchase = await prisma.stockPurchase.create({
        data: {
          ...data,
          totalPrice,
          purchaseDate: new Date(),
          tenantId,
        },
        include: {
          item: true,
          store: true,
        },
      })

      // Update stock balance
      const existingBalance = await prisma.stockBalance.findUnique({
        where: {
          itemId_storeId: {
            itemId: data.itemId,
            storeId: data.storeId,
          },
        },
      })

      if (existingBalance) {
        await prisma.stockBalance.update({
          where: { id: existingBalance.id },
          data: {
            quantity: existingBalance.quantity + data.quantity,
          },
        })
      } else {
        await prisma.stockBalance.create({
          data: {
            itemId: data.itemId,
            storeId: data.storeId,
            quantity: data.quantity,
            tenantId,
          },
        })
      }

      // Record item movement
      await prisma.stockItemRecord.create({
        data: {
          itemId: data.itemId,
          type: "PURCHASE",
          purchaseId: purchase.id,
          quantity: data.quantity,
          balanceBefore: existingBalance?.quantity || 0,
          balanceAfter: (existingBalance?.quantity || 0) + data.quantity,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "INVENTORY",
        entityType: "StockPurchase",
        entityId: purchase.id,
        summary: `Recorded purchase of ${data.quantity} units`,
      })

      return {
        success: true,
        purchase,
      }
    } catch (error: any) {
      console.error("Purchase recording failed:", error)
      throw new Error(`Failed to record purchase: ${error.message}`)
    }
  }

  /**
   * Create a stock transfer
   */
  static async createTransfer(tenantId: string, data: {
    itemId: string
    fromStore: string
    toStore: string
    quantity: number
    reason?: string
  }) {
    try {
      const transfer = await prisma.stockTransfer.create({
        data: {
          ...data,
          transferDate: new Date(),
          status: "PENDING",
          tenantId,
        },
        include: {
          item: true,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "INVENTORY",
        entityType: "StockTransfer",
        entityId: transfer.id,
        summary: `Created stock transfer of ${data.quantity} units`,
      })

      return {
        success: true,
        transfer,
      }
    } catch (error: any) {
      console.error("Transfer creation failed:", error)
      throw new Error(`Failed to create transfer: ${error.message}`)
    }
  }

  /**
   * Approve stock transfer
   */
  static async approveTransfer(tenantId: string, transferId: string) {
    try {
      const transfer = await prisma.stockTransfer.findUnique({
        where: { id: transferId },
      })

      if (!transfer) {
        throw new Error("Transfer not found")
      }

      // Update from store balance
      const fromBalance = await prisma.stockBalance.findUnique({
        where: {
          itemId_storeId: {
            itemId: transfer.itemId,
            storeId: transfer.fromStore,
          },
        },
      })

      if (!fromBalance || fromBalance.quantity < transfer.quantity) {
        throw new Error("Insufficient stock in source store")
      }

      await prisma.stockBalance.update({
        where: { id: fromBalance.id },
        data: {
          quantity: fromBalance.quantity - transfer.quantity,
        },
      })

      // Update to store balance
      const toBalance = await prisma.stockBalance.findUnique({
        where: {
          itemId_storeId: {
            itemId: transfer.itemId,
            storeId: transfer.toStore,
          },
        },
      })

      if (toBalance) {
        await prisma.stockBalance.update({
          where: { id: toBalance.id },
          data: {
            quantity: toBalance.quantity + transfer.quantity,
          },
        })
      } else {
        await prisma.stockBalance.create({
          data: {
            itemId: transfer.itemId,
            storeId: transfer.toStore,
            quantity: transfer.quantity,
            tenantId,
          },
        })
      }

      // Record movement
      await prisma.stockItemRecord.create({
        data: {
          itemId: transfer.itemId,
          type: "TRANSFER",
          transferId: transfer.id,
          quantity: transfer.quantity,
          balanceBefore: fromBalance.quantity,
          balanceAfter: fromBalance.quantity - transfer.quantity,
          tenantId,
        },
      })

      // Update transfer status
      await prisma.stockTransfer.update({
        where: { id: transferId },
        data: { status: "COMPLETED" },
      })

      await AuditService.log({
        tenantId,
        action: "UPDATE",
        module: "INVENTORY",
        entityType: "StockTransfer",
        entityId: transferId,
        summary: `Approved stock transfer`,
      })

      return {
        success: true,
        message: "Transfer completed successfully",
      }
    } catch (error: any) {
      console.error("Transfer approval failed:", error)
      throw new Error(`Failed to approve transfer: ${error.message}`)
    }
  }

  /**
   * Create a stock adjustment
   */
  static async createAdjustment(tenantId: string, data: {
    itemId: string
    storeId: string
    quantity: number
    type: "INCREASE" | "DECREASE"
    reason: string
  }) {
    try {
      const adjustment = await prisma.stockAdjustment.create({
        data: {
          ...data,
          adjustDate: new Date(),
          tenantId,
        },
        include: {
          item: true,
        },
      })

      // Update stock balance
      const existingBalance = await prisma.stockBalance.findUnique({
        where: {
          itemId_storeId: {
            itemId: data.itemId,
            storeId: data.storeId,
          },
        },
      })

      const balanceBefore = existingBalance?.quantity || 0
      const balanceAfter = data.type === "INCREASE"
        ? balanceBefore + data.quantity
        : balanceBefore - data.quantity

      if (existingBalance) {
        await prisma.stockBalance.update({
          where: { id: existingBalance.id },
          data: {
            quantity: balanceAfter,
          },
        })
      } else if (data.type === "INCREASE") {
        await prisma.stockBalance.create({
          data: {
            itemId: data.itemId,
            storeId: data.storeId,
            quantity: data.quantity,
            tenantId,
          },
        })
      }

      // Record movement
      await prisma.stockItemRecord.create({
        data: {
          itemId: data.itemId,
          type: "ADJUSTMENT",
          adjustmentId: adjustment.id,
          quantity: data.quantity,
          balanceBefore,
          balanceAfter,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "INVENTORY",
        entityType: "StockAdjustment",
        entityId: adjustment.id,
        summary: `Created stock adjustment: ${data.type} ${data.quantity} units`,
      })

      return {
        success: true,
        adjustment,
      }
    } catch (error: any) {
      console.error("Adjustment creation failed:", error)
      throw new Error(`Failed to create adjustment: ${error.message}`)
    }
  }

  /**
   * Get inventory statistics
   */
  static async getInventoryStatistics(tenantId: string) {
    try {
      const [
        totalItems,
        totalCategories,
        totalStores,
        lowStockItems,
      ] = await Promise.all([
        prisma.stockItem.count({ where: { tenantId } }),
        prisma.stockCategory.count({ where: { tenantId } }),
        prisma.stockStore.count({ where: { tenantId } }),
        prisma.stockBalance.findMany({
          where: { tenantId },
          include: { item: true },
        }),
      ])

      const lowStock = lowStockItems.filter(
        (balance) => balance.quantity < balance.item.minStock
      ).length

      return {
        success: true,
        statistics: {
          totalItems,
          totalCategories,
          totalStores,
          lowStockItems: lowStock,
        },
      }
    } catch (error: any) {
      console.error("Failed to fetch inventory statistics:", error)
      throw new Error(`Failed to fetch inventory statistics: ${error.message}`)
    }
  }
}
