import React from 'react';
import { formatCurrency } from '../utils/currency';

export default function PriceBadge({ priceMonthly, priceRenewal, currency = 'TRY' }) {
  return (
    <div className="kh-price-badge" aria-label="Fiyat rozetleri">
      <div className="kh-badge kh-badge-primary" title="Aylık başlangıç fiyatı">
        {formatCurrency(priceMonthly, currency)}/ay
      </div>
      {typeof priceRenewal === 'number' && (
        <div className="kh-badge kh-badge-soft" title="Yenileme fiyatı">
          Yenileme: {formatCurrency(priceRenewal, currency)}
        </div>
      )}
    </div>
  );
}
