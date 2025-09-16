// src/components/admin/BulkImportDialog.jsx
import React, { useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToastContext } from "@/hooks/toast-utils";
import { parseCSV } from "@/utils/csv";
import {
  importPlansBulk,
  importProvidersBulk,
  importFeaturesBulk,
} from "@/api/imports";
import { createPlan } from "@/api/plans";
import { createFeature } from "@/api/features";
import { Upload, FileJson, FileSpreadsheet } from "lucide-react";
const SAMPLE_TEMPLATES = {
  plans: {
    csv: `name,provider_id,provider_name,category_id,category_name,price,currency,renewal_price,discount_percentage,features_summary,link,affiliate_url,status,slug
Starter,,KolayHost,,Paylaşımlı,49.90,TRY,59.90,10,"10GB SSD, 1TB trafik",https://example.com/plan,https://example.com/ref,published,starter
Pro,2,,3,,99.90,TRY,119.90,15,"20GB SSD, 2TB trafik",https://example.com/plan-pro,https://example.com/ref-pro,published,pro
`,
    json: JSON.stringify(
      {
        records: [
          {
            name: "Starter",
            provider_name: "KolayHost",
            category_name: "Paylaşımlı",
            price: 49.9,
            currency: "TRY",
            renewal_price: 59.9,
            discount_percentage: 10,
            features_summary: "10GB SSD, 1TB trafik",
            link: "https://example.com/plan",
            affiliate_url: "https://example.com/ref",
            status: "published",
            slug: "starter",
            features: ["SSD", "cPanel", 3],
          },
          {
            name: "Pro",
            provider_id: 2,
            category_id: 3,
            price: 99.9,
            currency: "TRY",
            renewal_price: 119.9,
            discount_percentage: 15,
            features_summary: "20GB SSD, 2TB trafik",
            link: "https://example.com/plan-pro",
            affiliate_url: "https://example.com/ref-pro",
            status: "published",
            slug: "pro",
            features: ["TrafficLimit"],
          },
        ],
      },
      null,
      2
    ),
  },
  providers: {
    csv: `name,website_url,logo_url,description,affiliate_url
KolayHost,https://kolayhost.com,https://kolayhost.com/logo.png,"Hızlı ve uygun fiyat",https://kolayhost.com/ref
SüperHost,https://superhost.com,https://superhost.com/logo.png,"Geniş ürün yelpazesi",https://superhost.com/ref
`,
    json: JSON.stringify(
      {
        records: [
          {
            name: "KolayHost",
            website_url: "https://kolayhost.com",
            logo_url: "https://kolayhost.com/logo.png",
            description: "Hızlı ve uygun fiyat",
            affiliate_url: "https://kolayhost.com/ref",
          },
          {
            name: "SüperHost",
            website_url: "https://superhost.com",
            logo_url: "https://superhost.com/logo.png",
            description: "Geniş ürün yelpazesi",
            affiliate_url: "https://superhost.com/ref",
          },
        ],
      },
      null,
      2
    ),
  },
  features: {
    csv: `name,type,unit
SSD,text,
cPanel,text,
TrafficLimit,number,TB
`,
    json: JSON.stringify(
      {
        records: [
          { name: "SSD", type: "text" },
          { name: "cPanel", type: "text" },
          { name: "TrafficLimit", type: "number", unit: "TB" },
        ],
      },
      null,
      2
    ),
  },
};
function downloadSample(entity, format = "csv") {
  const data = SAMPLE_TEMPLATES?.[entity]?.[format];
  if (!data) return;
  const blob = new Blob([data], {
    type:
      format === "csv"
        ? "text/csv;charset=utf-8"
        : "application/json;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${entity}_sample.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export default function BulkImportDialog({
  open,
  onOpenChange,
  entity = "plans",
  fields = [],
  onImported,
}) {
  const fileRef = useRef(null);
  const { toast } = useToastContext();
  const [format, setFormat] = useState("csv");
  const [preview, setPreview] = useState({ headers: [], rows: [] });
  const [jsonRecords, setJsonRecords] = useState([]);
  const [mapping, setMapping] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headerOptions = useMemo(() => preview.headers || [], [preview]);

  const handleFile = async (file) => {
    const text = await file.text();
    if (format === "csv") {
      const parsed = parseCSV(text);
      setPreview(parsed);
      const initial = {};
      fields.forEach((f) => {
        const found = parsed.headers.find(
          (h) =>
            h.toLowerCase() === f.key.toLowerCase() ||
            h.toLowerCase() === f.label.toLowerCase()
        );
        if (found) initial[f.key] = found;
      });
      setMapping(initial);
    } else {
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) setJsonRecords(data);
        else if (Array.isArray(data.records)) setJsonRecords(data.records);
        else throw new Error("JSON dizi veya {records:[]} formatında olmalı");
      } catch (e) {
        toast({
          title: "JSON parse hatası",
          description: e.message,
          variant: "destructive",
        });
      }
    }
  };

  const toRecords = () => {
    if (format === "json") return jsonRecords;
    const { headers, rows } = preview;
    return rows.map((r) => {
      const obj = {};
      fields.forEach((f) => {
        const h = mapping[f.key];
        if (h) {
          const idx = headers.indexOf(h);
          obj[f.key] = r[idx];
        }
      });
      return obj;
    });
  };

  const handleSubmit = async () => {
    const records = toRecords();
    if (!records.length) {
      toast({
        title: "Kayıt yok",
        description: "Önce dosya seçip önizleyin.",
        variant: "destructive",
      });
      return;
    }
    const missing = [];
    records.forEach((rec, i) =>
      fields.forEach((f) => {
        if (f.required && (rec[f.key] == null || rec[f.key] === ""))
          missing.push(`Satır ${i + 1}: ${f.label}`);
      })
    );
    if (missing.length) {
      toast({
        title: "Eksik zorunlu alanlar",
        description: missing.slice(0, 5).join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (entity === "plans") {
        try {
          result = await importPlansBulk(records);
        } catch (err) {
          for (const rec of records) {
            await createPlan(rec);
          }
          result = { ok: true, count: records.length, fallback: "per-record" };
        }
      } else if (entity === "providers") {
        try {
          result = await importProvidersBulk(records);
        } catch (err) {
          result = { ok: false, message: "Toplu import API bulunamadı" };
        }
      } else if (entity === "features") {
        try {
          result = await importFeaturesBulk(records);
        } catch (err) {
          for (const rec of records) {
            await createFeature(rec);
          }
          result = { ok: true, count: records.length, fallback: "per-record" };
        }
      }
      toast({
        title: "İçe aktarma tamamlandı",
        description: `${records.length} kayıt işlendi.`,
      });
      onImported?.(result);
      onOpenChange(false);
    } catch (e) {
      const msg = e?.title || e?.message || "İçe aktarma başarısız";
      toast({ title: "Hata", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Toplu İçe Aktarma ({entity})</DialogTitle>
          <DialogDescription>
            CSV veya JSON dosyası yükleyin, alanları eşleyin ve içe aktarın.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Label>Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> CSV
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4" /> JSON
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="file"
            accept={format === "csv" ? ".csv" : ".json"}
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
          {/* Örnek indirme butonları */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadSample(entity, "csv")}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Örnek CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadSample(entity, "json")}
            >
              <FileJson className="w-4 h-4 mr-2" /> Örnek JSON
            </Button>
          </div>
        </div>

        {format === "csv" && preview.headers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold mt-2">Başlık Eşleştirme</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fields.map((f) => (
                <div key={f.key} className="flex items-center gap-2">
                  <Label className="w-40">
                    {f.label}
                    {f.required ? " *" : ""}
                  </Label>
                  <Select
                    value={mapping[f.key] || ""}
                    onValueChange={(v) =>
                      setMapping((m) => ({ ...m, [f.key]: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sütun seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {headerOptions.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="border rounded-md overflow-auto max-h-60">
              <Table>
                <TableHeader>
                  <TableRow>
                    {preview.headers.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.slice(0, 5).map((r, i) => (
                    <TableRow key={i}>
                      {r.map((c, j) => (
                        <TableCell key={j}>{c}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {format === "json" && jsonRecords.length > 0 && (
          <div className="border rounded-md p-2 text-xs max-h-60 overflow-auto">
            <pre>{JSON.stringify(jsonRecords.slice(0, 5), null, 2)}</pre>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Upload className="w-4 h-4 mr-2" /> İçe Aktar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
