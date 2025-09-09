import React from 'react';

export default function EmptyState({ title = 'Sonuç bulunamadı', suggestions = [], onReset }) {
  return (
    <div className="kh-empty">
      <h3 className="kh-empty-title">{title}</h3>
      {!!suggestions.length && (
        <ul className="kh-empty-list">
          {suggestions.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      )}
      {onReset && (
        <button className="kh-btn kh-btn-ghost" onClick={onReset}>Filtreleri temizle</button>
      )}
    </div>
  );
}
