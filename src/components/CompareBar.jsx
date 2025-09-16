import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/hooks/useComparison";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/hooks/toast-utils";
import { useTranslation } from "react-i18next";

export default function CompareBar() {
  const navigate = useNavigate();
  const { plansToCompare, removePlanFromCompare, clearComparison } =
    useComparison();
  const { toast } = useToastContext();
  const [showCopyFallback, setShowCopyFallback] = useState(false);
  const copyRef = useRef(null);
  const { t } = useTranslation(); // Eğer i18n kullanıyorsanız

  // Maks gösterim (isteğe bağlı): 4 plan
  const MAX_ITEMS = 4;
  const limitedPlans = useMemo(
    () => plansToCompare.slice(0, MAX_ITEMS),
    [plansToCompare]
  );
  const hiddenCount = plansToCompare.length - limitedPlans.length;

  const ids = useMemo(
    () => limitedPlans.map((p) => p.id).join(","),
    [limitedPlans]
  );
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/compare?ids=${ids}`;
  }, [ids]);

  const canCompare = ids && limitedPlans.length >= 2;
  if (!plansToCompare || plansToCompare.length === 0) return null;

  const handleCompare = () => {
    if (!canCompare) return;
    navigate(`/compare?ids=${ids}`);
  };
  const handleShare = async () => {
    if (!ids) return;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: t("sharedTitle"),
          text: t("sharedText"),
          url: shareUrl,
        });
        toast({ title: t("shared") });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Bağlantı panoya kopyalandı" });
        return;
      }
      // HTTPS değilse veya izin verilmediyse manual fallback
      setShowCopyFallback(true);
      setTimeout(() => copyRef.current?.select(), 0);
    } catch {
      setShowCopyFallback(true);
      setTimeout(() => copyRef.current?.select(), 0);
      toast({ title: t("copyFailed"), variant: "destructive" });
    }
  };

  const handleRemoveKey = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      removePlanFromCompare(id);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(1100px,92vw)] z-50">
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur border rounded-2xl p-2 shadow-2xl">
        {/* Sol: Seçilen planlar */}
        <div
          className="flex gap-2 overflow-x-auto pr-2 max-w-[70%] scrollbar-thin"
          aria-label="Seçilen planlar"
        >
          {limitedPlans.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl shrink-0"
              title={p.name}
            >
              {p.provider?.logo && (
                <img
                  src={p.provider.logo}
                  alt={`${p.provider?.name || "Sağlayıcı"} logosu`}
                  className="w-5 h-5 rounded object-contain"
                  loading="lazy"
                />
              )}
              <span className="text-sm whitespace-nowrap">{p.name}</span>
              <button
                className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
                aria-label={t("removePlanAria")}
                onClick={() => removePlanFromCompare(p.id)}
                onKeyDown={(e) => handleRemoveKey(e, p.id)}
              >
                ×
              </button>
            </div>
          ))}

          {hiddenCount > 0 && (
            <div className="text-xs text-muted-foreground self-center whitespace-nowrap">
              + {hiddenCount} {t("moreCount")}
            </div>
          )}
        </div>

        {/* Sağ: Aksiyonlar */}
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={handleCompare} size="sm" disabled={!canCompare}>
            {t("compare")} {limitedPlans.length}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            disabled={!ids}
          >
            {t("share")}
          </Button>

          <Button onClick={clearComparison} variant="ghost" size="sm">
            {t("clear")}
          </Button>
        </div>
      </div>

      {/* Kopyalama fallback (HTTPS dışı veya izin yoksa) */}
      {showCopyFallback && (
        <div className="mt-2 flex items-center gap-2 bg-background border rounded-xl p-2 shadow">
          <input
            ref={copyRef}
            value={shareUrl}
            readOnly
            className="w-full rounded-md border px-3 py-1 text-sm"
            onFocus={(e) => e.target.select()}
          />
          <Button
            size="sm"
            onClick={() => {
              copyRef.current?.select();
              document.execCommand("copy");
              toast({ title: t("copied") });
            }}
          >
            Kopyala
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCopyFallback(false)}
          >
            Kapat
          </Button>
        </div>
      )}
    </div>
  );
}
