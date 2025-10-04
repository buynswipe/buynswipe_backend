"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Mail, MapPin, Phone, Send } from "lucide-react"

export default function ContactClient() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data?.message || "Something went wrong. Please try again.")
        setStatus("error")
        return
      }
      setStatus("success")
      setForm({ name: "", email: "", phone: "", message: "" })
    } catch (err) {
      setError("Network error. Please try again.")
      setStatus("error")
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 overflow-hidden rounded-lg">
        {/* Hero banner using provided Source URL */}
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Your%20paragraph%20text%282%29-HctM9yz71J3aQSYZj5GBUg94BKvQE6.png"
          alt="Retail Bandhu — Digitizing India’s FMCG Supply Chain"
          className="h-48 w-full object-cover md:h-64"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="order-2 md:order-1">
          <CardHeader>
            <CardTitle>Get in touch</CardTitle>
            <CardDescription>We’ll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required value={form.name} onChange={onChange("name")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" required value={form.email} onChange={onChange("email")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={onChange("phone")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required value={form.message} onChange={onChange("message")} />
              </div>
              <Button type="submit" className="w-full" disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <Send className="mr-2 h-4 w-4 animate-pulse" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </>
                )}
              </Button>
              {status === "success" && (
                <p className="text-sm text-green-600">Thanks! Your message has been sent successfully.</p>
              )}
              {status === "error" && <p className="text-sm text-red-600">{error}</p>}
            </form>
          </CardContent>
        </Card>

        <Card className="order-1 md:order-2">
          <CardHeader>
            <CardTitle>Contact information</CardTitle>
            <CardDescription>Reach us directly using the details below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Address</div>
                <p className="text-sm text-muted-foreground">E 16 Shiv Vihar Modinagar, Ghaziabad U.P 201204</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Phone</div>
                <p className="text-sm text-muted-foreground">+91 7417979002</p>
                <p className="text-sm text-muted-foreground">+91 8171169007</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Email</div>
                <a href="mailto:retailbandhu@gmail.com" className="text-sm text-blue-600 underline">
                  retailbandhu@gmail.com
                </a>
              </div>
            </div>

            <div className="rounded-md bg-muted p-3">
              {/* Truck visual using provided Source URL */}
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RETAIL%20BANDHU%20DELIVERY-LXo1nuikO6AP02VOfBeZrjyRDSLrDP.jpg"
                alt="Retail Bandhu Delivery Vehicle"
                className="mx-auto h-28 w-auto object-contain"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
