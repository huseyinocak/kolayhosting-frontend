import React from 'react';
import PriceBadge from './PriceBadge';
import { useCompare } from '../context/CompareContext';

export default function PlanCard({ plan, onDetails }) {
  const compare = useCompare();

  return (
    <article className="kh-card" aria-label={plan.name}>
      <header className="kh-card-header">
        <div className="kh-card-brand">
          {plan.logoUrl ? (
            <img src={plan.logoUrl} alt={(plan.providerName || plan.name) + ' logosu'} className="kh-card-logo" />
          ) : (
            <div className="kh-card-logo kh-card-logo--placeholder" aria-hidden />
          )}
          <div>
            <h3 className="kh-card-title">{plan.name}</h3>
            {plan.providerName && <p className="kh-card-sub">{plan.providerName}</p>}
          </div>
        </div>
        <PriceBadge priceMonthly={plan.priceMonthly} priceRenewal={plan.priceRenewal ?? undefined} currency={plan.currency || 'TRY'} />
      </header>

      {Array.isArray(plan.featuresSummary) && plan.featuresSummary.length > 0 && (
        <ul className="kh-chip-row" aria-label="Öne çıkan özellikler">
          {plan.featuresSummary.slice(0, 5).map((f) => (
            <li key={f} className="kh-chip" title={f}>{f}</li>
          ))}
        </ul>
      )}

      {Array.isArray(plan.badges) && plan.badges.length > 0 && (
        <div className="kh-rozet-row" aria-label="Rozetler">
          {plan.badges.map((b) => (
            <span key={b} className="kh-rozet" title={b}>{b}</span>
          ))}
        </div>
      )}

      <footer className="kh-card-actions">
        <button className="kh-btn kh-btn-primary" onClick={() => compare.add(plan)} aria-label="Karşılaştırmaya ekle">
          Karşılaştır
        </button>
        <button className="kh-btn kh-btn-ghost" onClick={() => onDetails && onDetails(plan.id)} aria-label="Detayları gör">
          Detaylar
        </button>
      </footer>
    </article>
  );
}
