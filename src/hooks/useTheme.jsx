    import { ThemeContext } from '@/context/theme-context-object';
import { useContext } from 'react';

    /**
     * useTheme hook'u, ThemeContext'e erişim sağlar.
     * Bu hook, uygulamanın mevcut temasını ve temayı değiştirmek için bir fonksiyonu döndürür.
     * ThemeProvider içinde kullanılmalıdır.
     */
    export const useTheme = () => {
        const context = useContext(ThemeContext);
        if (context === undefined) {
            throw new Error('useTheme hook\'u ThemeProvider içinde kullanılmalıdır.');
        }
        return context;
    };
    