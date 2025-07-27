import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


export default function NotFoundPage() {
    const navigate = useNavigate(); // Yönlendirme için

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Sayfa Bulunamadı</p>
            <Button onClick={() => navigate('/')}>Ana Sayfaya Dön</Button>
        </div>
    );
}