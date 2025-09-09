import React from 'react';

export default function SkeletonList({ rows = 6 }) {
  return (
    <div className="kh-skel-grid">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="kh-skel-card" aria-hidden />
      ))}
    </div>
  );
}
