"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type SearchableOption = {
  label: string
  value: string
}

type PopupPosition = {
  top: number
  left: number
  width: number
}

type Props = {
  name?: string
  options: readonly (string | SearchableOption)[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

function normalizeOptions(options: readonly (string | SearchableOption)[]): SearchableOption[] {
  return options.map((option) => (typeof option === "string" ? { label: option, value: option } : option))
}

export function SearchableSelect({
  name,
  options,
  defaultValue = "",
  value,
  onValueChange,
  placeholder = "選択してください",
  required = false,
  className,
}: Props) {
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options])
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const selectedValue = isControlled ? value : internalValue
  const selectedOption = normalizedOptions.find((option) => option.value === selectedValue)
  const filteredOptions = normalizedOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery("")
      return
    }

    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || popupRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [open])

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return

    function updatePosition() {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      setPopupPosition({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [open])

  function commitValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  function handleSelect(nextValue: string) {
    commitValue(nextValue)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      {name ? <input type="hidden" name={name} value={selectedValue} data-searchable-select-value={required ? "required" : "optional"} readOnly /> : null}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left",
          !selectedOption ? "text-zinc-400" : "text-zinc-900",
          className
        )}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-zinc-500 transition-transform", open && "rotate-180")} />
      </button>

      {mounted && open && popupPosition
        ? createPortal(
            <div
              ref={popupRef}
              style={{
                position: "absolute",
                top: popupPosition.top,
                left: popupPosition.left,
                width: popupPosition.width,
                zIndex: 9999,
              }}
              className="rounded-[1.2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,244,255,0.95))] p-2 shadow-[0_28px_50px_-28px_rgba(76,29,149,0.88)] ring-1 ring-fuchsia-100/60 backdrop-blur-xl"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="候補を検索"
                  className="h-10 w-full rounded-xl border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(251,247,255,0.95))] pr-3 pl-9 text-sm text-[#2f1b3b] outline-none"
                />
              </div>
              <div className="mt-2 max-h-56 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isSelected = option.value === selectedValue

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                          isSelected ? "bg-[linear-gradient(135deg,rgba(251,113,133,0.12),rgba(168,85,247,0.12))] text-rose-700" : "text-zinc-700 hover:bg-[linear-gradient(135deg,rgba(250,245,255,0.92),rgba(239,246,255,0.92))]"
                        )}
                      >
                        <span>{option.label}</span>
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                      </button>
                    )
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-zinc-400">候補がありません</div>
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
