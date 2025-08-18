import dayjs from 'dayjs';

interface Loan {
  amount: number;
  startDate: string;
  interestRate: number;
  tenure: number;
  extraPayment: number;
}

export function calculateLoanSummary(loan: Loan) {
  const P = loan.amount;
  const r = loan.interestRate / 12 / 100;
  const n = loan.tenure;
  const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  let balance = P;
  let totalInterest = 0;
  let months = 0;

  while (balance > 0 && months < 1000) {
    const interest = balance * r;
    let principal = emi - interest + loan.extraPayment;
    if (principal > balance) principal = balance;
    balance -= principal;
    totalInterest += interest;
    months++;
  }

  const payoffDate = dayjs(loan.startDate).add(months, 'month').format('YYYY-MM-DD');
  const originalTotalInterest = emi * n - P;
  const interestSaved = originalTotalInterest - totalInterest;

  return {
    emi: Math.round(emi),
    payoffDate,
    remaining: Math.max(0, Math.round(balance)),
    interestSaved: Math.round(interestSaved),
  };
}

export function getAmortizationSchedule(loan: Loan) {
  const r = loan.interestRate / 12 / 100;
  const emi = loan.amount * r * Math.pow(1 + r, loan.tenure) / (Math.pow(1 + r, loan.tenure) - 1);
  let balance = loan.amount;
  let month = 0;
  const result = [];

  while (balance > 0 && month < 1000) {
    const interest = balance * r;
    let principal = emi - interest + loan.extraPayment;
    if (principal > balance) principal = balance;
    balance -= principal;
    result.push({ month: month + 1, balance: Math.max(0, Math.round(balance)) });
    month++;
  }

  return result;
}