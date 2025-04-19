import { getProfileData } from "./get-profile-data"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
  const profileData = await getProfileData()

  if (!profileData) {
    return <div>Error loading profile data</div>
  }

  return <ProfileClient profileData={profileData} />
}
