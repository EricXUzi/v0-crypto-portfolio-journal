import { NextResponse } from "next/server"
// The journal now reviews trades locally. Keep the old endpoint explicit for existing clients.
export async function POST() {
  return NextResponse.json(
    { error: "Cloud AI analysis is not configured. Use the local review in Trade journal." },
    { status: 501 },
  )
}
