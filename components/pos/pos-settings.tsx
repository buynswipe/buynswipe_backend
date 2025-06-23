"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface POSSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function POSSettings({ open, onOpenChange }: POSSettingsProps) {
  const [settings, setSettings] = useState({
    storeName: "Retail Bandhu",
    storeAddress: "123 Main Street, City, State",
    gstNumber: "12ABCDE1234F1Z5",
    taxRate: 18,
    receiptHeader: "Thank you for shopping with us!",
    receiptFooter: "Visit us again soon",
    autoPrint: true,
    soundEffects: true,
    printerName: "Thermal Printer",
  })

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem("posSettings", JSON.stringify(settings))
    toast.success("Settings saved successfully")
    onOpenChange(false)
  }

  const testPrinter = () => {
    // Test printer connection
    toast.success("Test print sent to printer")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>POS Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="store" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="store">Store Info</TabsTrigger>
            <TabsTrigger value="receipt">Receipt</TabsTrigger>
            <TabsTrigger value="hardware">Hardware</TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gst-number">GST Number</Label>
                <Input
                  id="gst-number"
                  value={settings.gstNumber}
                  onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="store-address">Store Address</Label>
              <Textarea
                id="store-address"
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number.parseFloat(e.target.value) })}
              />
            </div>
          </TabsContent>

          <TabsContent value="receipt" className="space-y-4">
            <div>
              <Label htmlFor="receipt-header">Receipt Header</Label>
              <Input
                id="receipt-header"
                value={settings.receiptHeader}
                onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="receipt-footer">Receipt Footer</Label>
              <Input
                id="receipt-footer"
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-print"
                checked={settings.autoPrint}
                onCheckedChange={(checked) => setSettings({ ...settings, autoPrint: checked })}
              />
              <Label htmlFor="auto-print">Auto-print receipts</Label>
            </div>
          </TabsContent>

          <TabsContent value="hardware" className="space-y-4">
            <div>
              <Label htmlFor="printer-name">Printer Name</Label>
              <Input
                id="printer-name"
                value={settings.printerName}
                onChange={(e) => setSettings({ ...settings, printerName: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="sound-effects"
                checked={settings.soundEffects}
                onCheckedChange={(checked) => setSettings({ ...settings, soundEffects: checked })}
              />
              <Label htmlFor="sound-effects">Enable sound effects</Label>
            </div>

            <Button onClick={testPrinter} variant="outline">
              Test Printer Connection
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
