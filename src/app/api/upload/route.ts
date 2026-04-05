import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File
  const candidateId = formData.get("candidateId") as string

  if (!file || !candidateId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const blob = await put(file.name, file, { access: "public" })

  const attachment = await prisma.attachment.create({
    data: {
      candidateId,
      name: file.name,
      filePath: blob.url,
      mimeType: file.type || null,
    },
  })

  return NextResponse.json({ attachment })
}
