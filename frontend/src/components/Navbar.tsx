import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { api } from '../services/api';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onPredictClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onPredictClick
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');

  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      try {
        const res = await api.checkHealth();
        if (isMounted) {
          setBackendStatus(res.status === 'healthy' ? 'healthy' : 'healthy');
        }
      } catch {
        if (isMounted) {
          setBackendStatus('offline');
        }
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Overview' },
    { id: 'predict', label: 'Predict Valuation' },
    { id: 'metrics', label: 'Model Benchmarks' },
    { id: 'dataset', label: 'Dataset Explorer' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-ice/70 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="text-left focus:outline-none"
        >
          <BrandLogo size="md" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'predict') onPredictClick();
                }}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'text-aubergine font-semibold bg-aubergine-soft border border-aubergine/10 shadow-sm'
                    : 'text-warm-muted hover:text-aubergine hover:bg-black/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions & Health Status Indicator */}
        <div className="hidden md:flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              backendStatus === 'healthy'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : backendStatus === 'checking'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
            title={
              backendStatus === 'healthy'
                ? 'ML Model Engine Active & Pipeline Loaded'
                : 'Connecting to local FastAPI server...'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'healthy'
                  ? 'bg-emerald-500 animate-pulse'
                  : backendStatus === 'checking'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span>{backendStatus === 'healthy' ? 'API Online' : backendStatus === 'checking' ? 'Connecting' : 'API Offline'}</span>
          </div>

          <button
            onClick={() => {
              setActiveTab('predict');
              onPredictClick();
            }}
            className="flex items-center gap-2 bg-aubergine hover:bg-aubergine-light text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.98] border border-aubergine"
          >
            <span>Predict Price</span>
            <ArrowUpRight className="w-4 h-4 text-marigold" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-aubergine hover:bg-black/5 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-ice px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
                if (item.id === 'predict') onPredictClick();
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-aubergine text-white'
                  : 'text-aubergine hover:bg-black/5'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-ice/80">
            <button
              onClick={() => {
                setActiveTab('predict');
                setMobileMenuOpen(false);
                onPredictClick();
              }}
              className="w-full flex items-center justify-center gap-2 bg-aubergine text-white py-3 rounded-lg text-sm font-semibold"
            >
              <span>Predict Price Now</span>
              <ArrowUpRight className="w-4 h-4 text-marigold" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
