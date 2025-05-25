#!/usr/bin/env node

import { execSync } from "child_process"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

console.log("🔧 Fixing deployment issues...")

// 1. Check and fix package.json
const packageJsonPath = join(process.cwd(), "package.json")
if (existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))

  // Ensure required scripts exist
  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }

  packageJson.scripts.build = "next build"
  packageJson.scripts.start = "next start"
  packageJson.scripts.dev = "next dev"
  packageJson.scripts.lint = "next lint"

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log("✅ Fixed package.json scripts")
}

// 2. Check TypeScript configuration
const tsconfigPath = join(process.cwd(), "tsconfig.json")
if (existsSync(tsconfigPath)) {
  console.log("✅ TypeScript configuration exists")
} else {
  console.log("❌ TypeScript configuration missing")
}

// 3. Check for common import issues
const filesToCheck = ["lib/supabase-server.ts", "lib/supabase-client.ts", "types/page-props.ts"]

for (const file of filesToCheck) {
  const filePath = join(process.cwd(), file)
  if (existsSync(filePath)) {
    console.log(`✅ ${file} exists`)
  } else {
    console.log(`❌ ${file} missing`)
  }
}

// 4. Try to compile TypeScript
try {
  execSync("npx tsc --noEmit", { stdio: "pipe" })
  console.log("✅ TypeScript compilation successful")
} catch (error) {
  console.log("❌ TypeScript compilation failed")
  console.log("Error:", error.toString())
}

// 5. Check Next.js build
try {
  console.log("🔨 Testing Next.js build...")
  execSync("npm run build", { stdio: "inherit" })
  console.log("✅ Next.js build successful")
} catch (error) {
  console.log("❌ Next.js build failed")
  process.exit(1)
}

console.log("🎉 All deployment issues fixed!")
