import React, { Suspense, lazy } from 'react'; // Suspense ve lazy'yi içe aktar
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Temel bileşenler (lazy yüklemeye gerek yok)
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './hooks/useAuth';
import OnboardingModal from './components/OnboardingModal';


// Lazy yüklenen sayfa bileşenleri
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const PlanDetailPage = lazy(() => import('./pages/PlanDetailPage'));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const ProvidersPage = lazy(() => import('./pages/ProvidersPage'));
const ProviderDetailPage = lazy(() => import('./pages/ProviderDetailPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage')); // Yeni eklendi
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CategoriesAdmin = lazy(() => import('./pages/admin/CategoriesAdmin'));
const ProvidersAdmin = lazy(() => import('./pages/admin/ProvidersAdmin'));
const PlansAdmin = lazy(() => import('./pages/admin/PlansAdmin'));
const FeaturesAdmin = lazy(() => import('./pages/admin/FeaturesAdmin'));
const ReviewsAdmin = lazy(() => import('./pages/admin/ReviewsAdmin'));
const CategoryPlansPage = lazy(() => import('./pages/CategoryPlansPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));


function App() {
  const { showOnboarding, markUserOnboarded, user } = useAuth();
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}> {/* Yükleme göstergesi */}
        <Routes>
          <Route element={<Layout />}>
            {/* Public Rotlar - Herkes erişebilir */}
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/categories/:slugOrId/plans" element={<CategoryPlansPage />} />
            <Route path="/plans/:id" element={<PlanDetailPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/providers/:id" element={<ProviderDetailPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            {/* Korunan Rotlar - Sadece giriş yapmış kullanıcılar erişebilir */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} /> {/* Yeni Profil Sayfası Rotası */}
              {/* Kullanıcı profili, ayarlar vb. gibi giriş gerektiren sayfalar buraya gelecek */}
            </Route>

            {/* Yönetim Paneli Rotları (Sadece Admin için) */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<CategoriesAdmin />} />
              <Route path="/admin/providers" element={<ProvidersAdmin />} />
              <Route path="/admin/plans" element={<PlansAdmin />} />
              <Route path="/admin/features" element={<FeaturesAdmin />} />
              <Route path="/admin/reviews" element={<ReviewsAdmin />} />
            </Route>

            {/* Bulunamayan Sayfa (404) - En sona bırakılır */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
      {showOnboarding && user && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={markUserOnboarded} // Modalı kapatınca onboarding durumunu günceller
          userName={user.name || 'Misafir'}
        />
      )}
      <Toaster />
    </Router>
  );
}

export default App;