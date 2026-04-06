import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const candidateId = req.nextUrl.searchParams.get("candidateId")

  if (!candidateId) {
    return NextResponse.json({ error: "Missing candidateId" }, { status: 400 })
  }

  const attachments = await prisma.attachment.findMany({
    where: { candidateId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ attachments })
}
