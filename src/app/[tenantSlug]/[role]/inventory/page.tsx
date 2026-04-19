"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogFooter } from "@/components/ui/dialog"
import { useSession } from "next-auth/react"

interface InventoryItem {
  id: string
  name: string
  code: string
  category: string
  quantity: number
  unit: string
  storeId: string
  storeName: string
}

interface InventoryCategory {
  id: string
  name: string
  code?: string
  _count?: {
    items: number
  }
}

interface InventoryStore {
  id: string
  name: string
  location: string
  _count?: {
    items: number
  }
}

interface InventoryStatistics {
  totalItems: number
  totalCategories: number
  totalStores: number
  totalValue: number
  lowStockItems: number
}

export default function InventoryPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [stores, setStores] = useState<InventoryStore[]>([])
  const [statistics, setStatistics] = useState<InventoryStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [itemName, setItemName] = useState("")
  const [itemCode, setItemCode] = useState("")
  const [itemCategoryId, setItemCategoryId] = useState("")
  const [itemQuantity, setItemQuantity] = useState("")

  useEffect(() => {
    if (session?.user?.tenantId) {
      loadData()
    }
  }, [session?.user?.tenantId, selectedCategory])

  const loadData = async () => {
    try {
      setLoading(true)
      const tenantId = session?.user?.tenantId

      const [itemsRes, categoriesRes, storesRes, statsRes] = await Promise.all([
        fetch(`/api/inventory?tenantId=${tenantId}&type=item${selectedCategory ? `&categoryId=${selectedCategory}` : ""}`),
        fetch(`/api/inventory?tenantId=${tenantId}&type=category`),
        fetch(`/api/inventory?tenantId=${tenantId}&type=store`),
        fetch(`/api/inventory?tenantId=${tenantId}&stats=true`),
      ])

      const itemsData = await itemsRes.json()
      const categoriesData = await categoriesRes.json()
      const storesData = await storesRes.json()
      const stats = await statsRes.json()

      setItems(itemsData.items || [])
      setCategories(categoriesData.categories || [])
      setStores(storesData.stores || [])
      setStatistics(stats.statistics)
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const recordPurchase = async (itemId: string, storeId: string, quantity: number, unitPrice: number) => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "recordPurchase",
          itemId,
          storeId,
          quantity,
          unitPrice,
        }),
      })
      const data = await res.json()
      if (data.success) {
        loadData()
      }
    } catch (error) {
      // Error handled silently
    }
  }

  const createItem = async () => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "createItem",
          name: itemName,
          code: itemCode,
          categoryId: itemCategoryId,
          quantity: parseInt(itemQuantity),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsItemDialogOpen(false)
        setItemName("")
        setItemCode("")
        setItemCategoryId("")
        setItemQuantity("")
        loadData()
      }
    } catch (error) {
      // Error handled silently
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage stock items, purchases, transfers, and adjustments</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={(v) => v && setSelectedCategory(v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat: InventoryCategory) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsItemDialogOpen(true)}>Add Item</Button>
        </div>
      </div>

      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Inventory Item</DialogTitle>
            <DialogDescription>Add a new stock item</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Laptop"
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="e.g., LAP-001"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={itemCategoryId} onValueChange={(v) => v && setItemCategoryId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: InventoryCategory) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Initial Quantity</Label>
              <Input
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createItem}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalItems || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalCategories || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalStores || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{statistics.lowStockItems || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Stock Items</CardTitle>
              <CardDescription>All inventory items with current stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: InventoryItem) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>{item.storeName}</TableCell>
                      <TableCell>
                        <Badge variant={item.quantity < 10 ? "destructive" : "default"}>
                          {item.quantity < 10 ? "Low Stock" : "In Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => recordPurchase(item.id, item.storeId, 1, 0)}>
                          Record Purchase
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No items found. Create an item to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Item categories for organization</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat: InventoryCategory) => (
                    <TableRow key={cat.id}>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>{cat.code}</TableCell>
                      <TableCell>{cat._count?.items || 0}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No categories found. Create categories to organize items.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores">
          <Card>
            <CardHeader>
              <CardTitle>Stores</CardTitle>
              <CardDescription>Storage locations for inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store: InventoryStore) => (
                    <TableRow key={store.id}>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.location}</TableCell>
                      <TableCell>{store._count?.items || 0}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {stores.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No stores found. Create stores to manage inventory locations.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Stock Purchases</CardTitle>
              <CardDescription>Record new stock purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Select an item to record a purchase
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
