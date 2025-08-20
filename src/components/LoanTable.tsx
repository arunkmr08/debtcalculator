import React, { useMemo } from 'react'
import { useStore } from '../store'
import { summarizeLoan, clamp, type Loan } from '../utils/calc'
import { Trash2 } from 'lucide-react'

type Row = { loan: Loan; summary: ReturnType<typeof summarizeLoan> }

export function LoanTable() {
  const { loans, removeLoan, updateLoan, ui, select, addLoan } = useStore()

  const isInteractive = (el: HTMLElement) =>
    ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'LABEL', 'A', 'SVG', 'PATH'].includes(el.tagName)

  const onRowClick = (e: React.MouseEvent, id: string) => {
    const target = e.target as HTMLElement
    if (target && (isInteractive(target) || target.closest('button,input,select,textarea,a'))) return
    select(id)
  }

  const rows = useMemo(() => {
    const enriched: Row[] = loans.map((l: Loan) => ({ loan: l, summary: summarizeLoan(l) }))
    const filtered: Row[] = ui.showClosed ? enriched : enriched.filter((r: Row) => r.summary.remaining > 1)
    const sorted: Row[] = [...filtered].sort((a: Row, b: Row) => {
      if (ui.sortBy === 'payoff') return a.summary.payoffExtra.localeCompare(b.summary.payoffExtra)
      return b.summary.remaining - a.summary.remaining
    })
    return sorted
  }, [loans, ui.showClosed, ui.sortBy])

  const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div
      className="overflow-auto rounded-2xl ring-1 ring-gray-200 bg-white w-full"
      onKeyDown={(e) => {
        if (e.key === 'Delete') e.stopPropagation()
      }}
    >
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 sticky-header z-10">
          <tr className="[&>th]:py-3 [&>th]:px-3 text-left text-gray-600">
            <th className="sticky left-0 z-20 bg-gray-50">Description</th>
            <th>Principal (₹)</th>
            <th>Start Date</th>
            <th>Rate % (Annual)</th>
            <th>Tenure (yr)</th>
            <th>Tenure (mo)</th>
            <th>Remaining (₹)</th>
            <th>Extra /mo (₹)</th>
            <th>EMI (Std.)</th>
            <th className="w-10"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {rows.map(({ loan, summary }: Row) => (
            <tr
              key={loan.id}
              className={`[&>td]:py-3 [&>td]:px-3 cursor-pointer ${
                ui.selectedId === loan.id ? 'bg-sky-50' : 'hover:bg-sky-50'
              }`}
              onClick={(e) => onRowClick(e, loan.id)}
            >
              {/* Description (sticky) */}
              <td className="sticky left-0 z-10 bg-white">
                <input
                  aria-label="Description"
                  value={loan.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateLoan(loan.id, { description: e.currentTarget.value })
                  }
                  className="w-44 sm:w-56 rounded-md border-gray-300 focus:ring-2 focus:ring-sky-500"
                />
              </td>

              {/* Principal */}
              <td>
                <input
                  type="number"
                  min={0}
                  aria-label="Actual Loan Amount"
                  value={loan.principal}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateLoan(loan.id, { principal: Math.max(0, Number(e.currentTarget.value)) })
                  }
                  className="w-40 rounded-md border-gray-300 focus:ring-2 focus:ring-sky-500 text-right"
                />
              </td>

              {/* Start Date */}
              <td>
                <input
                  type="date"
                  aria-label="Loan Started On"
                  value={loan.startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateLoan(loan.id, { startDate: e.currentTarget.value })
                  }
                  className="w-40 rounded-md border-gray-300 focus:ring-2 focus:ring-sky-500"
                />
              </td>

              {/* Rate */}
              <td>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={0.01}
                  aria-label="Annual Interest Rate"
                  value={loan.annualRate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateLoan(loan.id, { annualRate: clamp(Number(e.currentTarget.value), 0, 30) })
                  }
                  className="w-32 rounded-md border-gray-300 focus:ring-2 focus:ring-sky-500 text-right"
                />
              </td>

              {/* Tenure (yr) */}
              <td>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  aria-label="Original Tenure (years)"
                  title="Enter years; months will auto-calculate"
                  value={Number((loan.tenureMonths / 12).toFixed(1))}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const yrs = Math.max(0.1, Number(e.currentTarget.value || 0))
                    const months = Math.max(1, Math.round(yrs * 12))
                    updateLoan(loan.id, { tenureMonths: months })
                  }}
                  className="w-28 rounded-md border-gray-300 focus:ring-2 focus:ring-sky-500 text-right"
                />
              </td>

              {/* Tenure (mo) */}
              <td>
                <input
                  type="number"
                  min={1}
                  step={1}
                  aria-label="Original Tenure (months)"
                  title="Enter months; years will auto-calculate"
                  value={loan.tenureMonths}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const m = Math.max(1, Math.round(Number(e.currentTarget.value || 0)))
                    updateLoan(loan.id, { tenureMonths: m })
                  }}
                  className="w-28 rounded-md border-gray-300 focus:ring-2 focus:ring-sky-500 text-right"
                />
              </td>

              {/* Remaining */}
              <td className="text-right font-medium">₹{fmt(Math.round(summary.remaining))}</td>

              {/* Extra */}
              <td>
                <input
                  type="number"
                  min={0}
                  aria-label="Monthly Extra Payment"
                  value={loan.extraMonthly}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateLoan(loan.id, { extraMonthly: Math.max(0, Number(e.currentTarget.value)) })
                  }
                  className="w-32 rounded-md border-gray-300 focus:ring-2 focus:ring-sky-500 text-right"
                />
              </td>

              {/* EMI */}
              <td className="text-right">₹{fmt(Math.round(summary.emi))}</td>

              {/* Delete */}
              <td className="text-right">
                <button
                  type="button"
                  aria-label="Delete row"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeLoan(loan.id)
                  }}
                  className="rounded-md p-2 hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            {/* 10 columns in header -> colSpan 10 */}
            <td colSpan={10} className="py-4 px-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  addLoan()
                }}
                className="w-full rounded-lg border border-dashed border-sky-300 bg-sky-50/50 py-3 text-sky-700 hover:bg-sky-100"
              >
                + Add another loan
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}