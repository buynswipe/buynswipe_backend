#!/usr/bin/env node

import { execSync } from "child_process"
import { existsSync } from "fs"
import { join } from "path"

const PROJECT_ROOT = process.cwd()

interface BuildCheck {
  name: string
  check: () => boolean | Promise<boolean>
  fix?: () => void | Promise<void>
}

const buildChecks: BuildCheck[] = [
  {
    name: "Package.json exists",
    check: () => existsSync(join(PROJECT_ROOT, "package.json")),
  },
  {
    name: "Next.js config exists",
    check: () => existsSync(join(PROJECT_ROOT, "next.config.mjs")),
  },
  {
    name: "TypeScript config exists",
    check: () => existsSync(join(PROJECT_ROOT, "tsconfig.json")),
  },
  {
    name: "Environment variables set",
    check: () => {
      const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]
      return requiredEnvVars.every((envVar) => process.env[envVar])
    },
  },
  {
    name: "Dependencies installed",
    check: () => existsSync(join(PROJECT_ROOT, "node_modules")),
    fix: () => {
      console.log("Installing dependencies...")
      execSync("npm install", { stdio: "inherit" })
    },
  },
  {
    name: "TypeScript compilation",
    check: async () => {
      try {
        execSync("npx tsc --noEmit", { stdio: "pipe" })
        return true
      } catch {
        return false
      }
    },
  },
  {
    name: "Next.js build",
    check: async () => {
      try {
        execSync("npm run build", { stdio: "pipe" })
        return true
      } catch {
        return false
      }
    },
  },
]

async function runBuildVerification() {
  console.log("🔍 Running build verification...\n")

  let allPassed = true

  for (const check of buildChecks) {
    process.stdout.write(`Checking ${check.name}... `)

    try {
      const result = await check.check()

      if (result) {
        console.log("✅ PASS")
      } else {
        console.log("❌ FAIL")
        allPassed = false

        if (check.fix) {
          console.log(`  Attempting to fix...`)
          await check.fix()

          // Re-run the check
          const retryResult = await check.check()
          if (retryResult) {
            console.log(`  ✅ Fixed!`)
          } else {
            console.log(`  ❌ Could not fix automatically`)
          }
        }
      }
    } catch (error) {
      console.log("❌ ERROR")
      console.log(`  ${error}`)
      allPassed = false
    }
  }

  console.log("\n" + "=".repeat(50))

  if (allPassed) {
    console.log("🎉 All checks passed! Build should succeed.")
    process.exit(0)
  } else {
    console.log("❌ Some checks failed. Please fix the issues above.")
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runBuildVerification().catch(console.error)
}

export { runBuildVerification }
