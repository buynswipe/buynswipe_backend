import type { Metadata } from "next"
import LoginPage from "./LoginPage"

export const metadata: Metadata = {
  title: "Login - Retail Bandhu",
  description: "Log in to your Retail Bandhu account",
}

export default function Login() {
  return <LoginPage />
}
