"use client"

import { useRef, useState } from "react"

type Attachment = {
  id: string
  name: string
  filePath: string
  mimeType: string | null
  createdAt: string | Date
}

type Props = {
  candidateId: string
  initialAttachments: Attachment[]
}

function getFileIcon(mimeType: string | null, name: string) {
  if (mimeType?.startsWith("image/")) return "🖼️"
  if (mimeType?.includes("pdf") || name.endsWith(".pdf")) return "📜"
  if (mimeType?.includes("word") || name.endsWith(".docx") || name.endsWith(".doc")) return "📄"
  if (mimeType?.includes("sheet") || name.endsWith(".xlsx") || name.endsWith(".xls")) return "📊"
  if (mimeType?.includes("zip") || name.endsWith(".zip")) return "📦"
  return "📁"
}

function FileRow({
  att,
  onDelete,
  onRename,
}: {
  att: Attachment
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(att.name)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setEditValue(att.name)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  async function commitRename() {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === att.name) {
      setEditing(false)
      return
    }
    await fetch(`/api/files/${att.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    })
    onRename(att.id, trimmed)
    setEditing(false)
  }

  const dateStr = new Date(att.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <tr className="group border-b border-violet-100/60 transition hover:bg-violet-50/60">
      {/* アイコン */}
      <td className="py-2 pl-3 pr-1 text-center text-base leading-none">{getFileIcon(att.mimeType, att.name)}</td>

      {/* ファイル名 */}
      <td className="px-2 py-2">
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename()
              if (e.key === "Escape") setEditing(false)
            }}
            className="w-full rounded-lg border border-violet-300 bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-900 outline-none focus:ring-1 focus:ring-violet-400"
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-violet-900">{att.name}</span>
            <button
              type="button"
              onClick={startEdit}
              title="名前を編集"
              className="shrink-0 rounded-full border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[9px] text-violet-500 transition hover:bg-violet-100 hover:text-violet-700"
            >
              ✏️ 編集
            </button>
          </div>
        )}
      </td>

      {/* 日時 */}
      <td className="whitespace-nowrap px-2 py-2 text-[10px] text-violet-400">{dateStr}</td>

      {/* ボタン群 */}
      <td className="py-2 pr-3">
        <div className="flex items-center justify-end gap-1">
          <a
            href={att.filePath}
            download={att.name}
            className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[9px] font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            ⬇ DL
          </a>
          <a
            href={att.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[9px] font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            👁 開封
          </a>
          <button
            type="button"
            onClick={() => onDelete(att.id)}
            className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[9px] font-semibold text-rose-500 transition hover:bg-rose-100 hover:text-rose-700"
          >
            🗑 削除
          </button>
        </div>
      </td>
    </tr>
  )
}

export function CandidateFileVault({ candidateId, initialAttachments }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("candidateId", candidateId)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.attachment) {
        setAttachments((prev) => [data.attachment, ...prev])
      }
    } finally {
      setIsUploading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  function handleDelete(id: string) {
    fetch(`/api/files/${id}`, { method: "DELETE" })
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  function handleRename(id: string, name: string) {
    setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)))
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`rounded-full border px-3 py-1 text-[10px] font-semibold shadow-[0_14px_26px_-22px_rgba(124,58,237,0.7)] transition ${
          isOpen
            ? "border-violet-400/80 bg-[linear-gradient(135deg,rgba(139,92,246,0.88),rgba(168,85,247,0.82))] text-white shadow-[0_14px_26px_-18px_rgba(124,58,237,0.85)]"
            : "border-violet-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,255,0.92))] text-violet-700 hover:bg-violet-50"
        }`}
      >
        {isOpen ? "✦ 書庫を閉じる" : "✦ ファイル格納"}
      </button>

      {isOpen && (
        <div className="order-last mt-1 w-full overflow-hidden rounded-[1.4rem] border border-violet-200/60 bg-[linear-gradient(135deg,rgba(252,247,255,0.98),rgba(248,245,255,0.97),rgba(242,249,255,0.96))] shadow-[0_20px_44px_-28px_rgba(109,40,217,0.52)] backdrop-blur-xl">
          {/* ヘッダー */}
          <div className="flex items-center justify-between border-b border-violet-100/50 bg-[linear-gradient(90deg,rgba(167,139,250,0.16),rgba(196,167,253,0.12),rgba(147,197,253,0.12))] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">✦</span>
              <span className="text-[11px] font-black tracking-wider text-violet-800">秘蔵の書庫</span>
              <span className="text-base leading-none">✦</span>
              <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-600">
                {attachments.length}件の巻物
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,rgba(124,58,237,0.9),rgba(168,85,247,0.86))] px-3 py-1 text-[10px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(124,58,237,0.75)] transition hover:shadow-[0_10px_24px_-8px_rgba(124,58,237,0.9)] disabled:opacity-60"
            >
              {isUploading ? (
                <><span className="animate-spin text-xs">✦</span>格納中...</>
              ) : (
                <><span className="text-xs">📜</span>巻物を格納</>
              )}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="space-y-2 p-3">
            {/* ドロップゾーン */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed py-3 text-center transition ${
                dragOver
                  ? "border-violet-400 bg-violet-50"
                  : "border-violet-200/60 bg-white/50 hover:border-violet-300 hover:bg-violet-50/50"
              }`}
            >
              <div className="text-xl leading-none">🌟</div>
              <div className="mt-1 text-[10px] font-semibold text-violet-600">
                {dragOver ? "ここに落とせ！" : "巻物をここに召喚、またはクリック"}
              </div>
              <div className="text-[9px] text-violet-400">PDF・Word・画像・Excel など何でも可</div>
            </div>

            {/* ファイル一覧 */}
            {attachments.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-6 text-center">
                <div className="text-4xl leading-none opacity-30">📚</div>
                <p className="text-[11px] text-violet-400">まだ巻物が格納されていません</p>
                <p className="text-[9px] text-violet-300">知識を集め、力を蓄えよ</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-violet-100/70 bg-white/80">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-violet-100 bg-[linear-gradient(90deg,rgba(237,233,254,0.7),rgba(245,243,255,0.6))] text-[9px] font-bold uppercase tracking-wider text-violet-500">
                      <th className="py-1.5 pl-3 pr-1 text-center" style={{ width: 32 }} />
                      <th className="px-2 py-1.5 text-left">ファイル名</th>
                      <th className="px-2 py-1.5 text-left" style={{ width: 140 }}>格納日時</th>
                      <th className="py-1.5 pr-3 text-right" style={{ width: 160 }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments.map((att) => (
                      <FileRow key={att.id} att={att} onDelete={handleDelete} onRename={handleRename} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
