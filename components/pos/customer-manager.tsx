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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Edit, Trash2, User, Phone, Mail, MapPin, Star, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  dateOfBirth?: Date
  loyaltyPoints: number
  totalSpent: number
  totalOrders: number
  tier: "bronze" | "silver" | "gold" | "platinum"
  lastVisit?: Date
  notes?: string
  isActive: boolean
  createdAt: Date
}

interface CustomerManagerProps {
  onCustomerSelect?: (customer: Customer) => void
  selectedCustomer?: string
}

const CUSTOMER_TIERS = [
  { value: "bronze", label: "Bronze", color: "bg-amber-600", minSpent: 0 },
  { value: "silver", label: "Silver", color: "bg-gray-400", minSpent: 10000 },
  { value: "gold", label: "Gold", color: "bg-yellow-500", minSpent: 50000 },
  { value: "platinum", label: "Platinum", color: "bg-purple-600", minSpent: 100000 },
]

export function CustomerManager({ onCustomerSelect, selectedCustomer }: CustomerManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTier, setFilterTier] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    notes: "",
    isActive: true,
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/pos/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast.error("Failed to load customers")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCustomer ? `/api/pos/customers/${editingCustomer.id}` : "/api/pos/customers"

      const method = editingCustomer ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingCustomer ? "Customer updated" : "Customer created")
        setIsDialogOpen(false)
        setEditingCustomer(null)
        resetForm()
        fetchCustomers()
      } else {
        throw new Error("Failed to save customer")
      }
    } catch (error) {
      console.error("Error saving customer:", error)
      toast.error("Failed to save customer")
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.toISOString().split("T")[0] : "",
      notes: customer.notes || "",
      isActive: customer.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    try {
      const response = await fetch(`/api/pos/customers/${customerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Customer deleted")
        fetchCustomers()
      } else {
        throw new Error("Failed to delete customer")
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast.error("Failed to delete customer")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      notes: "",
      isActive: true,
    })
  }

  const getTierInfo = (tier: string) => {
    return CUSTOMER_TIERS.find((t) => t.value === tier) || CUSTOMER_TIERS[0]
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)

    const matchesTier = filterTier === "all" || customer.tier === filterTier

    return matchesSearch && matchesTier
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Customer Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCustomer(null)
                resetForm()
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Any additional notes about the customer..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingCustomer ? "Update" : "Create"} Customer
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            {CUSTOMER_TIERS.map((tier) => (
              <SelectItem key={tier.value} value={tier.value}>
                {tier.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Customer List */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => {
          const tierInfo = getTierInfo(customer.tier)
          return (
            <Card
              key={customer.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCustomer === customer.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => onCustomerSelect?.(customer)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
                      <AvatarFallback>
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{customer.name}</h4>
                        <Badge className={`${tierInfo.color} text-white text-xs`}>{tierInfo.label}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        {customer.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>{customer.loyaltyPoints} points</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          <span>{customer.totalOrders} orders</span>
                        </div>
                        <span>{formatCurrency(customer.totalSpent)} spent</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {customer.lastVisit && (
                      <div className="text-xs text-gray-500 text-right">
                        <div>Last visit:</div>
                        <div>{formatDate(customer.lastVisit)}</div>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(customer)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(customer.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {customer.address && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <MapPin className="w-3 h-3" />
                    <span>{customer.address}</span>
                  </div>
                )}

                {customer.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <strong>Notes:</strong> {customer.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No customers found</p>
          {searchTerm && <p className="text-sm">Try adjusting your search criteria</p>}
        </div>
      )}
    </div>
  )
}
