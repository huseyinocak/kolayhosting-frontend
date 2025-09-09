import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { Bot, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import AIChatbot from "./AIChatbot";
import { useEffect, useState } from "react";
import OnboardingModal from "./OnboardingModal";
import { useAuth } from "../hooks/useAuth"; // useAuth hook'unu import et

export default function Layout() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const location = useLocation(); // useLocation hook'unu burada kullan

  // useAuth hook'undan onboarding ile ilgili state ve fonksiyonları al
  const { showOnboardingModal, handleOnboardingClose, user } = useAuth();

  // Google Analytics sayfa görüntüleme izlemesi
  useEffect(() => {
    // Google Analytics'in gtag.js'si yüklü ise
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location]); // location değiştiğinde tekrar çalıştır
  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        {" "}
        {/* Ana içerik ve reklamlar için esnek kapsayıcı */}
        {/* Sol Reklam Alanı - CLS önlemi için h-[600px] eklendi */}
        <aside className="hidden lg:block w-60 xl:w-72 p-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 h-[600px]">
          <div className="h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg shadow-inner">
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-9231108288577561"
              data-ad-slot="6454313778"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>

            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
          </div>
        </aside>
        <main className="flex-grow container mx-auto px-4 py-8">
          <Outlet /> {/* İç içe geçmiş rotalar burada render edilecek */}
        </main>
        {/* Sağ Reklam Alanı - CLS önlemi için h-[600px] eklendi */}
        <aside className="hidden lg:block w-60 xl:w-72 p-4 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-shrink-0 h-[600px]">
          <div className="h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg shadow-inner">
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-9231108288577561"
              data-ad-slot="6454313778"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>

            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
          </div>
        </aside>
      </div>
      <Footer />
      {/* Yapay Zeka Chatbotu - Sağ Alt Köşede Yüzen Buton ve Sohbet Kutusu */}
      <div className="fixed bottom-6 right-6 z-50">
        {" "}
        {/* Chatbot butonunun ve açılır pencerenin z-index'i */}
        {/* Chatbot Açma Butonu */}
        <Button
          variant="default"
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 ease-in-out hover:scale-110"
          aria-label="Yapay Zeka Asistanı ile Sohbet Et"
          onClick={toggleChatbot}
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
        {/* Chatbot Sohbet Kutusu */}
        {isChatbotOpen && (
          <div className="fixed bottom-24 right-6 w-80 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-in-out transform origin-bottom-right scale-100 opacity-100">
            {" "}
            {/* overflow-hidden kaldırıldı */}
            <AIChatbot onClose={toggleChatbot} />
          </div>
        )}
      </div>
      {/* Onboarding Modalını burada render ediyoruz */}
      {showOnboardingModal && (
        <OnboardingModal
          isOpen={showOnboardingModal}
          onClose={handleOnboardingClose}
          userName={user?.name}
        />
      )}
    </div>
  );
}
