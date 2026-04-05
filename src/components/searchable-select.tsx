"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type SearchableOption = {
  label: string
  value: string
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
  const rootRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const selectedValue = isControlled ? value : internalValue
  const selectedOption = normalizedOptions.find((option) => option.value === selectedValue)
  const filteredOptions = normalizedOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    if (!open) {
      setQuery("")
      return
    }

    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

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

      {open ? (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-full rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="候補を検索"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pr-3 pl-9 text-sm outline-none"
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
                      isSelected ? "bg-rose-50 text-rose-700" : "text-zinc-700 hover:bg-zinc-50"
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
        </div>
      ) : null}
    </div>
  )
}
