import axios from "axios";
// Axios + Laravel uyumlu hata dönüştürücü
// Kullanım: catch(e) { const err = normalizeApiError(e); toast({ title: err.title, description: err.description }) }
const STATUS_TITLES = {
  400: "Geçersiz istek",
  401: "Yetkisiz",
  403: "Erişim engellendi",
  404: "Bulunamadı",
  409: "Çakışma",
  422: "Doğrulama hatası",
  429: "Çok fazla istek",
  500: "Sunucu hatası",
  502: "Geçersiz yanıt",
  503: "Servis kullanılamıyor",
  504: "Ağ geçidi zaman aşımı",
};
/**
 * Axios/Laravel hata objesini kullanıcı dostu hale getirir.
 * @param {any} error
 * @returns {{title:string, description?:string, details?:object, status?:number}}
 */
export default function normalizeApiError(error) {
  // İstek iptali
  if (axios.isCancel?.(error)) {
    return { title: "İstek iptal edildi", status: 0 };
  }

  // Ağ / timeout
  if (!error?.response) {
    if (error?.code === "ECONNABORTED") {
      return {
        title: "Zaman aşımı",
        description: "Sunucu zamanında yanıt vermedi.",
        status: 0,
      };
    }
    return {
      title: "Ağ hatası",
      description: error?.message || "İnternet bağlantınızı kontrol edin.",
      status: 0,
    };
  }

  const { status, data } = error.response;
  let title = "";
  let description;
  let details;

  if (data && typeof data === "object") {
    title = data.message || data.error || "";
    // Laravel validation: { errors: { field: [msg] } }
    if (data.errors && typeof data.errors === "object") {
      details = data.errors;
      const firstField = Object.keys(data.errors)[0];
      const firstMsg = Array.isArray(data.errors[firstField])
        ? data.errors[firstField][0]
        : String(data.errors[firstField]);
      description = firstMsg;
      if (!title) title = STATUS_TITLES[status] || "Doğrulama hatası";
    } else if (data.description) {
      description = String(data.description);
    }
  } else if (typeof data === "string") {
    description = data;
  }

  if (!title)
    title =
      STATUS_TITLES[status] || `İşlem tamamlanamadı (${status || "Hata"})`;

  return { title, description, details, status };
}
// Örnek kullanım:
// try { await apiClient.get('/some-endpoint') }
// catch (error) { const err = normalizeApiError(error); toast({ title: err.title, description: err.description }) }
