import React from "react";

export default function Footer() {
    return (
        <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} KolayHosting. Tüm Hakları Saklıdır.
                {/* İsteğe bağlı olarak ek linkler veya bilgiler buraya eklenebilir */}
            </div>
        </footer>
    );
}