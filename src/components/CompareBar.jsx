import React from "react";
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/hooks/useComparison";
import { Button } from "@/components/ui/button";

export default function CompareBar() {
  const navigate = useNavigate();
  const { plansToCompare, removePlanFromCompare, clearComparison } =
    useComparison();

  if (!plansToCompare || plansToCompare.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(1100px,92vw)] z-50">
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur border rounded-2xl p-2 shadow-2xl">
        <div className="flex gap-2 overflow-x-auto pr-2 max-w-[70%]">
          {plansToCompare.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl"
            >
              {p.provider?.logo && (
                <img
                  src={p.provider.logo}
                  alt=""
                  className="w-5 h-5 rounded object-contain"
                />
              )}
              <span className="text-sm whitespace-nowrap">{p.name}</span>
              <button
                className="text-muted-foreground hover:text-foreground"
                aria-label={`${p.name} kaldır`}
                onClick={() => removePlanFromCompare(p.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={() => navigate("/compare")} size="sm">
            Karşılaştır
          </Button>
          <Button onClick={clearComparison} variant="ghost" size="sm">
            Temizle
          </Button>
        </div>
      </div>
    </div>
  );
}
