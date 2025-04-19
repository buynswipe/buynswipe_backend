import { NextResponse } from "next/server"
import updateProfilesRoleConstraint from "@/scripts/update-profiles-role-constraint"

export async function POST() {
  try {
    const result = await updateProfilesRoleConstraint()

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ message: "Successfully updated profiles role constraint" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
