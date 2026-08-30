/** Percentage, VAT, tip, and loan repayment math. */

export function percentOf(percent: number, of: number): number {
  return (percent / 100) * of;
}

export function whatPercentageIs(part: number, whole: number): number {
  if (whole === 0) throw new Error('Cannot divide by zero');
  return (part / whole) * 100;
}

export interface PercentChange {
  difference: number;
  percentChange: number;
}

export function percentChange(from: number, to: number): PercentChange {
  if (from === 0) throw new Error('Starting value cannot be zero');
  const difference = to - from;
  return { difference, percentChange: (difference / from) * 100 };
}

// ---------------------------------------------------------------------------
// VAT (UK default rate 20%)
// ---------------------------------------------------------------------------

export interface VatResult {
  net: number;
  vat: number;
  gross: number;
  rate: number;
}

export function addVat(net: number, rate = 20): VatResult {
  const vat = net * (rate / 100);
  return { net, vat, gross: net + vat, rate };
}

export function removeVat(gross: number, rate = 20): VatResult {
  const net = gross / (1 + rate / 100);
  return { net, vat: gross - net, gross, rate };
}

// ---------------------------------------------------------------------------
// Tip calculator
// ---------------------------------------------------------------------------

export interface TipResult {
  tipAmount: number;
  total: number;
  perPerson: number;
  tipPerPerson: number;
}

export function calculateTip(bill: number, tipPercent: number, people = 1): TipResult {
  if (people < 1) throw new Error('Number of people must be at least 1');
  const tipAmount = bill * (tipPercent / 100);
  const total = bill + tipAmount;
  return {
    tipAmount,
    total,
    perPerson: total / people,
    tipPerPerson: tipAmount / people
  };
}

// ---------------------------------------------------------------------------
// Loan / mortgage repayment (standard amortizing loan formula)
// ---------------------------------------------------------------------------

export interface LoanResult {
  monthlyPayment: number;
  totalRepaid: number;
  totalInterest: number;
}

export function calculateLoanRepayment(principal: number, annualRatePercent: number, termYears: number): LoanResult {
  if (principal <= 0) throw new Error('Loan amount must be greater than zero');
  if (termYears <= 0) throw new Error('Term must be greater than zero');

  const months = termYears * 12;
  const monthlyRate = annualRatePercent / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
  }

  const totalRepaid = monthlyPayment * months;

  return {
    monthlyPayment,
    totalRepaid,
    totalInterest: totalRepaid - principal
  };
}
