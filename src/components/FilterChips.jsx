import React from "react";
import { X, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function FilterChips({ items = [], onRemove, onClearAll }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      {items.map((it) => (
        <Badge
          key={it.key}
          variant="secondary"
          className="flex items-center gap-1"
        >
          <span className="max-w-[200px] truncate">
            {it.label}: {it.value}
          </span>
          <button
            aria-label={`Remove ${it.key}`}
            onClick={() => onRemove(it.key)}
            className="ml-1 inline-flex"
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </Badge>
      ))}
      <Button variant="outline" size="sm" onClick={onClearAll} className="ml-2">
        <Trash2 className="mr-1 h-4 w-4" /> Tümünü temizle
      </Button>
    </div>
  );
}
