import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function RegisterSuccess() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Registration Successful!</h1>
        <p className="text-muted-foreground">
          Thank you for registering with Retail Bandhu. We've sent a verification email to your email address. Please
          verify your email to complete the registration process.
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
