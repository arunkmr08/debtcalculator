import React from 'react'
import dayjs from 'dayjs'
import { summarizeLoan, Loan } from '../utils/calc'
import { useStore } from '../store'

export function KPI({ loans }: { loans: Loan[] }) {
  const { ui } = useStore()
  const summaries = loans.map(summarizeLoan)
  const filtered = ui.showClosed ? summaries : summaries.filter(s => s.remaining > 1)

  const totalOutstanding = filtered.reduce((a, s) => a + s.remaining, 0)
  const totalEmi = loans.reduce((a, l) => a + summarizeLoan(l).emi, 0)
  const totalInterestSaved = filtered.reduce((a, s) => a + s.interestSaved, 0)
  const latestPayoff = filtered.reduce((latest, s) => s.payoffExtra > latest ? s.payoffExtra : latest, '2000-01-01')

  const k = (label: string, value: React.ReactNode, sub?: string) => (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  )

  const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {k('Total Outstanding', `₹${fmt(Math.round(totalOutstanding))}`)}
      {k('Total EMI (Std.)', `₹${fmt(Math.round(totalEmi))}`, 'Sum of base EMIs')}
      {k('Interest Saved', `₹${fmt(Math.round(totalInterestSaved))}`, 'vs no extra payments')}
      {k('Latest Payoff Date', filtered.length ? dayjs(latestPayoff).format('MMM YYYY') : '—')}
    </div>
  )
}