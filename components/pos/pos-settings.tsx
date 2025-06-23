"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface POSSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSettingsUpdate: (settings: any) => void
}

export function POSSettings({ open, onOpenChange, onSettingsUpdate }: POSSettingsProps) {
  const [settings, setSettings] = useState({
    store_name: "",
    store_address: "",
    store_phone: "",
    store_email: "",
    tax_rate: 0,
    receipt_header: "",
    receipt_footer: "",
    auto_print_receipt: true,
    thermal_printer_ip: "",
    thermal_printer_port: 9100,
    barcode_scanner_enabled: true,
    sound_enabled: true,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/pos/settings")
      const data = await response.json()

      if (data.success && data.settings) {
        setSettings({ ...settings, ...data.settings })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/pos/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
        onSettingsUpdate(settings)
        onOpenChange(false)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>POS Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Store Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Store Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  value={settings.store_name}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="store-phone">Phone</Label>
                <Input
                  id="store-phone"
                  value={settings.store_phone}
                  onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="store-address">Address</Label>
              <Textarea
                id="store-address"
                value={settings.store_address}
                onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="store-email">Email</Label>
              <Input
                id="store-email"
                type="email"
                value={settings.store_email}
                onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          {/* Tax Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Tax Settings</h3>
            <div>
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.01"
                value={settings.tax_rate}
                onChange={(e) => setSettings({ ...settings, tax_rate: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <Separator />

          {/* Receipt Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Receipt Settings</h3>
            <div>
              <Label htmlFor="receipt-header">Receipt Header</Label>
              <Textarea
                id="receipt-header"
                value={settings.receipt_header}
                onChange={(e) => setSettings({ ...settings, receipt_header: e.target.value })}
                placeholder="Custom header text for receipts"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="receipt-footer">Receipt Footer</Label>
              <Textarea
                id="receipt-footer"
                value={settings.receipt_footer}
                onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
                placeholder="Custom footer text for receipts"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-print"
                checked={settings.auto_print_receipt}
                onCheckedChange={(checked) => setSettings({ ...settings, auto_print_receipt: checked })}
              />
              <Label htmlFor="auto-print">Auto-print receipts</Label>
            </div>
          </div>

          <Separator />

          {/* Hardware Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Hardware Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="printer-ip">Thermal Printer IP</Label>
                <Input
                  id="printer-ip"
                  value={settings.thermal_printer_ip}
                  onChange={(e) => setSettings({ ...settings, thermal_printer_ip: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <Label htmlFor="printer-port">Printer Port</Label>
                <Input
                  id="printer-port"
                  type="number"
                  value={settings.thermal_printer_port}
                  onChange={(e) =>
                    setSettings({ ...settings, thermal_printer_port: Number.parseInt(e.target.value) || 9100 })
                  }
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="barcode-scanner"
                  checked={settings.barcode_scanner_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, barcode_scanner_enabled: checked })}
                />
                <Label htmlFor="barcode-scanner">Enable barcode scanner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sound-enabled"
                  checked={settings.sound_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, sound_enabled: checked })}
                />
                <Label htmlFor="sound-enabled">Enable sound effects</Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={saveSettings} disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
