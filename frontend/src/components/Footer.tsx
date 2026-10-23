import React from 'react';
import { BrandLogo } from './BrandLogo';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-aubergine text-ice mt-24 border-t border-aubergine-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <BrandLogo theme="light" size="md" />
            <p className="mt-4 text-sm text-ice/70 leading-relaxed max-w-xs">
              Statistical property valuation tool for the Mumbai Metropolitan Region, powered by
              empirically validated machine learning on 6,347 verified residential listings.
            </p>
            <div className="mt-5 flex items-start gap-2 text-xs text-amber-300/90 bg-amber-400/10 rounded-lg p-3 border border-amber-300/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Estimates are indicative only and do not constitute a formal property valuation or legal advice.</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-marigold mb-4">Navigate</h3>
            <ul className="space-y-2.5">
              {[
                { id: 'home', label: 'Overview' },
                { id: 'predict', label: 'Predict Price' },
                { id: 'metrics', label: 'Model Benchmarks' },
                { id: 'dataset', label: 'Dataset Explorer' },
                { id: 'methodology', label: 'Methodology' },
                { id: 'faq', label: 'FAQ' },
              ].map(({ id, label }) => (
                <li key={id}>
                  <button
                    onClick={() => setActiveTab(id)}
                    className="text-sm text-ice/70 hover:text-marigold transition-colors duration-150"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-marigold mb-4">Stack</h3>
            <ul className="space-y-2 text-sm text-ice/70">
              <li>FastAPI + Python 3.13</li>
              <li>React + Vite + TypeScript</li>
              <li>Tailwind CSS v3</li>
              <li>scikit-learn Pipelines</li>
              <li>HistGradientBoosting</li>
              <li>Pydantic V2 Schemas</li>
            </ul>
            <div className="mt-5">
              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-marigold hover:text-marigold/80 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                API Docs (Swagger)
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ice/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ice/40">
          <span>© 2024 Mumbai Estate AI · Research & Portfolio Project</span>
          <span>Dataset: Mumbai Residential Listings (Mumbai1.csv) · 6,347 Records · 413 Localities</span>
        </div>
      </div>
    </footer>
  );
};
