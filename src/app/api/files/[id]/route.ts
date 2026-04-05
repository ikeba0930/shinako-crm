import { del } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const attachment = await prisma.attachment.findUnique({ where: { id } })
  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    await del(attachment.filePath)
  } catch {
    // Blobが見つからなくても続行
  }

  await prisma.attachment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
