import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { FAQItem } from '../types';
import { SectionHeader, GoldAccentLine, ErrorBanner, CardSkeleton } from '../components/UIComponents';
import { ChevronDown, ChevronUp, BookOpen, Database, Brain, ShieldCheck, AlertCircle } from 'lucide-react';

const AccordionItem: React.FC<{ item: FAQItem; defaultOpen?: boolean }> = ({ item, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className={`glass-card rounded-2xl overflow-hidden border transition-all duration-200 ${open ? 'border-aubergine/20 shadow-glass' : 'border-ice'}`}>
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-aubergine pr-4">{item.question}</span>
        {open ? <ChevronUp className="w-4 h-4 text-marigold flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-warm-muted flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-warm-muted leading-relaxed border-t border-ice/60 pt-4">
          {item.answer}
          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-marigold">
            [{item.category}]
          </span>
        </div>
      )}
    </div>
  );
};

const MethodologySection: React.FC<{
  icon: React.ReactNode; title: string; children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="glass-card rounded-2xl p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 bg-aubergine-soft rounded-lg flex items-center justify-center border border-aubergine-border">
        <span className="text-aubergine">{icon}</span>
      </div>
      <h3 className="font-bold text-aubergine text-base">{title}</h3>
    </div>
    <div className="text-sm text-warm-muted leading-relaxed space-y-3">{children}</div>
  </div>
);

export const MethodologyFAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getFaq()
      .then(setFaqs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Methodology Section */}
      <section className="mb-20">
        <SectionHeader
          eyebrow="Technical Methodology"
          title="How Mumbai Estate AI works"
          subtitle="A transparent, auditable machine learning pipeline trained on authentic real estate records."
        />
        <GoldAccentLine />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <MethodologySection icon={<Database className="w-4 h-4" />} title="Dataset Source & Provenance">
            <p>
              The dataset is <strong className="text-aubergine">Mumbai1.csv</strong>, containing 6,347 residential property listings
              across the Mumbai Metropolitan Region (MMR), sourced from a curated real estate aggregation dataset.
              It covers localities from South Mumbai to Navi Mumbai, Thane, Virar, and Kalyan.
            </p>
            <p>
              <strong className="text-aubergine">Collection period:</strong> Historical residential listings.
              <strong className="text-aubergine"> License:</strong> Educational / Research use.
              No personal or identifiable information is present in the dataset.
            </p>
          </MethodologySection>

          <MethodologySection icon={<BookOpen className="w-4 h-4" />} title="Feature Engineering & Cleaning">
            <p>
              All 18 original columns were preserved without fabrication.
              The index column was dropped. Whitespace was stripped from locality names.
              Records with Price {'<'} ₹1L, Area {'<'} 100 sqft, or BHK {'<'} 1 were excluded as physically impossible
              (0 records lost — data was already clean).
            </p>
            <p>
              <strong className="text-aubergine">No missing values:</strong> All 6,347 rows fully complete.
              <br />
              <strong className="text-aubergine">No duplicates.</strong>
              <br />
              <strong className="text-aubergine">No feature creation beyond cleaning</strong> — all input columns come directly from the dataset.
            </p>
          </MethodologySection>

          <MethodologySection icon={<Brain className="w-4 h-4" />} title="Training Pipeline">
            <p>
              An 80/20 train-test split was performed first (random_state=42). Preprocessing was fit on the training
              set only to prevent leakage. The pipeline used <code className="bg-ice px-1 rounded text-xs">ColumnTransformer</code> with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Numeric:</strong> StandardScaler on Area and BHK</li>
              <li><strong>Categorical:</strong> OneHotEncoder with min_frequency=5, handle_unknown='ignore'</li>
              <li><strong>Binary:</strong> Passthrough for all 14 amenity flags</li>
            </ul>
            <p>
              <code className="bg-ice px-1 rounded text-xs">TransformedTargetRegressor</code> with log1p/expm1 was applied to handle
              price's right-skewed distribution. 5-fold cross-validation was used on the training set to compare models fairly.
            </p>
          </MethodologySection>

          <MethodologySection icon={<ShieldCheck className="w-4 h-4" />} title="Model Selection & Evaluation">
            <p>
              <strong className="text-aubergine">HistGradientBoostingRegressor</strong> was selected because it achieved
              the highest test set R² (0.535) and lowest test MAE (₹44.9L) on the untouched holdout.
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr className="border-b border-ice">
                    <th className="text-left pb-2 text-warm-muted">Model</th>
                    <th className="text-right pb-2 text-warm-muted">Test R²</th>
                    <th className="text-right pb-2 text-warm-muted">Test MAE</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {[
                    { name: 'HistGradientBoosting', r2: 0.5354, mae: '₹44.9L', best: true },
                    { name: 'Extra Trees', r2: 0.4579, mae: '₹49.6L', best: false },
                    { name: 'Random Forest', r2: 0.4418, mae: '₹49.1L', best: false },
                    { name: 'Ridge Regression', r2: -0.0246, mae: '₹48.9L', best: false },
                    { name: 'Dummy (Median)', r2: -0.0845, mae: '₹91.8L', best: false },
                  ].map((m) => (
                    <tr key={m.name} className={`border-b border-ice/40 ${m.best ? 'text-marigold font-bold' : 'text-warm-muted'}`}>
                      <td className="py-1.5">{m.best ? '★ ' : ''}{m.name}</td>
                      <td className="text-right">{m.r2.toFixed(4)}</td>
                      <td className="text-right">{m.mae}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MethodologySection>

          <MethodologySection icon={<AlertCircle className="w-4 h-4" />} title="Limitations & Responsible Use">
            <p>
              <strong className="text-aubergine">Test R² = 0.535</strong> means ~53.5% of price variance is explained.
              The remaining variance is due to unobserved factors: specific floor level, sea-facing views, builder
              reputation, interior renovation quality, exact road width, and current negotiated market rate.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Not a certified property appraisal or valuation report</li>
              <li>Prices reflect historical listing data, not live market conditions</li>
              <li>Rare localities ({`<`}5 records) use a grouped encoder tier</li>
              <li>Distribution shift: MMR market conditions may change over time</li>
              <li>Do not use for legal, financial, or registration purposes</li>
            </ul>
          </MethodologySection>

          <MethodologySection icon={<BookOpen className="w-4 h-4" />} title="Reproducibility & GitHub">
            <p>All training is fully reproducible:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>All random_state values set to 42</li>
              <li>Training script: <code className="bg-ice px-1 rounded">backend/ml/train.py</code></li>
              <li>Run: <code className="bg-ice px-1 rounded">python backend/ml/train.py Mumbai1.csv backend/ml/artifacts</code></li>
              <li>Model saved: <code className="bg-ice px-1 rounded">backend/ml/artifacts/model_pipeline.joblib</code></li>
              <li>Metadata: <code className="bg-ice px-1 rounded">backend/ml/artifacts/metadata.json</code></li>
              <li>11 tests pass: <code className="bg-ice px-1 rounded">python -m pytest backend/tests -v</code></li>
            </ul>
          </MethodologySection>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <SectionHeader
          eyebrow="Frequently Asked"
          title="Questions & Answers"
          subtitle="Grounded answers about the dataset, model design, and responsible usage."
        />
        <GoldAccentLine />
        <div className="mt-10 space-y-3">
          {loading ? (
            [1,2,3,4,5].map(i => <CardSkeleton key={i} lines={2} />)
          ) : error ? (
            <ErrorBanner title="Could not load FAQ" message={error} />
          ) : (
            faqs.map((item, i) => (
              <AccordionItem key={item.question} item={item} defaultOpen={i === 0} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};
