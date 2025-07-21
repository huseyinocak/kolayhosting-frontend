import React, { useState, useEffect } from 'react';
import { ThemeContext } from './theme-context-object';    

    /**
     * ThemeProvider bileşeni, uygulamanın tema durumunu yönetir ve sağlar.
     * Kullanıcının sistem tercihini algılar ve tema tercihini localStorage'da saklar.
     */
    export const ThemeProvider = ({ children }) => {
        const [theme, setTheme] = useState(() => {
            // localStorage'dan tema tercihini al
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
            // Sistem tercihini kontrol et (varsayılan olarak karanlık mod)
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        });

        // Tema değiştiğinde HTML etiketindeki 'dark' sınıfını güncelle
        useEffect(() => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
            localStorage.setItem('theme', theme); // Tercihi localStorage'a kaydet
        }, [theme]);

        // Temayı değiştirmek için fonksiyon
        const toggleTheme = () => {
            setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
        };

        const value = {
            theme,
            toggleTheme,
        };

        return (
            <ThemeContext.Provider value={value}>
                {children}
            </ThemeContext.Provider>
        );
    };