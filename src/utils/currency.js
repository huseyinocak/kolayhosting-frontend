export function formatCurrency(amount, currency = "TRY", locale = "tr-TR") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return (
      new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
        amount
      ) +
      " " +
      currency
    );
  }
}
