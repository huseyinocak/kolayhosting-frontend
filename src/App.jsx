import React, { Suspense, lazy } from 'react'; // Suspense ve lazy'yi içe aktar
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Temel bileşenler (lazy yüklemeye gerek yok)
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './hooks/use-toast.jsx';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { ComparisonProvider } from './context/ComparisonContext';

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
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));     // Yeni eklendi
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CategoriesAdmin = lazy(() => import('./pages/admin/CategoriesAdmin'));
const ProvidersAdmin = lazy(() => import('./pages/admin/ProvidersAdmin'));
const PlansAdmin = lazy(() => import('./pages/admin/PlansAdmin'));
const FeaturesAdmin = lazy(() => import('./pages/admin/FeaturesAdmin'));
const ReviewsAdmin = lazy(() => import('./pages/admin/ReviewsAdmin'));
const CategoryPlansPage = lazy(() => import('./pages/CategoryPlansPage'));


function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ComparisonProvider>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <p className="text-lg text-gray-700 dark:text-gray-300">Yükleniyor...</p>
              </div>
            }> {/* Yükleme göstergesi */}
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
                  <Route path="/reviews" element={<div>İncelemeler Sayfası (Henüz Yapılmadı)</div>} /> {/* Bu satırı da lazy yüklenen bir sayfaya çevirebiliriz */}
                  <Route path="/compare" element={<ComparisonPage />} />

                  {/* Korunan Rotlar - Sadece giriş yapmış kullanıcılar erişebilir */}
                  <Route element={<ProtectedRoute />}>
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
            <Toaster />
          </ComparisonProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;