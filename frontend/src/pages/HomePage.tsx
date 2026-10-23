import React, { useEffect, useState } from 'react';
import { SkylineHeroIllustration } from '../components/SkylineHeroIllustration';
import { SectionHeader, GoldAccentLine, CardSkeleton, ErrorBanner } from '../components/UIComponents';
import { api } from '../services/api';
import type { HealthResponse } from '../types';
import {
  ArrowUpRight, BarChart2, Building2, Brain, ShieldCheck,
  TrendingUp, ChevronRight, Zap, Database
} from 'lucide-react';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: boolean;
}> = ({ icon, title, description, accent }) => (
  <div className={`glass-card rounded-2xl p-6 transition-all duration-200 group hover:shadow-glass-hover hover:-translate-y-0.5 ${accent ? 'border-l-4 border-l-marigold' : ''}`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accent ? 'bg-marigold/15' : 'bg-aubergine-soft border border-aubergine-border'}`}>
      <div className={accent ? 'text-amber-700' : 'text-aubergine'}>{icon}</div>
    </div>
    <h3 className="font-bold text-aubergine mb-1.5 text-base">{title}</h3>
    <p className="text-sm text-warm-muted leading-relaxed">{description}</p>
  </div>
);

const HowItWorksStep: React.FC<{ num: string; title: string; desc: string; last?: boolean }> = ({
  num, title, desc, last
}) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-9 h-9 rounded-full bg-aubergine text-marigold text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-md">
        {num}
      </div>
      {!last && <div className="w-0.5 h-full mt-2 bg-gradient-to-b from-aubergine/30 to-transparent" />}
    </div>
    <div className="pb-8">
      <h4 className="font-bold text-aubergine text-sm mb-1">{title}</h4>
      <p className="text-sm text-warm-muted">{desc}</p>
    </div>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    api.checkHealth()
      .then(setHealth)
      .catch(() => setHealthError('Cannot connect to local API server. Please ensure the FastAPI backend is running on port 8000.'))
      .finally(() => setHealthLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 min-h-[72vh]">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-8 h-0.5 bg-marigold rounded-full" />
            <span className="text-xs font-bold uppercase tracking-widest text-warm-muted">ML-Powered Real Estate Intelligence</span>
          </div>
          <h1 className="editorial-title text-5xl md:text-6xl font-bold text-aubergine leading-[1.08] mb-6">
            Estimate any<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aubergine to-aubergine-light">
              Mumbai property
            </span>
            <br />in seconds.
          </h1>
          <p className="text-lg text-warm-muted mb-8 max-w-md leading-relaxed">
            Empirical machine learning trained on <span className="text-aubergine font-semibold">6,347 verified MMR listings</span> across
            413 localities. Transparent uncertainty bounds. No fabricated metrics.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <button
              onClick={() => setActiveTab('predict')}
              id="hero-predict-cta"
              className="flex items-center gap-2 bg-aubergine hover:bg-aubergine-light text-white px-7 py-3.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-150 active:scale-[0.98]"
            >
              <span>Predict Property Price</span>
              <ArrowUpRight className="w-4 h-4 text-marigold" />
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className="flex items-center gap-2 bg-white border border-ice text-aubergine px-7 py-3.5 rounded-xl font-semibold text-sm hover:border-aubergine/30 hover:bg-ice/50 transition-all duration-150"
            >
              <BarChart2 className="w-4 h-4" />
              <span>View Benchmarks</span>
            </button>
          </div>

          {/* Live API Stats */}
          {healthLoading ? (
            <div className="flex gap-4">
              <CardSkeleton lines={1} />
              <CardSkeleton lines={1} />
            </div>
          ) : healthError ? (
            <ErrorBanner message={healthError} />
          ) : health ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card rounded-xl px-4 py-3 border-l-2 border-l-marigold text-center">
                <p className="text-xl font-bold text-aubergine editorial-title">{health.dataset_records.toLocaleString('en-IN')}</p>
                <p className="text-[10px] uppercase tracking-widest text-warm-muted mt-0.5">Listings</p>
              </div>
              <div className="glass-card rounded-xl px-4 py-3 border-l-2 border-l-aubergine text-center">
                <p className="text-xl font-bold text-aubergine editorial-title">{health.locations_count}</p>
                <p className="text-[10px] uppercase tracking-widest text-warm-muted mt-0.5">Localities</p>
              </div>
              <div className={`glass-card rounded-xl px-4 py-3 border-l-2 ${health.model_loaded ? 'border-l-emerald-500' : 'border-l-rose-400'} text-center`}>
                <p className="text-xl font-bold text-aubergine editorial-title truncate">{health.model_version}</p>
                <p className="text-[10px] uppercase tracking-widest text-warm-muted mt-0.5">Model v.</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Skyline Illustration */}
        <div className="relative flex justify-center items-center">
          <SkylineHeroIllustration />
          <div className="absolute -top-6 -right-6 hidden lg:block">
            <div className="glass-card rounded-2xl p-4 shadow-glass-hover border border-marigold/20 w-44">
              <p className="text-xs text-warm-muted mb-1">HistGradient CV R²</p>
              <p className="text-2xl font-bold text-aubergine editorial-title">0.694</p>
              <div className="w-full h-1.5 bg-ice mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-marigold rounded-full" style={{ width: '69.4%' }} />
              </div>
              <p className="text-[10px] text-warm-muted mt-1">5-fold cross-validation</p>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 hidden lg:block">
            <div className="glass-card rounded-2xl p-4 shadow-glass w-48">
              <p className="text-xs text-warm-muted mb-1">Best Model: Test MAE</p>
              <p className="text-xl font-bold text-aubergine editorial-title">₹44.9L</p>
              <p className="text-[10px] text-warm-muted mt-1">HistGradientBoosting</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-24">
        <SectionHeader
          eyebrow="What's inside"
          title="End-to-end ML transparency"
          subtitle="Every number on this platform comes from the real Mumbai1.csv dataset. No invented metrics, no black-box assumptions."
        />
        <GoldAccentLine />
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={<Building2 className="w-5 h-5" />}
            title="413 Mumbai Localities"
            description="Predict across Kharghar, Thane West, Andheri, Powai, Borivali, and 400+ MMR suburbs with locality-aware encoding."
            accent
          />
          <FeatureCard
            icon={<Brain className="w-5 h-5" />}
            title="5 Models Benchmarked"
            description="Dummy baseline → Ridge → Random Forest → Extra Trees → HistGradientBoosting. Best selected on untouched test R²."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Calibrated Uncertainty"
            description="80% empirical prediction intervals computed from validated log-residual error on the held-out test set, not invented."
            accent
          />
          <FeatureCard
            icon={<Database className="w-5 h-5" />}
            title="Zero Missing Values"
            description="Dataset has no null entries. All 6,347 records fully valid across price, area, location, BHK, and 13 amenity features."
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5" />}
            title="Instant Predictions"
            description="FastAPI backend with joblib pipeline — inference in milliseconds. No model retraining on request."
            accent
          />
          <FeatureCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Honest Metrics"
            description="Test R² = 0.535. We state this clearly, explain its meaning, and distinguish it from classification accuracy."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <SectionHeader
            eyebrow="Process"
            title="How predictions are generated"
            subtitle="A reproducible, auditable pipeline — from raw data to calibrated price estimate."
          />
          <GoldAccentLine />
          <div className="mt-10">
            <HowItWorksStep
              num="01"
              title="Enter Property Details"
              desc="Provide area, BHK, locality, property age and available amenities. All fields map directly to dataset columns."
            />
            <HowItWorksStep
              num="02"
              title="Pipeline Transforms Features"
              desc="StandardScaler on numeric features, OneHotEncoder with min_frequency=5 on locations — identical to training."
            />
            <HowItWorksStep
              num="03"
              title="HistGradientBoosting Inference"
              desc="Log-transformed target regressor predicts price. Expm1 applied to recover INR value. Min-clamped to ₹1L."
            />
            <HowItWorksStep
              num="04"
              title="Confidence Interval Appended"
              desc="80% empirical band from test-set log-residual standard deviation. Wider for rare localities."
              last
            />
          </div>
        </div>

        {/* Model Transparency Card */}
        <div className="glass-card rounded-3xl p-8 shadow-glass border border-aubergine/8">
          <p className="text-xs font-bold uppercase tracking-widest text-marigold mb-4">Model Transparency</p>
          <h3 className="editorial-title text-2xl font-bold text-aubergine mb-6">HistGradientBoosting — Selected Model</h3>
          <div className="space-y-4">
            {[
              { label: 'Test R²', value: '0.535', sub: '20% holdout, not training set' },
              { label: 'Test MAE', value: '₹44.9L', sub: 'Mean absolute price error' },
              { label: 'Test RMSE', value: '₹1.21 Cr', sub: 'RMS price deviation' },
              { label: 'CV R² (5-fold)', value: '0.645 ± 0.067', sub: 'On 80% training split only' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-ice last:border-0">
                <div>
                  <p className="text-sm font-semibold text-aubergine">{label}</p>
                  <p className="text-xs text-warm-muted">{sub}</p>
                </div>
                <span className="text-base font-bold text-marigold editorial-title">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setActiveTab('metrics')}
              className="flex items-center gap-1.5 text-sm font-semibold text-aubergine hover:text-aubergine-light transition-colors"
            >
              <span>Full benchmarks</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('methodology')}
              className="flex items-center gap-1.5 text-sm font-semibold text-warm-muted hover:text-aubergine transition-colors"
            >
              <span>Methodology</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-aubergine rounded-3xl p-10 sm:p-14 text-center text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-widest text-marigold mb-3">Get Started</p>
        <h2 className="editorial-title text-4xl font-bold mb-4">Ready to estimate a property?</h2>
        <p className="text-ice/75 max-w-md mx-auto mb-8 text-sm leading-relaxed">
          Fill in the property details and get a calibrated price estimate backed by real Mumbai residential data.
        </p>
        <button
          onClick={() => setActiveTab('predict')}
          className="inline-flex items-center gap-2 bg-marigold hover:bg-marigold-hover text-aubergine-deep px-8 py-3.5 rounded-xl font-bold text-sm shadow-gold-glow transition-all duration-150 active:scale-[0.97]"
        >
          <span>Start Predicting</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
