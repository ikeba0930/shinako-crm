'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-pink-100 max-w-md">
        <p className="text-4xl mb-4">✿</p>
        <h2 className="text-lg font-bold text-pink-700 mb-2">エラーが発生しました</h2>
        <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90"
        >
          もう一度試す
        </button>
      </div>
    </div>
  )
}
