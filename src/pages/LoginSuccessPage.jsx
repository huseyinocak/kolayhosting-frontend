import { useToastContext } from "@/hooks/toast-utils";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginSuccess } = useAuth(); // AuthContext'e loginSuccess eklediğimizi varsayıyoruz
    const { toast } = useToastContext();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            // AuthContext'i güncelleyerek kullanıcının giriş yaptığını belirtin
            // Bu, useAuth hook'unuzda bir loginSuccess fonksiyonu gerektirebilir
            // veya checkUser fonksiyonunu manuel olarak çağırabilirsiniz.
            // Örneğin:
            // loginSuccess(accessToken, refreshToken); // Eğer böyle bir fonksiyonunuz varsa
            // Veya:
            // checkUser(); // AuthProvider'daki checkUser fonksiyonunu çağırın

            toast({
                title: "E-posta Doğrulandı!",
                description: "Hesabınız başarıyla doğrulandı ve giriş yapıldı.",
                variant: "success",
            });
            navigate('/profile', { replace: true }); // Kullanıcıyı profil sayfasına yönlendir
        } else {
            toast({
                title: "Doğrulama Hatası",
                description: "E-posta doğrulama sırasında bir sorun oluştu.",
                variant: "destructive",
            });
            navigate('/login', { replace: true }); // Token yoksa giriş sayfasına yönlendir
        }
    }, [location, navigate, loginSuccess, toast]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>E-posta doğrulanıyor ve giriş yapılıyor...</p>
        </div>
    );
}

export default LoginSuccessPage;