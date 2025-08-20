import { create, type StateCreator } from 'zustand'
import { Loan } from './utils/calc'

export type SortKey = 'payoff' | 'outstanding'

type UIState = {
  showClosed: boolean
  sortBy: SortKey
  selectedId: string | null
}

type Store = {
  loans: Loan[]
  ui: UIState
  addLoan: () => void
  removeLoan: (id: string) => void
  updateLoan: (id: string, patch: Partial<Loan>) => void
  select: (id: string | null) => void
  setUI: (patch: Partial<UIState>) => void
  reset: () => void
  undo: () => void
}

const LS_KEY = 'debtcalc.state.v1'

const sampleLoans: Loan[] = [
  {
    id: 'L1',
    description: 'Home Loan',
    principal: 2500000,
    startDate: '2023-04-01',
    annualRate: 8.2,
    tenureMonths: 240,
    extraMonthly: 2000,
  },
  {
    id: 'L2',
    description: 'Car Loan',
    principal: 600000,
    startDate: '2024-06-15',
    annualRate: 10,
    tenureMonths: 60,
    extraMonthly: 1000,
  },
]

const sanitizeSortKey = (v: unknown): SortKey => (v === 'outstanding' ? 'outstanding' : 'payoff')

function load(): { loans: Loan[]; ui: UIState } | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    const loans = Array.isArray((parsed as any).loans) ? ((parsed as any).loans as Loan[]) : null
    const uiRaw = (parsed as any).ui && typeof (parsed as any).ui === 'object' ? (parsed as any).ui : null
    if (!loans || !uiRaw) return null

    const ui: UIState = {
      showClosed: !!uiRaw.showClosed,
      sortBy: sanitizeSortKey(uiRaw.sortBy),
      selectedId: uiRaw.selectedId ?? null,
    }
    return { loans, ui }
  } catch {
    return null
  }
}

function persist(d: { loans: Loan[]; ui: UIState }) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(d))
  } catch {}
}

type Snapshot = { loans: Loan[]; ui: UIState }
let history: Snapshot[] = []
const snap = (s: { loans: Loan[]; ui: UIState }): Snapshot => ({
  loans: JSON.parse(JSON.stringify(s.loans)),
  ui: JSON.parse(JSON.stringify(s.ui)),
})

const saved = load()
const initialLoans = saved?.loans ?? sampleLoans
const initialUI: UIState = saved?.ui ?? { showClosed: true, sortBy: 'payoff', selectedId: null }

const createStore: StateCreator<Store> = (set, get) => ({
  loans: initialLoans,
  ui: initialUI,

  addLoan: () =>
    set((s: Store) => {
      history.push(snap(s))
      const id = 'L' + Math.random().toString(36).slice(2, 7)
      const loan: Loan = {
        id,
        description: 'New Loan',
        principal: 100000,
        startDate: new Date().toISOString().slice(0, 10),
        annualRate: 10,
        tenureMonths: 12,
        extraMonthly: 0,
      }
      const next = { ...s, loans: [loan, ...s.loans] }
      persist({ loans: next.loans, ui: next.ui })
      return next
    }),

  removeLoan: (id) =>
    set((s: Store) => {
      history.push(snap(s))
      const next = {
        ...s,
        loans: s.loans.filter((l: Loan) => l.id !== id),
        ui: { ...s.ui, selectedId: s.ui.selectedId === id ? null : s.ui.selectedId },
      }
      persist({ loans: next.loans, ui: next.ui })
      return next
    }),

  updateLoan: (id, patch) =>
    set((s: Store) => {
      history.push(snap(s))
      const next = { ...s, loans: s.loans.map((l: Loan) => (l.id === id ? { ...l, ...patch } : l)) }
      persist({ loans: next.loans, ui: next.ui })
      return next
    }),

  select: (id) =>
    set((s: Store) => {
      const next = { ...s, ui: { ...s.ui, selectedId: id } }
      persist({ loans: next.loans, ui: next.ui })
      return next
    }),

  setUI: (patch) =>
    set((s: Store) => {
      const nextUI: UIState = {
        ...s.ui,
        ...patch,
        sortBy: patch.sortBy ? sanitizeSortKey(patch.sortBy) : s.ui.sortBy,
      }
      const next = { ...s, ui: nextUI }
      persist({ loans: next.loans, ui: next.ui })
      return next
    }),

  reset: () =>
    set((s: Store) => {
      history.push(snap(s))
      const next: { loans: Loan[]; ui: UIState } = {
        loans: sampleLoans,
        ui: { showClosed: true, sortBy: 'payoff', selectedId: null },
      }
      persist(next)
      return next as Store
    }),

  undo: () =>
    set((s: Store) => {
      const prev = history.pop()
      if (!prev) return s
      const next = { ...s, loans: prev.loans, ui: prev.ui }
      persist(next)
      return next
    }),
})

export const useStore = create<Store>(createStore)