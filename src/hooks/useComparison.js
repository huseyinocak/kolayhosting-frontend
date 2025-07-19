// src/hooks/useComparison.js

import { createContext, useContext } from 'react';

// Karşılaştırma bağlamını oluşturuyoruz
export const ComparisonContext = createContext(null);

/**
 * ComparisonContext'i kullanmak için özel bir hook.
 * Bu hook, ComparisonProvider tarafından sağlanan değerlere kolayca erişim sağlar.
 */
export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
};
