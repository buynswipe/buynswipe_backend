import { NextResponse } from "next/server"
import { Resend } from "resend"

type ContactPayload = {
  name: string
  email: string
  phone?: string
  message: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ContactPayload>
    const name = (body.name || "").trim()
    const email = (body.email || "").trim()
    const phone = (body.phone || "").trim()
    const message = (body.message || "").trim()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const MAIL_FROM = process.env.MAIL_FROM || "onboarding@resend.dev"
    const TO = "retailbandhu@gmail.com"

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email will not be sent.")
      return NextResponse.json(
        {
          ok: false,
          message: "Email service not configured. Please try again later.",
        },
        { status: 503 },
      )
    }

    const resend = new Resend(RESEND_API_KEY)

    const subject = `[Contact] ${name} — Retail Bandhu`
    const textLines = [
      `New contact form submission from Retail Bandhu:`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : ``,
      ``,
      `Message:`,
      message,
      ``,
      `— Sent via retailbandhu.com`,
    ].filter(Boolean)

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;">
        <h2 style="margin:0 0 8px;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
        <p style="white-space:pre-wrap;"><strong>Message:</strong><br/>${escapeHtml(message)}</p>
        <hr/>
        <p style="color:#64748b;">Sent via retailbandhu.com</p>
      </div>
    `

    const { error } = await resend.emails.send({
      from: MAIL_FROM,
      to: [TO],
      subject,
      text: textLines.join("\n"),
      html,
      replyTo: email,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ ok: false, message: "Failed to send email." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Contact endpoint error:", err)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }
}

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
