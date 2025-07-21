import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} KolayHosting. Tüm Hakları Saklıdır.
                <div className="mt-2 space-x-4">
                    <Link to="/privacy-policy" className="hover:underline">Gizlilik Politikası</Link>
                    <Link to="/terms-of-service" className="hover:underline">Kullanım Koşulları</Link>
                    <Link to="/cookie-policy" className="hover:underline">Çerez Politikası</Link>
                </div>
            </div>
        </footer>
    );
}