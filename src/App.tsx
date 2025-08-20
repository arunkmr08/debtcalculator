import React, { useMemo } from 'react'
import { KPI } from './components/KPI'
import { LoanTable } from './components/LoanTable'
import { LoanDrawer } from './components/LoanDrawer'
import { BottomBar } from './components/BottomBar'
import { useStore, type SortKey } from './store'
import { summarizeLoan, type Loan } from './utils/calc'

type LoanSummary = ReturnType<typeof summarizeLoan>

function useSummaries() {
  const { loans } = useStore()
  return useMemo(() => loans.map(summarizeLoan), [loans])
}

export default function App() {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])

  const { loans, ui, setUI } = useStore()
  const summaries = useSummaries()

  const exportCSV = () => {
    const headers = [
      'Description',
      'Principal',
      'StartDate',
      'AnnualRate',
      'TenureMonths',
      'ExtraMonthly',
      'Remaining',
      'EMI',
      'PayoffExtra',
      'InterestSaved',
    ]
    const rows = loans.map((l: Loan) => {
      const s = summarizeLoan(l)
      return [
        l.description,
        l.principal,
        l.startDate,
        l.annualRate,
        l.tenureMonths,
        l.extraMonthly,
        Math.round(s.remaining),
        Math.round(s.emi),
        s.payoffExtra,
        Math.round(s.interestSaved),
      ]
    })
    const csv = [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'debt-summary.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onPrint = () => window.print()
  const onUndo = () => useStore.getState().undo()

  const closedCount = summaries.filter((s: LoanSummary) => s.remaining <= 1).length

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white w-full">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Debt Calculator</h1>
          <div className="hidden md:flex gap-2 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={ui.showClosed}
                onChange={(e) => setUI({ showClosed: e.currentTarget.checked })}
              />
              Show closed ({closedCount})
            </label>
            <select
              className="rounded-md border-gray-300"
              value={ui.sortBy}
              onChange={(e) => setUI({ sortBy: e.currentTarget.value as SortKey })}
            >
              <option value="payoff">Sort by Payoff Date</option>
              <option value="outstanding">Sort by Outstanding</option>
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="mx-auto max-w-7xl p-4 grid gap-4">
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-gray-100 animate-pulse mt-4" />
        </div>
      ) : (
        <>
          <main className="w-full p-4 grid gap-4">
            <div>
              <KPI loans={loans} />
            </div>
            <div className="w-full">
              <LoanTable />
            </div>
          </main>
          {/* Right-side expanding panel */}
          <LoanDrawer />
        </>
      )}

      {/* Mobile controls */}
      <div className="md:hidden fixed top-2 right-2 z-20 text-xs text-gray-600">
        <label className="inline-flex items-center gap-1 px-2 py-1 bg-white/80 rounded-full ring-1 ring-gray-200 shadow">
          <input
            type="checkbox"
            checked={ui.showClosed}
            onChange={(e) => setUI({ showClosed: e.currentTarget.checked })}
          />
          Show closed ({closedCount})
        </label>
      </div>
      <div className="md:hidden fixed top-10 right-2 z-20 text-xs">
        <select
          className="rounded-md border-gray-300 bg-white/80"
          value={ui.sortBy}
          onChange={(e) => setUI({ sortBy: e.currentTarget.value as SortKey })}
        >
          <option value="payoff">Sort by Payoff Date</option>
          <option value="outstanding">Sort by Outstanding</option>
        </select>
      </div>

      {/* Spacer above sticky bottom bar */}
      <div className="h-24" />

      <div className="no-print">
        <BottomBar onExportCSV={exportCSV} onPrint={onPrint} onUndo={onUndo} />
      </div>
    </div>
  )
}