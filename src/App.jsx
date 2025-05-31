import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './Pages/Main/Main';
import TransactionView from './Pages/Main/Transaction/Transaction';
import DebtView from './Pages/Debt/Debt';
import AddDebt from './Pages/Debt/AddDebt';
import DebtDetailView from './Pages/Debt/DebtDetail';
import MainLayout from './Pages/Tabs';
import StatisticsDashboard from './Pages/Report/Report';
import { useState, useEffect } from 'react';
import InstallPromptModal from './Modal/InstallPromptModal';
import IosInstallGuideModal from './Modal/IosInstallGuideModal';
import EditDebt from './Pages/Debt/EditDebt';
import LoginPage from './Utils/LoginPage';
import { AuthProvider } from './AuthContext';
import ProfilePage from './Utils/ProfilePage';
import { ProtectedRoute, PublicRoute } from './Utils/AuthRoutes';
import AccessWrapper from './Utils/AccessWrapper';
import PremiumPage from './Utils/PremiumPage';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(
    localStorage.getItem('isAppInstalled') === 'true' ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone
  );
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const alreadyShown = localStorage.getItem('iosInstallPromptShown') === 'true';
  
    if (!isAndroid && !isInStandalone && !alreadyShown) {
      setShowIosGuide(true);
      localStorage.setItem('iosInstallPromptShown', 'true');
    }
  }, []);
  

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      if (!deferredPrompt) {
        setDeferredPrompt(e);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
        localStorage.setItem('isAppInstalled', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  {showIosGuide && (
    <IosInstallGuideModal onClose={() => setShowIosGuide(false)} />
  )}

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={
              <LoginPage />
          } />

          {/* Protected routes with MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/actions" element={<TransactionView />} />
              <Route path="/debts" element={<DebtView />} />
              <Route path="/debt/:id" element={<DebtDetailView />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route element={<AccessWrapper />}>
                <Route path="/debt/add" element={<AddDebt />} />
                <Route path="/debt/edit/:id" element={<EditDebt />} />
              </Route>
              <Route path="/reports" element={<StatisticsDashboard />} />
              <Route path="/setting" element={<ProfilePage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Catch all other routes and redirect */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>

        {/* Модалки нужно рендерить здесь */}
        {deferredPrompt && !isAppInstalled && (
          <InstallPromptModal onInstall={handleInstall} />
        )}

        {showIosGuide && (
          <IosInstallGuideModal onClose={() => setShowIosGuide(false)} />
        )}
      </Router>
    </AuthProvider>
  );
}

export default App;