import { describe, it, expect } from 'vitest'
import { emi, amortizeWithExtra, summarizeLoan } from './calc'

describe('calc utils', () => {
  it('emi basic', () => {
    const e = emi(2500000, 8.2, 240)
    expect(Math.round(e)).toBe(21223)
  })

  it('extra payment reduces tenure', () => {
    const base = amortizeWithExtra(600000, 10, 60, '2024-06-15', 0)
    const extra = amortizeWithExtra(600000, 10, 60, '2024-06-15', 1000)
    expect(extra.length).toBeLessThan(base.length)
  })

  it('summary interest saved positive with extra', () => {
    const loan = {
      id: 'h1',
      description: 'Home Loan',
      principal: 2500000,
      startDate: '2023-04-01',
      annualRate: 8.2,
      tenureMonths: 240,
      extraMonthly: 2000,
    }
    const s = summarizeLoan(loan)
    expect(s.interestSaved).toBeGreaterThan(0)
  })
})