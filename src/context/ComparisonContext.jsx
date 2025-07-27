// src/context/ComparisonContext.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { useToastContext } from '../hooks/toast-utils';
import { ComparisonContext } from '../hooks/useComparison'; // <-- Bu satır kritik! Doğru yolu kontrol edin.
import { useAuth } from '@/hooks/useAuth';

/**
 * ComparisonProvider bileşeni, karşılaştırma için seçilen planların durumunu yönetir.
 * Çocuk bileşenlere bu durumu ve planları yönetme fonksiyonlarını sağlar.
 */
export const ComparisonProvider = ({ children }) => {
    const [plansToCompare, setPlansToCompare] = useState([]);
    const { toast } = useToastContext();
    const { user, isAuthenticated } = useAuth(); // Kullanıcının premium durumunu almak için

    // Premium kullanıcılar için daha yüksek veya sınırsız limit
    const MAX_COMPARISON_LIMIT = isAuthenticated && user?.is_premium ? 100 : 4; // Premium ise 100, değilse 4

    const addPlanToCompare = useCallback((plan) => {
        if (plansToCompare.length >= MAX_COMPARISON_LIMIT) {
            toast({
                title: "Karşılaştırma Limiti",
                description: isAuthenticated && user?.is_premium
                    ? `En fazla ${MAX_COMPARISON_LIMIT} planı karşılaştırabilirsiniz. (Premium Limit)`
                    : `En fazla ${MAX_COMPARISON_LIMIT} planı karşılaştırabilirsiniz. Premium'a yükselterek daha fazla plan karşılaştırabilirsiniz!`,
                variant: "destructive",
            });
            return;
        }
        if (!plansToCompare.some(p => p.id === plan.id)) {
            setPlansToCompare(prevPlans => [...prevPlans, plan]);
            toast({
                title: "Plan Eklendi",
                description: `${plan.name} karşılaştırma listesine eklendi.`,
                variant: "success", // Başarılı bir ekleme bildirimi
            });
        } else {
            toast({
                title: "Zaten Eklendi",
                description: `${plan.name} zaten karşılaştırma listesinde.`,
                variant: "warning",
            });
        }
    }, [plansToCompare, toast, isAuthenticated, user, MAX_COMPARISON_LIMIT]);

    const removePlanFromCompare = useCallback((planId) => {
        setPlansToCompare(prevPlans => prevPlans.filter(p => p.id !== planId));
        toast({
            title: "Plan Kaldırıldı",
            description: "Plan karşılaştırma listesinden kaldırıldı.",
            variant: "info", // Bilgilendirme bildirimi
        });
    }, [toast]);

    const clearComparison = useCallback(() => {
        setPlansToCompare([]);
        toast({
            title: "Liste Temizlendi",
            description: "Karşılaştırma listesi başarıyla temizlendi.",
            variant: "info", // Bilgilendirme bildirimi
        });
    }, [toast]);

    const isPlanInComparison = useCallback((planId) => {
        return plansToCompare.some(p => p.id === planId);
    }, [plansToCompare]);

    const value = useMemo(() => ({
        plansToCompare,
        addPlanToCompare,
        removePlanFromCompare,
        clearComparison,
        isPlanInComparison,
        MAX_COMPARISON_LIMIT,
    }), [plansToCompare, addPlanToCompare, removePlanFromCompare, clearComparison, isPlanInComparison, MAX_COMPARISON_LIMIT]);

    return (
        <ComparisonContext.Provider value={value}>
            {children}
        </ComparisonContext.Provider>
    );
};
