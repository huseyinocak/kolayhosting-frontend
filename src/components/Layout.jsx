import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";



export default function Layout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1"> {/* Ana içerik ve reklamlar için esnek kapsayıcı */}
                {/* Sol Reklam Alanı */}
                <aside className="hidden lg:block w-60 xl:w-72 p-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg shadow-inner">
                        <p className="text-center">Google Reklam Alanı (Sol)</p>
                        {/* Gerçek Google AdSense kodu buraya gelecek */}
                        {/* Örnek: <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script> */}
                        {/* <ins class="adsbygoogle"
                            style="display:block"
                            data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                            data-ad-slot="YOUR_AD_SLOT_ID"
                            data-ad-format="auto"
                            data-full-width-responsive="true"></ins> */}
                        {/* <script>
                            (adsbygoogle = window.adsbygoogle || []).push({});
                        </script> */}
                    </div>
                </aside>

                <main className="flex-grow container mx-auto px-4 py-8">
                    <Outlet /> {/* İç içe geçmiş rotalar burada render edilecek */}
                </main>

                {/* Sağ Reklam Alanı */}
                <aside className="hidden lg:block w-60 xl:w-72 p-4 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg shadow-inner">
                        <p className="text-center">Google Reklam Alanı (Sağ)</p>
                        {/* Gerçek Google AdSense kodu buraya gelecek */}
                        {/* Örnek: <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script> */}
                        {/* <ins class="adsbygoogle"
                            style="display:block"
                            data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                            data-ad-slot="YOUR_AD_SLOT_ID"
                            data-ad-format="auto"
                            data-full-width-responsive="true"></ins> */}
                        {/* <script>
                            (adsbygoogle = window.adsbygoogle || []).push({});
                        </script> */}
                    </div>
                </aside>
            </div>
            <Footer />
        </div>
    );
}