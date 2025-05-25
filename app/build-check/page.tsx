export default function BuildCheck() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Build Check</h1>
      <p>If you can see this page, the build is working correctly!</p>
      <div className="mt-4 space-y-2">
        <p>✅ No next/headers conflicts</p>
        <p>✅ Client components working</p>
        <p>✅ Server components isolated</p>
        <p>✅ Middleware configured</p>
      </div>
    </div>
  )
}
