import React, { useMemo } from 'react'
import { useStore } from '../store'
import { summarizeLoan, Loan } from '../utils/calc'
import dayjs from 'dayjs'
import { X } from 'lucide-react'

function MiniChart({ points }: { points: number[] }) {
  // Guard against empty/1-point arrays
  const safe = points.length >= 2 ? points : [0, 0]
  const w = 280, h = 80
  const max = Math.max(...safe, 1)
  const min = Math.min(...safe, 0)
  const range = Math.max(max - min, 1)
  const d = safe
    .map((p, i) => {
      const x = (i / Math.max(safe.length - 1, 1)) * (w - 10) + 5
      const y = h - 5 - ((p - min) / range) * (h - 10)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} className="w-full h-20" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" className="text-sky-500" strokeWidth={2} />
    </svg>
  )
}

export function LoanDrawer() {
  const { loans, ui, select } = useStore()
  const loan = loans.find((l: Loan) => l.id === ui.selectedId) ?? null
  const summary = useMemo(() => (loan ? summarizeLoan(loan) : null), [loan])
  const open = !!loan && !!summary

  const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <aside
      role="complementary"
      aria-label="Loan plan details"
      aria-hidden={!open}
      className={`fixed right-0 top-0 bottom-0 z-40 w-full max-w-md bg-white ring-1 ring-gray-200 shadow-xl
                  transition-transform duration-300 will-change-transform overflow-y-auto
                  ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-4 flex items-start justify-between border-b">
        <div>
          <div className="text-sm text-gray-500">Per-loan Summary</div>
          <div className="text-xl font-semibold">{loan ? loan.description : ''}</div>
        </div>
        <button
          type="button"
          aria-label="Close details"
          onClick={() => select(null)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {summary && loan && (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">EMI (Std.)</div>
              <div className="font-semibold">₹{fmt(Math.round(summary.emi))}</div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Interest Remaining (with extra)</div>
              <div className="font-semibold">₹{fmt(Math.round(summary.interestExtra))}</div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">New Payoff Date</div>
              <div className="font-semibold">{dayjs(summary.payoffExtra).format('MMM YYYY')}</div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Interest Saved</div>
              <div className="font-semibold text-emerald-600">₹{fmt(Math.round(summary.interestSaved))}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-1">Balance over time</div>
            <MiniChart points={summary.schedule.map(r => r.balance)} />
          </div>

          <div className="text-xs text-gray-500 mt-3">Payoff dates are calculated (read-only).</div>
        </div>
      )}
    </aside>
  )
}