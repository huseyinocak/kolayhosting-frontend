// src/hooks/useAuth.js

import { createContext, useContext } from 'react';

// AuthContext'i oluşturuyoruz (artık bu dosyada tanımlı)
export const AuthContext = createContext(null);

/**
 * AuthContext'i kullanmak için özel bir hook.
 * Bu hook, AuthProvider tarafından sağlanan değerlere kolayca erişim sağlar.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};