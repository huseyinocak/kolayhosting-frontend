// src/context/ComparisonContext.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { useToastContext } from '../hooks/toast-utils';
import { ComparisonContext } from '../hooks/useComparison'; // <-- Bu satır kritik! Doğru yolu kontrol edin.

/**
 * ComparisonProvider bileşeni, karşılaştırma için seçilen planların durumunu yönetir.
 * Çocuk bileşenlere bu durumu ve planları yönetme fonksiyonlarını sağlar.
 */
export const ComparisonProvider = ({ children }) => {
    const [plansToCompare, setPlansToCompare] = useState([]);
    const { toast } = useToastContext();

    const MAX_COMPARISON_LIMIT = 4;

    const addPlanToCompare = useCallback((plan) => {
        if (plansToCompare.length >= MAX_COMPARISON_LIMIT) {
            toast({
                title: "Karşılaştırma Limiti",
                description: `En fazla ${MAX_COMPARISON_LIMIT} planı karşılaştırabilirsiniz.`,
                variant: "destructive",
            });
            return;
        }
        if (!plansToCompare.some(p => p.id === plan.id)) {
            setPlansToCompare(prevPlans => [...prevPlans, plan]);
            toast({
                title: "Plan Eklendi",
                description: `${plan.name} karşılaştırma listesine eklendi.`,
            });
        } else {
            toast({
                title: "Zaten Eklendi",
                description: `${plan.name} zaten karşılaştırma listesinde.`,
                variant: "warning",
            });
        }
    }, [plansToCompare, toast]);

    const removePlanFromCompare = useCallback((planId) => {
        setPlansToCompare(prevPlans => prevPlans.filter(p => p.id !== planId));
        toast({
            title: "Plan Kaldırıldı",
            description: "Plan karşılaştırma listesinden kaldırıldı.",
        });
    }, [toast]);

    const clearComparison = useCallback(() => {
        setPlansToCompare([]);
        toast({
            title: "Liste Temizlendi",
            description: "Karşılaştırma listesi başarıyla temizlendi.",
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
