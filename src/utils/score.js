// src/utils/score.js
export function norm(value, min, max, invert=false) {
  if (value == null || isNaN(value)) return 0
  const v = Math.min(Math.max(Number(value), min), max)
  const n = (v - min) / Math.max(1e-9, (max - min))
  return invert ? (1 - n) : n
}
export function computePlanScore(plan, weights={price:25, performance:25, support:25, refund:25}) {
  const w = { ...{price:25, performance:25, support:25, refund:25}, ...weights }
  const sum = Object.values(w).reduce((a,b)=>a+b,0) || 100
  const wp = { price: w.price/sum, performance: w.performance/sum, support: w.support/sum, refund: w.refund/sum }
  const p_price = norm(plan.price ?? plan.priceMonthly ?? plan.price_monthly, 0, 1000, true)
  const storage = plan.storageGb ?? plan.storage_gb ?? plan.storage
  const bandwidth = plan.bandwidthTb ?? plan.bandwidth_tb ?? plan.bandwidth
  const p_perf = (norm(storage, 0, 1000) + norm(bandwidth, 0, 50)) / 2
  const support247 = (plan.support247 ?? plan.support_247) ? 1 : 0
  const sla = plan.sla || 0
  const p_support = (support247 + norm(sla, 0, 100)) / 2
  const refundDays = plan.moneyBack ?? plan.money_back_days ?? 0
  const p_refund = norm(refundDays, 0, 60)
  const score = 100 * (wp.price * p_price + wp.performance * p_perf + wp.support * p_support + wp.refund * p_refund)
  return Math.round(score)
}
