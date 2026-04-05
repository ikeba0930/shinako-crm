"use client"

import { useId, useMemo, useState } from "react"
import { Search } from "lucide-react"
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
  const listId = useId()
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options])
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedValue = isControlled ? value : internalValue

  function commitValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  function handleChange(nextValue: string) {
    const matchedOption = normalizedOptions.find((option) => option.value === nextValue || option.label === nextValue)
    commitValue(matchedOption?.value ?? nextValue)
  }

  function handleBlur() {
    if (!selectedValue) return
    const matchedOption = normalizedOptions.find((option) => option.value === selectedValue || option.label === selectedValue)
    if (!matchedOption) {
      commitValue("")
    } else if (matchedOption.value !== selectedValue) {
      commitValue(matchedOption.value)
    }
  }

  return (
    <div className="relative">
      {name ? <input type="hidden" name={name} value={selectedValue} data-searchable-select-value={required ? "required" : "optional"} readOnly /> : null}
      <Search className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        list={listId}
        value={selectedValue}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn("pl-9", className)}
        autoComplete="off"
      />
      <datalist id={listId}>
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </datalist>
    </div>
  )
}
