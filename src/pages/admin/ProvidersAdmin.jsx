import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form"; // Controller'ı da içe aktar
import { zodResolver } from "@hookform/resolvers/zod"; // Zod resolver'ı içe aktar
import * as z from "zod"; // Zod kütüphanesini içe aktar
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  getAllProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "../../api/providers"; // Sağlayıcı API fonksiyonlarını içe aktar
import { useToastContext } from "../../hooks/toast-utils"; // Toast bildirimleri için

// Shadcn UI bileşenleri
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar"; // Logo için Avatar
import { PlusCircle, Edit, Trash2, ArrowUpDown } from "lucide-react"; // İkonlar için
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const normalizeUrl = z.preprocess((val) => {
  const s = (val ?? "").toString().trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}, z.string().url({ message: "Geçerli bir URL giriniz." }));

// Zod ile sağlayıcı formunun şemasını tanımla
const providerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Sağlayıcı adı en az 2 karakter olmalıdır." }),
  website_url: z.union([z.literal(""), normalizeUrl]).optional(), // Boş stringi de kabul et
  affiliate_url: z.union([z.literal(""), normalizeUrl]).optional(),
  description: z.string().optional(),
  average_rating: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const num = typeof val === "string" ? Number(val.trim()) : Number(val);
      return Number.isFinite(num) ? num : undefined;
    }, // Boş stringi undefined olarak işle
    z
      .number()
      .min(0, { message: "Derecelendirme sıfırdan küçük olamaz." })
      .max(5, { message: "Derecelendirme 5'ten büyük olamaz." })
      .optional()
  ),
  // Yeni logo dosyası için alan
  logo: z
    .any()
    .refine((file) => {
      if (file && file.length > 0) {
        return file[0].size <= 5 * 1024 * 1024; // 5MB'tan küçük olmalı
      }
      return true; // Dosya yoksa veya boşsa geçerli say
    }, `Logo boyutu 5MB'tan küçük olmalıdır.`)
    .refine((file) => {
      if (file && file.length > 0) {
        return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          file[0].type
        );
      }
      return true; // Dosya yoksa veya boşsa geçerli say
    }, `Sadece .jpg, .jpeg, .png ve .webp formatları desteklenir.`)
    .optional(),
});

const ProvidersAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Ekleme/Düzenleme diyaloğu
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // Onay diyaloğu
  const [providerToDeleteId, setProviderToDeleteId] = useState(null); // Silinecek sağlayıcı ID'si
  const [currentProvider, setCurrentProvider] = useState(null); // Düzenlenecek sağlayıcı
  const [logoPreview, setLogoPreview] = useState(null); // Logo önizlemesi için state
  const { toast } = useToastContext();
  const { t } = useTranslation();

  // Filtreleme ve Sıralama State'leri
  const [inputValue, setInputValue] = useState(""); // Arama inputunun anlık değeri için
  const [search, setSearch] = useState(""); // API'ye gönderilecek arama terimi için (debounced)
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const queryClient = useQueryClient();

  // Sağlayıcıları çekmek için useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["providers", { search, sortBy, sortOrder, page, perPage }],
    queryFn: () =>
      getAllProviders({
        name: search,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        per_page: perPage,
      }),
    keepPreviousData: true,
  });

  const providers = data?.data || [];
  const paginationMeta = data?.meta;

  // useForm hook'unu başlat
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset, // Formu sıfırlamak için
    setValue, // Form alanlarına değer atamak için
  } = useForm({
    resolver: zodResolver(providerSchema),
    shouldUnregister: true, // Kayıtlı olmayan alanları temizle
    defaultValues: {
      name: "",
      description: "",
      website_url: "",
      affiliate_url: "",
      logo: null, // Yeni logo dosyası alanı
    },
  });
  // Arama inputu için debounce efekti
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue.length >= 3 || inputValue === "") {
        setSearch(inputValue);
        setPage(1);
      }
      // Eğer değer 1 veya 2 karakterse ve boş değilse, `search` state'ini güncelleme.
      // Bu, useQuery'nin gereksiz yere tetiklenmesini engeller.
      // Kullanıcı 3 karaktere ulaştığında veya alanı boşalttığında arama tetiklenecektir.
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  // Dialog açıldığında veya currentProvider değiştiğinde formu resetle
  useEffect(() => {
    if (isDialogOpen && currentProvider) {
      reset({
        name: currentProvider.name || "",
        description: currentProvider.description || "",
        website_url: currentProvider.website_url || "",
        affiliate_url: currentProvider.affiliate_url || "",
      });
      setLogoPreview(currentProvider.logo_url || null); // Mevcut logoyu önizle
    } else if (isDialogOpen && !currentProvider) {
      // Yeni sağlayıcı oluşturuluyorsa formu temizle
      reset({
        name: "",
        description: "",
        website_url: "",
        affiliate_url: "",
      });
      setLogoPreview(null); // Yeni eklerken önizlemeyi temizle
    }
  }, [isDialogOpen, currentProvider, reset]);

  const handleAddProviderClick = () => {
    setCurrentProvider(null);
    setIsDialogOpen(true);
  };

  const handleEditProviderClick = (provider) => {
    setCurrentProvider(provider);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (providerId) => {
    setProviderToDeleteId(providerId);
    setIsConfirmDialogOpen(true);
  };

  const confirmDeleteProvider = async () => {
    if (!providerToDeleteId) return;
    try {
      await deleteProvider(providerToDeleteId);
      queryClient.invalidateQueries(["providers"]);
      toast({
        title: t("provider_deleted_successfully"),
        description: t("provider_deleted_successfully_description"),
        variant: "success",
      });
    } catch (error) {
      toast({
        title: t("delete_error"),
        description: t("failed_to_delete_provider"),
        variant: "destructive",
      });
      console.error("Sağlayıcı silme hatası:", error);
    } finally {
      setIsConfirmDialogOpen(false);
      setProviderToDeleteId(null);
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t("file_size_error"),
          description: t("logo_size_error"),
          variant: "destructive",
        });
        event.target.value = ""; // Input'u temizle
        setLogoPreview(null);
        return;
      }

      // Dosya türü kontrolü
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t("file_format_error"),
          description: t("logo_format_error"),
          variant: "destructive",
        });
        event.target.value = ""; // Input'u temizle
        setLogoPreview(null);
        return;
      }

      setLogoPreview(URL.createObjectURL(file));
      setValue("logo", file, { shouldValidate: true }); // Form verisine dosyayı ekle
    } else {
      setLogoPreview(null);
      setValue("logo", null);
    }
  };

  const onSubmit = async (data) => {
    console.log("Form verisi:", data); // Form verisini konsola yazdır
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("website_url", data.website_url || "");
    formData.append("affiliate_url", data.affiliate_url || "");

    // Logo dosyası varsa ekle
    if (data.logo instanceof File) {
      formData.append("logo", data.logo);
    } else if (data.logo?.[0] instanceof File) {
      // RHF FileList senaryosu
      formData.append("logo", data.logo[0]);
    }

    try {
      if (currentProvider) {
        formData.append("_method", "PUT");
        await updateProvider(currentProvider.id, formData);
        toast({
          title: t("provider_updated_successfully"),
          description: t("provider_updated_successfully_description"),
          variant: "success",
        });
      } else {
        await createProvider(formData);
        toast({
          title: t("provider_created_successfully"),
          description: t("provider_created_successfully_description"),
          variant: "success",
        });
      }
      queryClient.invalidateQueries(["providers"]); // Sağlayıcıları yeniden çek
      setIsDialogOpen(false);
      reset();
      setLogoPreview(null); // Önizlemeyi temizle
    } catch (error) {
      toast({
        title: t("operation_failed"),
        description:
          error.message ||
          (currentProvider
            ? t("failed_to_update_provider")
            : t("failed_to_create_provider")),
        variant: "destructive",
      });
      console.error(
        "Sağlayıcı işlemi hatası:",
        error.response?.data || error.message
      );
    }
  };

  // Sıralama başlığına tıklandığında sıralama yönünü değiştir
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc"); // Yeni sütuna göre sıralarken varsayılan olarak artan
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-10">
          {t("admin_providers_page_title")}
        </h1>
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>
          {t("error_loading_providers")}: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
        {t("admin_providers_page_title")}
      </h1>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProviderClick}>
              <PlusCircle className="mr-2 h-5 w-5" /> {t("add_new_provider")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentProvider
                  ? t("edit_provider_title")
                  : t("create_provider")}
              </DialogTitle>
              <DialogDescription>
                {currentProvider
                  ? t("edit_provider_description")
                  : t("add_new_provider_description")}
              </DialogDescription>
            </DialogHeader>
            <form
              id="providerForm"
              onSubmit={handleSubmit(onSubmit, (errs) => {
                console.log("Validation errors:", errs);
              })}
              className="grid gap-4 py-4"
              noValidate
            >
              <div className="grid gap-2">
                <Label htmlFor="name">{t("provider_name")}</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea id="description" {...register("description")} />
                {errors.description && (
                  <p className="text-red-500 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website_url">{t("website_url")}</Label>
                <Input
                  id="website_url"
                  type="text"
                  {...register("website_url")}
                  placeholder="https://www.example.com"
                />
                {errors.website_url && (
                  <p className="text-red-500 text-sm">
                    {errors.website_url.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="affiliate_url">{t("affiliate_url")}</Label>
                <Input
                  id="affiliate_url"
                  type="text"
                  {...register("affiliate_url")}
                  placeholder="https://affiliate.example.com"
                />
                {errors.affiliate_url && (
                  <p className="text-red-500 text-sm">
                    {errors.affiliate_url.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logo">{t("logo")}</Label>
                <Input
                  id="logo"
                  type="file"
                  onChange={handleLogoChange}
                  {...register("logo")}
                  accept=".jpg,.jpeg,.png,.webp"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("logo_preview")}
                    </p>
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="mt-1 h-20 w-20 object-contain rounded-md border"
                    />
                  </div>
                )}
                {!logoPreview && currentProvider?.logo_url && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("current_logo")}
                    </p>
                    <img
                      src={currentProvider.logo_url}
                      alt="Current Logo"
                      className="mt-1 h-20 w-20 object-contain rounded-md border"
                    />
                  </div>
                )}
                {!logoPreview && !currentProvider?.logo_url && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("no_logo")}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  form="providerForm"
                >
                  {isSubmitting
                    ? currentProvider
                      ? t("updating")
                      : t("creating")
                    : currentProvider
                    ? t("save")
                    : t("create")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="flex items-center space-x-2">
          <Input
            placeholder={t("search_provider")}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            className="max-w-sm"
          />
          <Select
            onValueChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
            value={sortBy}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("sort_by")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("name_ascending")}</SelectItem>
              <SelectItem value="average_rating">
                {t("average_rating")}
              </SelectItem>
              <SelectItem value="created_at">
                {t("created_at_descending")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              setSortOrder(value);
              setPage(1);
            }}
            value={sortOrder}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t("sort_direction")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{t("ascending")}</SelectItem>
              <SelectItem value="desc">{t("descending")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              setPerPage(Number(value));
              setPage(1);
            }}
            value={String(perPage)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder={t("page_size")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {providers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t("logo")}</TableHead>
              <TableHead
                className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort("name")}
              >
                {t("provider_name")}{" "}
                {sortBy === "name" && (
                  <ArrowUpDown
                    className={`inline-block ml-1 h-4 w-4 ${
                      sortOrder === "asc" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </TableHead>
              <TableHead>{t("provider_website")}</TableHead>
              <TableHead
                className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort("average_rating")}
              >
                {t("provider_rating")}{" "}
                {sortBy === "average_rating" && (
                  <ArrowUpDown
                    className={`inline-block ml-1 h-4 w-4 ${
                      sortOrder === "asc" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort("created_at")}
              >
                {t("provider_created_at")}{" "}
                {sortBy === "created_at" && (
                  <ArrowUpDown
                    className={`inline-block ml-1 h-4 w-4 ${
                      sortOrder === "asc" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </TableHead>
              <TableHead className="text-right">
                {t("provider_actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">{provider.id}</TableCell>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        provider.logo_url ||
                        `https://placehold.co/40x40/aabbcc/ffffff?text=${provider.name.charAt(
                          0
                        )}`
                      }
                      alt={provider.name}
                    />
                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{provider.name}</TableCell>
                <TableCell>
                  <a
                    href={provider.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {provider.website_url
                      ? new URL(provider.website_url).hostname
                      : "N/A"}
                  </a>
                </TableCell>
                <TableCell>
                  {!isNaN(Number(provider.average_rating))
                    ? Number(provider.average_rating).toFixed(1)
                    : "N/A"}{" "}
                  ({provider.reviews_count || 0})
                </TableCell>
                <TableCell>
                  {new Date(provider.created_at).toLocaleDateString("tr-TR")}
                </TableCell>
                <TableCell className="text-right flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProviderClick(provider)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(provider.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400">
          {t("no_providers_found")}
        </div>
      )}

      {/* Sayfalama Kontrolleri */}
      {paginationMeta && paginationMeta.last_page > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              />
            </PaginationItem>
            {[...Array(paginationMeta.last_page)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setPage(i + 1)}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage((prev) =>
                    Math.min(prev + 1, paginationMeta.last_page)
                  )
                }
                disabled={page === paginationMeta.last_page}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Silme Onay Diyaloğu */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("confirm_delete_provider")}</DialogTitle>
            <DialogDescription>
              {t("delete_provider_confirmation_message")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProvider}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProvidersAdmin;
