"use client"

import type React from "react"
import { useState } from "react"
import { Calendar, Calculator, Home, MapPin, ArrowRight } from "lucide-react"

const PropertyTaxCalculator = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [buildingValue, setBuildingValue] = useState("")
  const [landPropertyTaxBase, setLandPropertyTaxBase] = useState("")
  const [landCityPlanningTaxBase, setLandCityPlanningTaxBase] = useState("")
  const [ownershipNumerator, setOwnershipNumerator] = useState("")
  const [ownershipDenominator, setOwnershipDenominator] = useState("10000")

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

  // 建物価格入力処理
  const handleBuildingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value)
    setBuildingValue(formatted)
  }

  // 土地固定資産税課税標準額入力処理
  const handleLandPropertyTaxBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value)
    setLandPropertyTaxBase(formatted)
  }

  // 土地都市計画税課税標準額入力処理
  const handleLandCityPlanningTaxBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value)
    setLandCityPlanningTaxBase(formatted)
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
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) // +1を削除
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

  // 持分計算
  const calculateOwnership = () => {
    const numerator = Number.parseInt(ownershipNumerator) || 0
    const denominator = Number.parseInt(ownershipDenominator) || 1
    return numerator / denominator
  }

  // 税額計算
  const calculateTax = () => {
    const building = Math.floor(parseNumber(buildingValue) / 1000) * 1000 // 建物は1000円未満切り捨て
    const landPropTaxBase = parseNumber(landPropertyTaxBase)
    const landCityTaxBase = parseNumber(landCityPlanningTaxBase)
    const ownership = calculateOwnership()

    // 家屋の税額計算（切り捨てしない）
    const buildingPropertyTax = building * 0.014
    const buildingCityPlanningTax = building * 0.003

    // 土地の税額計算
    const landPropTaxWithOwnership = landPropTaxBase * ownership
    const landPropTaxThousandFloor = Math.floor(landPropTaxWithOwnership / 1000) * 1000
    const landPropertyTax = landPropTaxThousandFloor * 0.014 // 切り捨てしない

    const landCityTaxWithOwnership = landCityTaxBase * ownership
    const landCityTaxThousandFloor = Math.floor(landCityTaxWithOwnership / 1000) * 1000
    const landCityPlanningTaxBeforeFloor = (landCityTaxThousandFloor * 0.003) / 2
    const landCityPlanningTax = Math.floor(landCityPlanningTaxBeforeFloor / 100) * 100 // 100円未満切り捨て

    // 合計
    const totalTax = buildingPropertyTax + buildingCityPlanningTax + landPropertyTax + landCityPlanningTax
    const finalTax = Math.floor(totalTax / 100) * 100 // 100円未満切り捨て

    return {
      building, // 1000円未満切り捨て後の建物価格
      buildingPropertyTax,
      buildingCityPlanningTax,
      landPropertyTax,
      landCityPlanningTax,
      landCityPlanningTaxBeforeFloor,
      totalTax,
      finalTax,
      landPropTaxWithOwnership,
      landPropTaxThousandFloor,
      landCityTaxWithOwnership,
      landCityTaxThousandFloor,
    }
  }

  const taxResult = calculateTax()
  const selectedYear = new Date(selectedDate).getFullYear()
  const daysFromNewYear = getDaysFromNewYear(selectedDate)
  const remainingDays = getRemainingDays(selectedDate)
  const totalDaysInYear = getDaysInYear(selectedYear)
  const dailyRate = taxResult.finalTax / totalDaysInYear
  const sellerPayment = Math.round(dailyRate * daysFromNewYear)
  const buyerPayment = Math.round(dailyRate * remainingDays)

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Calculator className="text-blue-600" size={24} />
          固定資産税・都市計画税 日割り計算
        </h1>
        <p className="text-sm text-gray-600">不動産取引での税額日割り精算計算</p>
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
          {/* 建物情報 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
              <Home size={18} />
              建物評価額
            </h3>
            <input
              type="text"
              value={buildingValue}
              onChange={handleBuildingChange}
              className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12,000,000"
            />
          </div>

          {/* 土地情報 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
              <MapPin size={18} />
              土地課税標準額・持分
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">固定資産税課税標準額</label>
                <input
                  type="text"
                  value={landPropertyTaxBase}
                  onChange={handleLandPropertyTaxBaseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="600,000,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">都市計画税課税標準額</label>
                <input
                  type="text"
                  value={landCityPlanningTaxBase}
                  onChange={handleLandCityPlanningTaxBaseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="1,200,000,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">持分</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ownershipNumerator}
                    onChange={(e) => setOwnershipNumerator(e.target.value)}
                    className="w-16 sm:w-20 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                    placeholder="10"
                  />
                  <span className="text-lg font-bold px-1">/</span>
                  <input
                    type="text"
                    value={ownershipDenominator}
                    onChange={(e) => setOwnershipDenominator(e.target.value)}
                    className="w-20 sm:w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 計算詳細 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">計算詳細</h3>
          <div className="space-y-3 text-sm">
            <div className="border-b pb-2">
              <h4 className="font-semibold text-blue-600 mb-2">
                【建物】
                {taxResult.building > 0 ? taxResult.building.toLocaleString() + "円（1000円未満切り捨て後）" : ""}
              </h4>
              <div className="ml-4 space-y-1">
                <div>
                  {taxResult.building.toLocaleString()} × 1.4% = {taxResult.buildingPropertyTax.toLocaleString()}円 ①
                </div>
                <div>
                  {taxResult.building.toLocaleString()} × 0.3% = {taxResult.buildingCityPlanningTax.toLocaleString()}円
                  ②
                </div>
              </div>
            </div>

            <div className="border-b pb-2">
              <h4 className="font-semibold text-green-600 mb-2">
                【土地】持分 {ownershipNumerator || "0"}/{ownershipDenominator}
              </h4>
              <div className="ml-4 space-y-1">
                <div className="text-blue-800 font-medium">固定資産税:</div>
                <div className="ml-2">
                  <div>
                    {calculateOwnership().toFixed(4)} × {parseNumber(landPropertyTaxBase).toLocaleString()} ={" "}
                    {Math.floor(taxResult.landPropTaxWithOwnership).toLocaleString()}円
                  </div>
                  <div>{taxResult.landPropTaxThousandFloor.toLocaleString()}円（1000円未満切り捨て）</div>
                  <div>
                    {taxResult.landPropTaxThousandFloor.toLocaleString()} × 1.4% ={" "}
                    {taxResult.landPropertyTax.toLocaleString()}円 ③
                  </div>
                </div>
                <div className="text-green-800 font-medium mt-2">都市計画税:</div>
                <div className="ml-2">
                  <div>
                    {calculateOwnership().toFixed(4)} × {parseNumber(landCityPlanningTaxBase).toLocaleString()} ={" "}
                    {Math.floor(taxResult.landCityTaxWithOwnership).toLocaleString()}円
                  </div>
                  <div>{taxResult.landCityTaxThousandFloor.toLocaleString()}円（1000円未満切り捨て）</div>
                  <div>
                    {taxResult.landCityTaxThousandFloor.toLocaleString()} × 0.3% ÷ 2 ={" "}
                    {Math.round(taxResult.landCityPlanningTaxBeforeFloor).toLocaleString()}円 →{" "}
                    {taxResult.landCityPlanningTax.toLocaleString()}円 ④（100円未満切り捨て）
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold">① + ② + ③ + ④ = {Math.round(taxResult.totalTax).toLocaleString()}円</div>
              <div className="font-semibold text-orange-600">
                100円未満切り捨て後: {taxResult.finalTax.toLocaleString()}円
              </div>
            </div>
          </div>
        </div>

        {/* 結果部分 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
            <h3 className="font-semibold mb-2 text-orange-700">年間税額</h3>
            <div className="text-2xl font-bold text-orange-700">{taxResult.finalTax.toLocaleString()}円</div>
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
          <div className="flex items-center gap-2 text-sm">
            <div className="bg-red-100 px-3 py-1 rounded text-red-700 font-semibold">売主負担 {daysFromNewYear}日</div>
            <ArrowRight size={16} />
            <div className="bg-blue-100 px-3 py-1 rounded text-blue-700 font-semibold">買主負担 {remainingDays}日</div>
            <div className="ml-auto text-gray-600">計 {totalDaysInYear}日</div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden flex">
            <div className="h-full bg-red-400" style={{ width: `${(daysFromNewYear / totalDaysInYear) * 100}%` }}></div>
            <div className="h-full bg-blue-400" style={{ width: `${(remainingDays / totalDaysInYear) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyTaxCalculator
