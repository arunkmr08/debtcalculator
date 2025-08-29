# Debt Calculator (React + TS + Tailwind)

A responsive to manage multiple loans, compute EMIs, amortization with monthly extra payments, and show portfolio-level KPIs. Built with **Vite + React + TypeScript + Tailwind**; state via **Zustand**; dates via **dayjs**.

## Features
- Editable loan table (add/delete rows). Columns: Description, Actual Loan Amount, Loan Started On, Annual Interest %, Original Tenure (months), **Remaining Loan (auto)**, Monthly Extra.
- Calculates **standard EMI**, amortization schedule, **new payoff date with extras**, interest remaining, and **interest saved** (vs no extra).
- Portfolio totals: Total Outstanding, Total EMI, Interest Saved, Latest Payoff Date.
- Filters: show/hide closed loans; Sort: payoff date / outstanding.
- **APP**: installable (manifest + service worker), offline app shell, **localStorage persistence** of data.
- UX: mobile-first, sticky header, keyboard-friendly inputs, basic validation.
- Export: CSV (rows + summaries). Print-friendly page (use _Print PDF_).

## Stack
- Vite, React 18, TypeScript
- Tailwind CSS
- Zustand for state
- dayjs for date math
- Vitest for unit tests

## Dev
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Tests
```bash
npm test
```

## How calculations work
- EMI: `P * r * (1+r)^n / ((1+r)^n - 1)` where `r = annualRate/12/100`, `n = months`.
- Extra payments applied monthly **toward principal**; schedule recomputed until principal <= 0.
- Remaining balance is computed from the extra-payment schedule **as of today**.

## Sample data
- Home Loan: ₹25,00,000, start 2023-04-01, 8.2%, 240 months, extra ₹2,000/month
- Car Loan: ₹6,00,000, start 2024-06-15, 10%, 60 months, extra ₹1,000/month

## Notes
- Icons are simple placeholders; replace in `public/icons/` for production.
- For stricter validation and skeleton loaders, you can extend the inputs and show shimmer while recomputing heavy schedules (current calc is performant for typical ranges).
