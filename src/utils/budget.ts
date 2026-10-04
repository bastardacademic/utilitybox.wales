/** Monthly budget maths, compared against the 50/30/20 guideline (needs / wants / savings). */

export type BudgetBucket = 'needs' | 'wants' | 'savings';

export interface BudgetCategory {
  id: string;
  label: string;
  bucket: BudgetBucket;
  defaultAmount: number;
}

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: 'rent', label: 'Rent or mortgage', bucket: 'needs', defaultAmount: 900 },
  { id: 'council', label: 'Council tax', bucket: 'needs', defaultAmount: 140 },
  { id: 'utilities', label: 'Energy, water & broadband', bucket: 'needs', defaultAmount: 150 },
  { id: 'groceries', label: 'Groceries', bucket: 'needs', defaultAmount: 300 },
  { id: 'transport', label: 'Transport & fuel', bucket: 'needs', defaultAmount: 120 },
  { id: 'insurance', label: 'Insurance', bucket: 'needs', defaultAmount: 40 },
  { id: 'debt', label: 'Minimum debt repayments', bucket: 'needs', defaultAmount: 0 },
  { id: 'childcare', label: 'Childcare', bucket: 'needs', defaultAmount: 0 },

  { id: 'eatingout', label: 'Eating out & takeaways', bucket: 'wants', defaultAmount: 100 },
  { id: 'subscriptions', label: 'Subscriptions & entertainment', bucket: 'wants', defaultAmount: 50 },
  { id: 'shopping', label: 'Shopping & clothing', bucket: 'wants', defaultAmount: 80 },
  { id: 'travel', label: 'Holidays & travel', bucket: 'wants', defaultAmount: 100 },
  { id: 'otherwants', label: 'Hobbies & other', bucket: 'wants', defaultAmount: 50 },

  { id: 'savings', label: 'Savings & investments', bucket: 'savings', defaultAmount: 300 },
  { id: 'pension', label: 'Extra pension contributions', bucket: 'savings', defaultAmount: 0 }
];

/** The 50/30/20 guideline: 50% of take-home pay on needs, 30% on wants, 20% on savings. */
export const GUIDELINE: Record<BudgetBucket, number> = { needs: 0.5, wants: 0.3, savings: 0.2 };

export interface BucketResult {
  bucket: BudgetBucket;
  spent: number;
  percentOfIncome: number;
  guidelineAmount: number;
  /** Positive = spending more than the guideline; negative = less. */
  difference: number;
}

export interface BudgetResult {
  income: number;
  buckets: Record<BudgetBucket, BucketResult>;
  totalOut: number;
  /** Income minus everything budgeted. Negative means the budget overspends income. */
  leftOver: number;
  leftOverPercent: number;
  /** Share of income going to savings, as a percentage. */
  savingsRate: number;
}

export function calculateBudget(income: number, amounts: Record<string, number>): BudgetResult {
  if (!Number.isFinite(income) || income <= 0) throw new Error('Enter your monthly take-home income (greater than zero)');

  const totals: Record<BudgetBucket, number> = { needs: 0, wants: 0, savings: 0 };
  for (const category of BUDGET_CATEGORIES) {
    const amount = amounts[category.id] ?? 0;
    if (!Number.isFinite(amount) || amount < 0) throw new Error(`${category.label} must be zero or more`);
    totals[category.bucket] += amount;
  }

  const buckets = {} as Record<BudgetBucket, BucketResult>;
  for (const bucket of Object.keys(totals) as BudgetBucket[]) {
    const guidelineAmount = income * GUIDELINE[bucket];
    buckets[bucket] = {
      bucket,
      spent: totals[bucket],
      percentOfIncome: (totals[bucket] / income) * 100,
      guidelineAmount,
      difference: totals[bucket] - guidelineAmount
    };
  }

  const totalOut = totals.needs + totals.wants + totals.savings;
  const leftOver = income - totalOut;

  return {
    income,
    buckets,
    totalOut,
    leftOver,
    leftOverPercent: (leftOver / income) * 100,
    savingsRate: (totals.savings / income) * 100
  };
}
