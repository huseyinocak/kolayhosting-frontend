import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom"; // useSearchParams eklendi
import { getAllPlans } from "../api/plans"; // Plan API fonksiyonlarını içe aktar
import { getAllCategories } from "../api/categories"; // Kategorileri çekmek için
import { getAllProviders } from "../api/providers"; // Sağlayıcıları çekmek için
import { useToastContext } from "../hooks/toast-utils"; // Toast bildirimleri için
import { useComparison } from "../hooks/useComparison"; // Karşılaştırma bağlamı için

// Shadcn UI bileşenleri
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Input } from "../components/ui/input"; // Arama çubuğu için
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"; // Dropdown seçimleri için
import { Checkbox } from "../components/ui/checkbox"; // Karşılaştırma için checkbox
import { Badge } from "../components/ui/badge"; // İndirim ve diğer durumlar için
import { useQuery } from "@tanstack/react-query"; // React Query useQuery hook'unu içe aktar
import AnimatedListItem from "@/components/AnimatedListItem";
import { Frown } from "lucide-react"; // Frown ikonu eklendi
import { Helmet } from "react-helmet-async"; // Helmet'i içe aktar
import { useTranslation } from "react-i18next"; // i18n için useTranslation
const PlansPage = () => {
  const { toast } = useToastContext();
  const {
    addPlanToCompare,
    removePlanFromCompare,
    isPlanInComparison,
    plansToCompare,
    MAX_COMPARISON_LIMIT,
  } = useComparison();
  const { t } = useTranslation();

  // URL arama parametrelerini yönetmek için useSearchParams
  const [searchParams, setSearchParams] = useSearchParams();

  // Filtreleme ve Sıralama State'leri - URL'den okunuyor
  const searchTerm = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "all";
  const selectedProvider = searchParams.get("provider") || "all";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "name_asc";

  // Sayfalama State'leri - URL'den okunuyor
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [itemsPerPage] = useState(9); // Her sayfada 9 plan göster

  // Debounce'lu arama terimi için state (Input'tan anlık değer, URL'ye yansıyan debounce'lu değer)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Kategori ve Sağlayıcı arama terimleri (Select içindeki arama çubukları için)
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [providerSearchTerm, setProviderSearchTerm] = useState("");

  // Arama terimini debounce etmek için useEffect
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          if (localSearchTerm) newParams.set("search", localSearchTerm);
          else newParams.delete("search");
          newParams.set("page", "1"); // Arama değiştiğinde sayfayı sıfırla
          return newParams;
        },
        { replace: true }
      ); // URL'yi geçmişe eklemeden değiştir
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, setSearchParams]);

  // Fiyat aralıklarını debounce etmek için useEffect
  useEffect(() => {
    const minPriceHandler = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          if (localMinPrice) newParams.set("minPrice", localMinPrice);
          else newParams.delete("minPrice");
          newParams.set("page", "1");
          return newParams;
        },
        { replace: true }
      );
    }, 500);
    const maxPriceHandler = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          if (localMaxPrice) newParams.set("maxPrice", localMaxPrice);
          else newParams.delete("maxPrice");
          newParams.set("page", "1");
          return newParams;
        },
        { replace: true }
      );
    }, 500);

    return () => {
      clearTimeout(minPriceHandler);
      clearTimeout(maxPriceHandler);
    };
  }, [localMinPrice, localMaxPrice, setSearchParams]);

  // Sıralama parametrelerini ayır
  const sortParams = useMemo(() => {
    const [sort_by, sort_order] = sortBy.split("_");
    return { sort_by, sort_order };
  }, [sortBy]);

  // Kategorileri çekmek için useQuery
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ["categoriesList"],
    queryFn: () => getAllCategories({ per_page: 9999 }), // Tüm kategorileri çek
    staleTime: 10 * 60 * 1000, // 10 dakika boyunca veriyi "stale" olarak işaretleme
  });
  const categories = categoriesData?.data;

  // Sağlayıcıları çekmek için useQuery
  const {
    data: providersData,
    isLoading: isLoadingProviders,
    isError: isErrorProviders,
    error: errorProviders,
  } = useQuery({
    queryKey: ["providersList"],
    queryFn: () => getAllProviders({ per_page: 9999 }), // Tüm sağlayıcıları çek
    staleTime: 10 * 60 * 1000, // 10 dakika boyunca veriyi "stale" olarak işaretleme
  });
  const providers = providersData?.data;

  // Planları çekmek için useQuery
  const {
    data: plansData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "plans",
      searchTerm, // Debounce'lu terim doğrudan kullanılıyor
      selectedCategory,
      selectedProvider,
      minPrice, // Debounce'lu fiyat doğrudan kullanılıyor
      maxPrice, // Debounce'lu fiyat doğrudan kullanılıyor
      sortParams,
      currentPage,
      itemsPerPage,
    ],
    queryFn: () =>
      getAllPlans({
        name: searchTerm,
        category_id: selectedCategory === "all" ? undefined : selectedCategory, // 'all' ise undefined gönder
        provider_id: selectedProvider === "all" ? undefined : selectedProvider, // 'all' ise undefined gönder
        price_min: minPrice ? parseFloat(minPrice) : undefined,
        price_max: maxPrice ? parseFloat(maxPrice) : undefined,
        sort_by: sortParams.sort_by,
        sort_order: sortParams.sort_order,
        page: currentPage,
        per_page: itemsPerPage,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  // API'den gelen planlar ve sayfalama meta bilgileri
  const plans = plansData?.data || [];
  const totalPages = plansData?.meta?.last_page || 1;
  const totalPlans = plansData?.meta?.total || 0;

  useEffect(() => {
    if (isError) {
      toast({
        title: "Hata",
        description: error.message || "Planlar yüklenirken bir sorun oluştu.",
        variant: "destructive",
      });
    }
    if (isErrorCategories) {
      toast({
        title: "Hata",
        description:
          errorCategories.message ||
          "Kategoriler yüklenirken bir sorun oluştu.",
        variant: "destructive",
      });
    }
    if (isErrorProviders) {
      toast({
        title: "Hata",
        description:
          errorProviders.message ||
          "Sağlayıcılar yüklenirken bir sorun oluştu.",
        variant: "destructive",
      });
    }
  }, [
    isError,
    error,
    isErrorCategories,
    errorCategories,
    isErrorProviders,
    errorProviders,
    toast,
  ]);

  const handleCategoryChange = (value) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        if (value !== "all") newParams.set("category", value);
        else newParams.delete("category");
        newParams.set("page", "1");
        return newParams;
      },
      { replace: true }
    );
  };

  const handleProviderChange = (value) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        if (value !== "all") newParams.set("provider", value);
        else newParams.delete("provider");
        newParams.set("page", "1");
        return newParams;
      },
      { replace: true }
    );
  };

  const handleMinPriceChange = (e) => {
    setLocalMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    setLocalMaxPrice(e.target.value);
  };

  const handleSortChange = (value) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("sortBy", value);
        newParams.set("page", "1");
        return newParams;
      },
      { replace: true }
    );
  };

  const handlePrevPage = () => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        const prevPage = Math.max(
          parseInt(newParams.get("page") || "1", 10) - 1,
          1
        );
        newParams.set("page", String(prevPage));
        return newParams;
      },
      { replace: true }
    );
  };

  const handleNextPage = () => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        const nextPage = Math.min(
          parseInt(newParams.get("page") || "1", 10) + 1,
          totalPages
        );
        newParams.set("page", String(nextPage));
        return newParams;
      },
      { replace: true }
    );
  };

  const handleCompareCheckboxChange = useCallback(
    (plan, checked) => {
      if (checked) {
        addPlanToCompare(plan);
        // Google Analytics olayı gönder
        if (window.gtag) {
          window.gtag("event", "plan_added_to_comparison", {
            event_category: "Comparison",
            event_label: `Plan Added: ${plan.name} (${plan.provider?.name})`,
            value: plan.price, // Plan fiyatını değer olarak gönderebilirsiniz
            plan_id: plan.id,
            plan_name: plan.name,
            provider_name: plan.provider?.name,
            category_name: plan.category?.name,
          });
        }
      } else {
        removePlanFromCompare(plan.id);
        // Google Analytics olayı gönder (çıkarıldığında)
        if (window.gtag) {
          window.gtag("event", "plan_removed_from_comparison", {
            event_category: "Comparison",
            event_label: `Plan Removed: ${plan.name} (${plan.provider?.name})`,
            value: plan.price,
            plan_id: plan.id,
            plan_name: plan.name,
            provider_name: plan.provider?.name,
            category_name: plan.category?.name,
          });
        }
      }
    },
    [addPlanToCompare, removePlanFromCompare]
  );

  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  }, [categories, categorySearchTerm]);

  const filteredProviders = useMemo(() => {
    if (!providerSearchTerm) return providers;
    return providers.filter((prov) =>
      prov.name.toLowerCase().includes(providerSearchTerm.toLowerCase())
    );
  }, [providers, providerSearchTerm]);

  // Dinamik sayfa başlığı ve meta açıklaması
  const pageTitle = useMemo(() => {
    let title = t("plans_page_title", { defaultValue: "Tüm Hosting Planları" });
    const currentCategory = categories?.find(
      (cat) => String(cat.id) === selectedCategory
    );
    const currentProvider = providers?.find(
      (prov) => String(prov.id) === selectedProvider
    );

    if (searchTerm) {
      title = `${searchTerm} ${t("plans_search_results", {
        defaultValue: "Arama Sonuçları",
      })}`;
    }
    if (currentCategory && selectedCategory !== "all") {
      title = `${currentCategory.name} ${t("plans_category_title_suffix", {
        defaultValue: "Hosting Planları",
      })}`;
    }
    if (currentProvider && selectedProvider !== "all") {
      title = `${currentProvider.name} ${t("plans_provider_title_suffix", {
        defaultValue: "Hosting Planları",
      })}`;
    }
    return `${title} - KolayHosting`;
  }, [
    searchTerm,
    selectedCategory,
    selectedProvider,
    categories,
    providers,
    t,
  ]);

  const pageDescription = useMemo(() => {
    let description = t("plans_page_description", {
      defaultValue:
        "KolayHosting'de yüzlerce hosting planını karşılaştırın. İhtiyaçlarınıza en uygun web hosting, VPS, dedicated sunucu ve diğer hosting çözümlerini bulun.",
    });
    const currentCategory = categories?.find(
      (cat) => String(cat.id) === selectedCategory
    );
    const currentProvider = providers?.find(
      (prov) => String(prov.id) === selectedProvider
    );

    if (currentCategory && selectedCategory !== "all") {
      description = t("plans_category_description", {
        defaultValue: `KolayHosting'de ${currentCategory.name} hosting planlarını karşılaştırın. En iyi ${currentCategory.name} hosting sağlayıcılarını ve özelliklerini keşfedin.`,
        categoryName: currentCategory.name,
      });
    }
    if (currentProvider && selectedProvider !== "all") {
      description = t("plans_provider_description", {
        defaultValue: `KolayHosting'de ${currentProvider.name} firmasının hosting planlarını karşılaştırın. En uygun fiyatlı ve özellikli ${currentProvider.name} hosting çözümlerini bulun.`,
        providerName: currentProvider.name,
      });
    }
    if (searchTerm) {
      description = `${t("plans_search_description_prefix", {
        defaultValue: "Arama sonuçları:",
      })} ${searchTerm}. ${description}`;
    }
    return description;
  }, [
    searchTerm,
    selectedCategory,
    selectedProvider,
    categories,
    providers,
    t,
  ]);

  // Canonical URL
  const canonicalUrl = useMemo(() => {
    const baseUrl = `${window.location.origin}/plans`;
    const currentParams = new URLSearchParams(searchParams);

    // Sayfalama parametresini kaldır (ilk sayfa için)
    if (currentParams.get("page") === "1") {
      currentParams.delete("page");
    }

    const queryString = currentParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [searchParams]);

  // Yükleme durumunda iskelet gösterimi
  if (isLoading || isLoadingCategories || isLoadingProviders) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-3/4 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(itemsPerPage)].map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
        {t("view_all_plans")}
      </h1>

      {/* Filtreleme ve Sıralama Kontrolleri */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center flex-wrap">
        <Input
          type="text"
          placeholder={t("search_plans")}
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className="max-w-sm md:max-w-xs"
        />
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filter_by_category")} />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1">
              <Input
                placeholder={t("search_categories")}
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                className="w-full focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-10"
              />
            </div>
            <SelectItem value="all">{t("all_categories")}</SelectItem>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filter_by_provider")} />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1">
              <Input
                placeholder={t("search_providers")}
                value={providerSearchTerm}
                onChange={(e) => setProviderSearchTerm(e.target.value)}
                className="w-full focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-10"
              />
            </div>
            <SelectItem value="all">{t("all_providers")}</SelectItem>
            {filteredProviders.map((provider) => (
              <SelectItem key={provider.id} value={String(provider.id)}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder={t("min_price")}
          value={localMinPrice}
          onChange={handleMinPriceChange}
          className="max-w-[120px]"
        />
        <Input
          type="number"
          placeholder={t("max_price")}
          value={localMaxPrice}
          onChange={handleMaxPriceChange}
          className="max-w-[120px]"
        />
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("sort_by")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">{t("name_asc")}</SelectItem>
            <SelectItem value="name_desc">{t("name_desc")}</SelectItem>
            <SelectItem value="price_asc">
              {t("sort_by_price")} ({t("ascending")})
            </SelectItem>
            <SelectItem value="price_desc">
              {t("sort_by_price")} ({t("descending")})
            </SelectItem>
            <SelectItem value="renewal_price_asc">
              {t("renewal_price")} ({t("ascending")})
            </SelectItem>
            <SelectItem value="renewal_price_desc">
              {t("renewal_price")} ({t("descending")})
            </SelectItem>
            <SelectItem value="created_at_desc">{t("newest")}</SelectItem>
            <SelectItem value="created_at_asc">{t("oldest")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plan Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.length > 0 ? (
          plans.map((plan, index) => (
            <AnimatedListItem key={plan.id} delay={index * 100}>
              <Card className="h-full flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.category?.name && (
                      <Badge variant="secondary" className="mr-2">
                        {plan.category.name}
                      </Badge>
                    )}
                    {plan.provider?.name && (
                      <Badge variant="outline">{plan.provider.name}</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {plan.price} {plan.currency}
                    {plan.discount_percentage > 0 && (
                      <span className="ml-2 text-sm text-red-500 line-through">
                        {(
                          plan.price /
                          (1 - plan.discount_percentage / 100)
                        ).toFixed(2)}{" "}
                        {plan.currency}
                      </span>
                    )}
                  </p>
                  {plan.renewal_price && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("renewal_price")}: {plan.renewal_price} {plan.currency}
                    </p>
                  )}
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {plan.summary || t("no_description_for_plan")}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <Button asChild className="w-full mr-2">
                      <Link to={`/plans/${plan.id}`}>
                        {t("view_details_button")}
                      </Link>
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`compare-${plan.id}`}
                        checked={isPlanInComparison(plan.id)}
                        onCheckedChange={(checked) =>
                          handleCompareCheckboxChange(plan, checked)
                        }
                        disabled={
                          plansToCompare.length >= MAX_COMPARISON_LIMIT &&
                          !isPlanInComparison(plan.id)
                        }
                      />
                      <label
                        htmlFor={`compare-${plan.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {t("add_to_compare")}
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedListItem>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-600 dark:text-gray-400">
            <Frown className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-xl font-semibold mb-2">{t("no_plans_found")}</p>
            <p className="text-center">{t("no_plans_found_message")}</p>
          </div>
        )}
      </div>

      {/* Sayfalama Kontrolleri */}
      {totalPlans > 0 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isLoading}
            variant="outline"
          >
            {t("previous")}
          </Button>
          <span className="text-lg font-semibold">
            {t("page")} {currentPage} / {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading}
            variant="outline"
          >
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
