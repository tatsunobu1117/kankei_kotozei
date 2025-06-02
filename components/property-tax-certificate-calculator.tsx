"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, Home, MapPin, ArrowRight, FileText } from "lucide-react"

const PropertyTaxCertificateCalculator = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [buildingPropertyTax, setBuildingPropertyTax] = useState("")
  const [buildingCityPlanningTax, setBuildingCityPlanningTax] = useState("")
  const [landPropertyTax, setLandPropertyTax] = useState("")
  const [landCityPlanningTax, setLandCityPlanningTax] = useState("")

  // 数値フォーマット（カンマ区切り）
  const formatNumber = (value: string) => {
    const num = value.replace(/,/g, "")
    if (num === "" || isNaN(Number(num))) return value
    return Number.parseInt(num).toLocaleString()
  }

  // 文字列から数値取得
  const parseNumber = (value: string) => {
    return Number.parseInt(value.replace(/,/g, "")) || 0
  }

  // 建物固定資産税入力処理を修正
  const handleBuildingPropertyTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 入力中はカンマを取り除いた値を使用
    const rawValue = e.target.value.replace(/,/g, "")
    setBuildingPropertyTax(rawValue)
  }

  // 建物都市計画税入力処理を修正
  const handleBuildingCityPlanningTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 入力中はカンマを取り除いた値を使用
    const rawValue = e.target.value.replace(/,/g, "")
    setBuildingCityPlanningTax(rawValue)
  }

  // 土地固定資産税入力処理を修正
  const handleLandPropertyTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 入力中はカンマを取り除いた値を使用
    const rawValue = e.target.value.replace(/,/g, "")
    setLandPropertyTax(rawValue)
  }

  // 土地都市計画税入力処理を修正
  const handleLandCityPlanningTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 入力中はカンマを取り除いた値を使用
    const rawValue = e.target.value.replace(/,/g, "")
    setLandCityPlanningTax(rawValue)
  }

  // フォーカスが外れたときにフォーマットを適用する関数を追加
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const formatted = formatNumber(e.target.value)
    setter(formatted)
  }

  // うるう年判定
  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  // 年間日数取得
  const getDaysInYear = (year: number) => {
    return isLeapYear(year) ? 366 : 365
  }

  // 1月1日からの経過日数計算（決済日前日まで）
  const getDaysFromNewYear = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const startOfYear = new Date(year, 0, 1)
    const diffTime = date.getTime() - startOfYear.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // 残り日数計算（決済日から年末まで）
  const getRemainingDays = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const totalDays = getDaysInYear(year)
    const passedDays = getDaysFromNewYear(dateString)
    return totalDays - passedDays
  }

  // 税額合計計算
  const calculateTotalTax = () => {
    const buildingPropTax = parseNumber(buildingPropertyTax)
    const buildingCityTax = parseNumber(buildingCityPlanningTax)
    const landPropTax = parseNumber(landPropertyTax)
    const landCityTax = parseNumber(landCityPlanningTax)

    const buildingTotal = buildingPropTax + buildingCityTax
    const landTotal = landPropTax + landCityTax
    const totalTax = buildingTotal + landTotal

    return {
      buildingPropTax,
      buildingCityTax,
      landPropTax,
      landCityTax,
      buildingTotal,
      landTotal,
      totalTax,
    }
  }

  const taxResult = calculateTotalTax()
  const selectedYear = new Date(selectedDate).getFullYear()
  const daysFromNewYear = getDaysFromNewYear(selectedDate)
  const remainingDays = getRemainingDays(selectedDate)
  const totalDaysInYear = getDaysInYear(selectedYear)
  const dailyRate = taxResult.totalTax / totalDaysInYear
  const sellerPayment = Math.round(dailyRate * daysFromNewYear)
  const buyerPayment = Math.round(dailyRate * remainingDays)

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
          <FileText className="text-blue-600" size={24} />
          固定資産関係証明書 日割り計算
        </h1>
        <p className="text-sm text-gray-600">関係証明書記載の税額から日割り精算計算</p>
      </div>

      <div className="space-y-6">
        {/* 日付選択 */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-purple-700">
            <Calendar size={18} />
            決済日（所有権移転日）
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="text-sm">
              <div>
                {selectedYear}年1月1日から <span className="font-semibold text-purple-600">{daysFromNewYear}日目</span>
              </div>
              <div>
                年間日数: {totalDaysInYear}日 {isLeapYear(selectedYear) ? "（うるう年）" : ""}
              </div>
            </div>
            <div className="text-sm">
              <div>
                売主負担: <span className="font-semibold text-red-600">{daysFromNewYear}日</span>
              </div>
              <div>
                買主負担: <span className="font-semibold text-blue-600">{remainingDays}日</span>
              </div>
            </div>
          </div>
        </div>

        {/* 入力部分 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 建物税額 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
              <Home size={18} />
              建物税額
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">固定資産税</label>
                <input
                  type="text"
                  value={buildingPropertyTax}
                  onChange={handleBuildingPropertyTaxChange}
                  onBlur={(e) => handleBlur(e, setBuildingPropertyTax)}
                  className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="168,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">都市計画税</label>
                <input
                  type="text"
                  value={buildingCityPlanningTax}
                  onChange={handleBuildingCityPlanningTaxChange}
                  onBlur={(e) => handleBlur(e, setBuildingCityPlanningTax)}
                  className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="36,000"
                />
              </div>
              <div className="bg-blue-100 p-2 rounded text-sm mt-2">
                <div className="font-semibold">建物合計: {taxResult.buildingTotal.toLocaleString()}円</div>
              </div>
            </div>
          </div>

          {/* 土地税額 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
              <MapPin size={18} />
              土地税額
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">固定資産税</label>
                <input
                  type="text"
                  value={landPropertyTax}
                  onChange={handleLandPropertyTaxChange}
                  onBlur={(e) => handleBlur(e, setLandPropertyTax)}
                  className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="84,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">都市計画税</label>
                <input
                  type="text"
                  value={landCityPlanningTax}
                  onChange={handleLandCityPlanningTaxChange}
                  onBlur={(e) => handleBlur(e, setLandCityPlanningTax)}
                  className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="36,000"
                />
              </div>
              <div className="bg-green-100 p-2 rounded text-sm mt-2">
                <div className="font-semibold">土地合計: {taxResult.landTotal.toLocaleString()}円</div>
              </div>
            </div>
          </div>
        </div>

        {/* 結果部分 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
            <h3 className="font-semibold mb-2 text-orange-700">年間税額（合計金額）</h3>
            <div className="text-2xl font-bold text-orange-700">{taxResult.totalTax.toLocaleString()}円</div>
            <div className="text-sm text-gray-600 mt-1">関係証明書記載額の合計</div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <h3 className="font-semibold mb-2 text-red-700">売主負担分</h3>
            <div className="text-xl font-bold text-red-700">{sellerPayment.toLocaleString()}円</div>
            <div className="text-sm text-gray-600 mt-1">{daysFromNewYear}日分（1/1〜決済日前日）</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-semibold mb-2 text-blue-700">買主負担分</h3>
            <div className="text-xl font-bold text-blue-700">{buyerPayment.toLocaleString()}円</div>
            <div className="text-sm text-gray-600 mt-1">{remainingDays}日分（決済日〜12/31）</div>
          </div>
        </div>

        {/* 日割り精算の視覚的表示 */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">日割り精算イメージ</h3>
          <div className="flex items-center gap-2 text-sm mb-2">
            <div className="bg-red-100 px-3 py-1 rounded text-red-700 font-semibold">売主負担 {daysFromNewYear}日</div>
            <ArrowRight size={16} />
            <div className="bg-blue-100 px-3 py-1 rounded text-blue-700 font-semibold">買主負担 {remainingDays}日</div>
            <div className="ml-auto text-gray-600">計 {totalDaysInYear}日</div>
          </div>
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden flex">
            <div className="h-full bg-red-400" style={{ width: `${(daysFromNewYear / totalDaysInYear) * 100}%` }}></div>
            <div className="h-full bg-blue-400" style={{ width: `${(remainingDays / totalDaysInYear) * 100}%` }}></div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            1日あたり: {dailyRate.toFixed(2)}円 × 日数 = 負担額（四捨五入）
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyTaxCertificateCalculator
