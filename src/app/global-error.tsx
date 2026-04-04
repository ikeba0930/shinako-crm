'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-pink-50">
          <div className="text-center p-8">
            <h2 className="text-lg font-bold mb-2">エラーが発生しました</h2>
            <p className="text-sm text-gray-500 mb-4">{error.message}</p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-semibold"
            >
              もう一度試す
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
