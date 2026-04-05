"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  postalCode?: string | null
  address?: string | null
  postalCodeName?: string
  addressName?: string
  postalCodeClassName?: string
  addressClassName?: string
}

type ZipCloudResponse = {
  results?: Array<{
    address1: string
    address2: string
    address3: string
  }> | null
}

function normalizePostalCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 7)
}

export function PostalCodeAddressFields({
  postalCode,
  address,
  postalCodeName = "postalCode",
  addressName = "address",
  postalCodeClassName,
  addressClassName,
}: Props) {
  const [postalCodeValue, setPostalCodeValue] = useState(postalCode ?? "")
  const [addressValue, setAddressValue] = useState(address ?? "")
  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const lastSearchedPostalCodeRef = useRef("")

  useEffect(() => {
    setPostalCodeValue(postalCode ?? "")
  }, [postalCode])

  useEffect(() => {
    setAddressValue(address ?? "")
  }, [address])

  useEffect(() => {
    const normalizedPostalCode = normalizePostalCode(postalCodeValue)

    if (normalizedPostalCode.length !== 7 || normalizedPostalCode === lastSearchedPostalCodeRef.current) {
      return
    }

    const controller = new AbortController()
    setIsSearching(true)
    setErrorMessage("")

    fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${normalizedPostalCode}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("failed")
        }

        const data = (await response.json()) as ZipCloudResponse
        const result = data.results?.[0]

        if (!result) {
          throw new Error("not_found")
        }

        lastSearchedPostalCodeRef.current = normalizedPostalCode
        setAddressValue(`${result.address1}${result.address2}${result.address3}`)
      })
      .catch((error: unknown) => {
        if ((error as Error).name === "AbortError") return
        setErrorMessage("住所が見つかりませんでした")
      })
      .finally(() => {
        setIsSearching(false)
      })

    return () => controller.abort()
  }, [postalCodeValue])

  return (
    <div className="space-y-3">
      <label className="space-y-1 text-sm">
        <span>郵便番号</span>
        <input
          name={postalCodeName}
          value={postalCodeValue}
          onChange={(event) => {
            setPostalCodeValue(normalizePostalCode(event.target.value))
            setErrorMessage("")
          }}
          inputMode="numeric"
          placeholder="1234567"
          className={postalCodeClassName}
        />
        <div className="min-h-4 text-[11px] text-zinc-500">
          {isSearching ? "住所を検索中..." : errorMessage || "7桁入力で住所を検索"}
        </div>
      </label>

      <label className="space-y-1 text-sm">
        <span>現住所</span>
        <input
          name={addressName}
          value={addressValue}
          onChange={(event) => setAddressValue(event.target.value)}
          className={addressClassName}
        />
      </label>
    </div>
  )
}
