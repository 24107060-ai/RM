import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { ModelMetricsResponse, ModelMetricItem } from '../types';
import { SectionHeader, GoldAccentLine, ErrorBanner, CardSkeleton, Badge } from '../components/UIComponents';
import { Award, TrendingDown, BarChart2, Info, ChevronDown, ChevronUp } from 'lucide-react';

const MetricBar: React.FC<{ value: number; max: number; label: string; gold?: boolean }> = ({ value, max, label, gold }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-warm-muted">{label}</span>
        <span className="font-semibold text-aubergine">{value.toFixed(4)}</span>
      </div>
      <div className="h-2 bg-ice rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${gold ? 'bg-marigold' : 'bg-aubergine/50'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const formatINR = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const ModelCard: React.FC<{ item: ModelMetricItem; isBest: boolean }> = ({ item, isBest }) => {
  const [expanded, setExpanded] = useState(isBest);
  return (
    <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-200 ${isBest ? 'border-2 border-marigold/50 shadow-gold-glow/20 shadow-lg' : 'border border-ice'}`}>
      <div
        className={`px-6 py-4 flex items-center justify-between cursor-pointer ${isBest ? 'bg-marigold/5' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {isBest && (
            <div className="w-7 h-7 bg-marigold rounded-lg flex items-center justify-center shadow-sm">
              <Award className="w-4 h-4 text-aubergine-deep" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-aubergine text-sm">{item.model_name}</h3>
              {isBest && <Badge label="Selected" variant="marigold" />}
            </div>
            <p className="text-xs text-warm-muted">
              Test R² {item.test_r2.toFixed(4)} · Test MAE {formatINR(item.test_mae)}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-warm-muted" /> : <ChevronDown className="w-4 h-4 text-warm-muted" />}
      </div>

      {expanded && (
        <div className="px-6 pb-6 pt-1 space-y-5 border-t border-ice/60">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {[
              { label: 'CV R² (5-fold)', value: `${item.cv_r2_mean.toFixed(4)} ± ${item.cv_r2_std.toFixed(4)}` },
              { label: 'Test R²', value: item.test_r2.toFixed(4) },
              { label: 'Train R²', value: item.train_r2.toFixed(4) },
              { label: 'Test MAE', value: formatINR(item.test_mae) },
              { label: 'Test RMSE', value: formatINR(item.test_rmse) },
              { label: 'Train MAE', value: formatINR(item.train_mae) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-warm-surface rounded-xl px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-widest text-warm-muted font-medium">{label}</p>
                <p className="text-sm font-bold text-aubergine mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-warm-muted">R² Performance (Test)</p>
            <MetricBar value={item.test_r2} max={1} label="Test R²" gold={isBest} />
            <MetricBar value={item.cv_r2_mean} max={1} label="CV R² mean" gold={isBest} />
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureImportanceBar: React.FC<{ feature: string; importance: number; maxImportance: number }> = ({
  feature, importance, maxImportance
}) => {
  const pct = (importance / maxImportance) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 text-xs text-warm-muted font-medium truncate text-right flex-shrink-0" title={feature}>
        {feature}
      </div>
      <div className="flex-1 h-4 bg-ice rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-aubergine to-aubergine-light rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-aubergine w-14 text-right">{(importance * 100).toFixed(2)}%</span>
    </div>
  );
};

export const ModelMetricsPage: React.FC = () => {
  const [data, setData] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getModelMetrics()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const maxImportance = data?.feature_importances?.[0]?.importance ?? 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        eyebrow="Benchmark Results"
        title="Model Evaluation & Selection"
        subtitle="Five candidate models were benchmarked on an untouched 20% holdout test set, after 5-fold cross-validation on the training split."
      />
      <GoldAccentLine />

      {/* Interpretation guide */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: <TrendingDown className="w-4 h-4" />, title: 'Lower MAE / RMSE = Better', desc: 'Mean Absolute Error and Root Mean Squared Error should be as small as possible. MAE is more interpretable; RMSE penalizes large errors more.' },
          { icon: <BarChart2 className="w-4 h-4" />, title: 'R² ≠ Accuracy', desc: 'R² measures explained variance, not classification accuracy. R² = 0.53 is meaningful for noisy real estate data. It is not 53% correct/incorrect.' },
          { icon: <Info className="w-4 h-4" />, title: 'CV vs Test Metrics', desc: 'Cross-validation R² is on training data only. Test metrics are on a fully held-out set, never seen during training — a more honest estimate.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2 text-aubergine">
              {icon}
              <p className="text-sm font-bold">{title}</p>
            </div>
            <p className="text-xs text-warm-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} lines={4} />)}
        </div>
      ) : error ? (
        <ErrorBanner title="Could not load metrics" message={error} />
      ) : data ? (
        <div className="space-y-4">
          {/* Sort so best model is first */}
          {[...data.metrics]
            .sort((a, b) => b.test_r2 - a.test_r2)
            .map((item) => (
              <ModelCard
                key={item.model_name}
                item={item}
                isBest={item.model_name === data.best_model}
              />
            ))}

          {/* Notes */}
          <div className="mt-6 glass-card rounded-2xl p-6 border-l-4 border-l-aubergine">
            <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-2">Evaluator Notes</p>
            <p className="text-sm text-warm-muted leading-relaxed">{data.evaluation_notes}</p>
          </div>

          {/* Feature Importances */}
          {data.feature_importances.length > 0 && (
            <div className="glass-card rounded-2xl p-6 mt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-1">Feature Importances</p>
              <p className="text-xs text-warm-muted mb-5">Top 15 features by relative importance in the selected HistGradientBoosting model.</p>
              <div className="space-y-2.5">
                {data.feature_importances.map((fi) => (
                  <FeatureImportanceBar
                    key={fi.feature}
                    feature={fi.feature}
                    importance={fi.importance}
                    maxImportance={maxImportance}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
