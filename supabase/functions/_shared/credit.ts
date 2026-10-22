// Credit facility logic — ported from base44/shared/credit.ts.
// Every member starts with a R500 credit limit. Good payment behavior
// (on-time membership/credit payments) grows the limit up to R2000.
// Overdue payments reduce the streak. Credit balance is the total of
// outstanding credit-facility purchases (type "credit", not yet paid).

export const BASE_CREDIT = 500;
export const MAX_CREDIT = 2000;
export const STEP = 250;

const BEHAVIOR_TYPES = ["membership", "joining_fee", "credit"];

export function computeCredit(payments: any[]) {
  const good = payments.filter(
    (p) => p.status === "paid" && BEHAVIOR_TYPES.includes(p.type),
  ).length;
  const overdue = payments.filter((p) => p.status === "overdue").length;
  const streak = Math.max(0, good - overdue);
  const creditLimit = Math.min(MAX_CREDIT, BASE_CREDIT + streak * STEP);
  const creditBalance = payments
    .filter((p) => p.type === "credit" && p.status !== "paid")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  return { good, overdue, streak, creditLimit, creditBalance };
}
