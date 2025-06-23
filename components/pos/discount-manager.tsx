"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Edit, Trash2, Percent, DollarSign, CalendarIcon, Users } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Discount {
  id: string
  name: string
  description?: string
  type: "percentage" | "fixed"
  value: number
  minAmount?: number
  maxDiscount?: number
  startDate?: Date
  endDate?: Date
  usageLimit?: number
  usageCount: number
  isActive: boolean
  applicableProducts?: string[]
  applicableCategories?: string[]
  customerTiers?: string[]
}

interface DiscountManagerProps {
  onDiscountSelect?: (discount: Discount) => void
  selectedDiscount?: string
}

export function DiscountManager({ onDiscountSelect, selectedDiscount }: DiscountManagerProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    minAmount: 0,
    maxDiscount: 0,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    usageLimit: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    try {
      const response = await fetch("/api/pos/discounts")
      if (response.ok) {
        const data = await response.json()
        setDiscounts(data)
      }
    } catch (error) {
      console.error("Error fetching discounts:", error)
      toast.error("Failed to load discounts")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingDiscount ? `/api/pos/discounts/${editingDiscount.id}` : "/api/pos/discounts"

      const method = editingDiscount ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingDiscount ? "Discount updated" : "Discount created")
        setIsDialogOpen(false)
        setEditingDiscount(null)
        resetForm()
        fetchDiscounts()
      } else {
        throw new Error("Failed to save discount")
      }
    } catch (error) {
      console.error("Error saving discount:", error)
      toast.error("Failed to save discount")
    }
  }

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount)
    setFormData({
      name: discount.name,
      description: discount.description || "",
      type: discount.type,
      value: discount.value,
      minAmount: discount.minAmount || 0,
      maxDiscount: discount.maxDiscount || 0,
      startDate: discount.startDate,
      endDate: discount.endDate,
      usageLimit: discount.usageLimit || 0,
      isActive: discount.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (discountId: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) return

    try {
      const response = await fetch(`/api/pos/discounts/${discountId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Discount deleted")
        fetchDiscounts()
      } else {
        throw new Error("Failed to delete discount")
      }
    } catch (error) {
      console.error("Error deleting discount:", error)
      toast.error("Failed to delete discount")
    }
  }

  const toggleDiscountStatus = async (discountId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/pos/discounts/${discountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast.success(`Discount ${isActive ? "activated" : "deactivated"}`)
        fetchDiscounts()
      } else {
        throw new Error("Failed to update discount status")
      }
    } catch (error) {
      console.error("Error updating discount status:", error)
      toast.error("Failed to update discount status")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      minAmount: 0,
      maxDiscount: 0,
      startDate: undefined,
      endDate: undefined,
      usageLimit: 0,
      isActive: true,
    })
  }

  const isDiscountActive = (discount: Discount) => {
    if (!discount.isActive) return false

    const now = new Date()
    if (discount.startDate && now < discount.startDate) return false
    if (discount.endDate && now > discount.endDate) return false
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return false

    return true
  }

  const getDiscountStatus = (discount: Discount) => {
    if (!discount.isActive) return { status: "Inactive", color: "bg-gray-500" }

    const now = new Date()
    if (discount.startDate && now < discount.startDate) return { status: "Scheduled", color: "bg-blue-500" }
    if (discount.endDate && now > discount.endDate) return { status: "Expired", color: "bg-red-500" }
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit)
      return { status: "Used Up", color: "bg-orange-500" }

    return { status: "Active", color: "bg-green-500" }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Discount Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingDiscount(null)
                resetForm()
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDiscount ? "Edit Discount" : "Add New Discount"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Discount Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label>Discount Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">Discount Value {formData.type === "percentage" ? "(%)" : "(₹)"}</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  max={formData.type === "percentage" ? "100" : undefined}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number.parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="minAmount">Minimum Order Amount (₹)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  min="0"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>

              {formData.type === "percentage" && (
                <div>
                  <Label htmlFor="maxDiscount">Maximum Discount Amount (₹)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => setFormData({ ...formData, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => setFormData({ ...formData, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="usageLimit">Usage Limit (0 = unlimited)</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number.parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingDiscount ? "Update" : "Create"} Discount
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {discounts.map((discount) => {
          const status = getDiscountStatus(discount)
          return (
            <Card
              key={discount.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDiscount === discount.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => onDiscountSelect?.(discount)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                      {discount.type === "percentage" ? (
                        <Percent className="w-5 h-5 text-blue-600" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{discount.name}</h4>
                      <p className="text-sm text-gray-600">
                        {discount.type === "percentage" ? `${discount.value}% off` : `₹${discount.value} off`}
                        {discount.minAmount > 0 && ` on orders above ₹${discount.minAmount}`}
                      </p>
                      {discount.description && <p className="text-xs text-gray-500 mt-1">{discount.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={`${status.color} text-white`}>{status.status}</Badge>

                    {discount.usageLimit > 0 && (
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {discount.usageCount}/{discount.usageLimit}
                      </Badge>
                    )}

                    <Switch
                      checked={discount.isActive}
                      onCheckedChange={(checked) => toggleDiscountStatus(discount.id, checked)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(discount)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(discount.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {(discount.startDate || discount.endDate) && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {discount.startDate && <span>From: {format(discount.startDate, "PPP")}</span>}
                    {discount.endDate && <span>Until: {format(discount.endDate, "PPP")}</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
