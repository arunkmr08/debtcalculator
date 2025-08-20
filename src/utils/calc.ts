import dayjs from 'dayjs'

export type Loan = {
  id: string
  description: string
  principal: number
  startDate: string // YYYY-MM-DD
  annualRate: number // percent
  tenureMonths: number
  extraMonthly: number
}

export type ScheduleRow = {
  index: number
  date: string
  payment: number
  interest: number
  principal: number
  extraApplied: number
  balance: number
}

export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export function monthlyRate(annualRate: number) {
  return annualRate / 12 / 100
}

export function emi(principal: number, annualRate: number, n: number) {
  const r = monthlyRate(annualRate)
  if (n <= 0) return 0
  if (r === 0) return principal / n
  return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
}

export function addMonths(iso: string, m: number) {
  return dayjs(iso).add(m, 'month').format('YYYY-MM-DD')
}

export function amortizeWithExtra(principal: number, annualRate: number, n: number, startDate: string, extra: number): ScheduleRow[] {
  const r = monthlyRate(annualRate)
  const payment = emi(principal, annualRate, n)
  let bal = principal
  let i = 0
  const out: ScheduleRow[] = []
  let cursor = startDate

  while (bal > 0.01 && i < n + 600) {
    i += 1
    cursor = addMonths(cursor, 1)
    const interest = bal * r
    let principalPay = payment - interest
    let extraApplied = extra
    if (principalPay + extraApplied > bal) extraApplied = Math.max(0, bal - principalPay)
    const newBal = Math.max(0, bal - principalPay - extraApplied)

    out.push({ index: i, date: cursor, payment, interest, principal: principalPay, extraApplied, balance: newBal })
    bal = newBal
  }
  return out
}

export function summarizeLoan(loan: Loan) {
  const base = amortizeWithExtra(loan.principal, loan.annualRate, loan.tenureMonths, loan.startDate, 0)
  const extra = amortizeWithExtra(loan.principal, loan.annualRate, loan.tenureMonths, loan.startDate, loan.extraMonthly)
  const sumInterest = (s: ScheduleRow[]) => s.reduce((a, r) => a + r.interest, 0)

  const emiStd = emi(loan.principal, loan.annualRate, loan.tenureMonths)
  const payoffBase = base.length ? base[base.length - 1].date : loan.startDate
  const payoffExtra = extra.length ? extra[extra.length - 1].date : loan.startDate
  const interestBase = sumInterest(base)
  const interestExtra = sumInterest(extra)
  const interestSaved = Math.max(0, interestBase - interestExtra)

  const today = dayjs().format('YYYY-MM-DD')
  let remaining = loan.principal
  for (const row of extra) {
    if (row.date <= today) remaining = row.balance
    else break
  }

  return {
    emi: emiStd,
    payoffBase,
    payoffExtra,
    monthsSaved: Math.max(0, base.length - extra.length),
    interestBase,
    interestExtra,
    interestSaved,
    remaining,
    schedule: extra,
    scheduleBase: base,
  }
}