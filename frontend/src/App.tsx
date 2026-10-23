import { useState } from 'react';
import './index.css';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PredictPage } from './pages/PredictPage';
import { ModelMetricsPage } from './pages/ModelMetricsPage';
import { DatasetExplorerPage } from './pages/DatasetExplorerPage';
import { MethodologyFAQPage } from './pages/MethodologyFAQPage';
import { useRef } from 'react';

type Tab = 'home' | 'predict' | 'metrics' | 'dataset' | 'methodology' | 'faq';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const predictRef = useRef<HTMLDivElement>(null);

  const handleSetTab = (tab: string) => setActiveTab(tab as Tab);

  const handlePredictClick = () => {
    setActiveTab('predict');
    setTimeout(() => {
      predictRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={handleSetTab} />;
      case 'predict':
        return <PredictPage predictRef={predictRef as React.RefObject<HTMLDivElement>} />;
      case 'metrics':
        return <ModelMetricsPage />;
      case 'dataset':
        return <DatasetExplorerPage />;
      case 'methodology':
      case 'faq':
        return <MethodologyFAQPage />;
      default:
        return <HomePage setActiveTab={handleSetTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-bg">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSetTab}
        onPredictClick={handlePredictClick}
      />
      <main className="flex-1" id="main-content">
        {renderPage()}
      </main>
      <Footer setActiveTab={handleSetTab} />
    </div>
  );
}

export default App;
