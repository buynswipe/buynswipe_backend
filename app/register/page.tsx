import type { Metadata } from "next"
import RegisterPage from "./RegisterPage"

export const metadata: Metadata = {
  title: "Register - Retail Bandhu",
  description: "Create a new Retail Bandhu account",
}

export default function Register() {
  return <RegisterPage />
}
