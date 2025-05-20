import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, HandCoins, BarChart3, Settings } from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'asosiy';
    if (path.includes('/debts') || path.includes('/debt/')) return 'qarzlar';
    if (path.includes('/reports')) return 'hisobot';
    if (path.includes('/setting')) return 'sozlama';
    return 'asosiy'; // Default
  };
  
  const handleTabChange = (tab) => {
    switch (tab) {
      case 'asosiy':
        navigate('/dashboard');
        break;
      case 'qarzlar':
        navigate('/debts');
        break;
      case 'hisobot':
        navigate('/reports'); // Make sure you create this route in App.jsx
        break;
      case 'sozlama':
        navigate('/setting'); // Make sure you create this route in App.jsx
        break;
      default:
        navigate('/dashboard');
    }
  };
  
  const activeTab = getActiveTab();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <Outlet /> {/* This is where your route components will render */}
      </div>

      <div className="grid grid-cols-4 bg-white border-t shadow-md h-[64px] w-full fixed bottom-0 left-0 right-0">
        <button
          onClick={() => handleTabChange('asosiy')}
          className={`flex flex-col items-center justify-center text-sm w-full text-center transition-colors ${activeTab === 'asosiy' ? 'text-blue-600' : ''}`}
        >
          <Home className="w-6 h-6" />
          Asosiy
        </button>
        <button
          onClick={() => handleTabChange('qarzlar')}
          className={`flex flex-col items-center justify-center text-sm w-full text-center transition-colors ${activeTab === 'qarzlar' ? 'text-blue-600' : ''}`}
        >
          <HandCoins className="w-6 h-6" />
          Qarzlar
        </button>
        <button
          onClick={() => handleTabChange('hisobot')}
          className={`flex flex-col items-center justify-center text-sm w-full text-center transition-colors ${activeTab === 'hisobot' ? 'text-blue-600' : ''}`}
        >
          <BarChart3 className="w-6 h-6" />
          Hisobot
        </button>
        <button
          onClick={() => handleTabChange('sozlama')}
          className={`flex flex-col items-center justify-center text-sm w-full text-center transition-colors ${activeTab === 'sozlama' ? 'text-blue-600' : ''}`}
        >
          <Settings className="w-6 h-6" />
          Sozlama
        </button>
      </div>
    </div>
  );
}