import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DatasetSummaryResponse } from '../types';
import { SectionHeader, GoldAccentLine, ErrorBanner, CardSkeleton, StatCard } from '../components/UIComponents';
import { Database, MapPin, Home, BarChart2 } from 'lucide-react';

const formatINR = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const PriceDistBar: React.FC<{ label: string; value: number; min: number; max: number }> = ({
  label, value, min, max
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-warm-muted">{label}</span>
        <span className="font-semibold text-aubergine">{formatINR(value)}</span>
      </div>
      <div className="h-2 bg-ice rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-aubergine to-marigold rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const DatasetExplorerPage: React.FC = () => {
  const [data, setData] = useState<DatasetSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDatasetSummary()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        eyebrow="Data Provenance"
        title="Mumbai1.csv — Dataset Explorer"
        subtitle="Aggregate statistics from the real training dataset. No individual records are shown to protect listing privacy."
      />
      <GoldAccentLine />

      {loading ? (
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <CardSkeleton key={i} lines={2} />)}
        </div>
      ) : error ? (
        <div className="mt-10">
          <ErrorBanner title="Could not load dataset summary" message={error} />
        </div>
      ) : data ? (
        <div className="mt-10 space-y-10">
          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Records" value={data.total_records.toLocaleString('en-IN')} sub="0 missing values" accent />
            <StatCard label="Training Set" value={data.train_records.toLocaleString('en-IN')} sub="80% stratified split" />
            <StatCard label="Test Set" value={data.test_records.toLocaleString('en-IN')} sub="20% untouched holdout" />
            <StatCard label="Localities" value={data.num_locations} sub="Across MMR & suburbs" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Price distribution */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 className="w-4 h-4 text-aubergine" />
                <h3 className="font-bold text-aubergine">Price Distribution (INR)</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Minimum', value: data.price_summary.min },
                  { label: 'Q1 (25th pct.)', value: 5300000 },
                  { label: 'Median', value: data.price_summary.median },
                  { label: 'Mean', value: data.price_summary.mean },
                  { label: 'Q3 (75th pct.)', value: 17500000 },
                  { label: 'Maximum', value: data.price_summary.max },
                ].map(({ label, value }) => (
                  <PriceDistBar
                    key={label}
                    label={label}
                    value={value}
                    min={data.price_summary.min}
                    max={data.price_summary.max}
                  />
                ))}
              </div>
              <p className="text-xs text-warm-muted mt-4">
                Std dev: {formatINR(data.price_summary.std)} · Distribution is right-skewed (mean {'>'} median).
                Log transformation applied in model training to improve prediction.
              </p>
            </div>

            {/* Area distribution */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Home className="w-4 h-4 text-aubergine" />
                <h3 className="font-bold text-aubergine">Area Distribution (sq ft)</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Minimum', value: data.area_summary.min },
                  { label: 'Q1', value: 650 },
                  { label: 'Median', value: data.area_summary.median },
                  { label: 'Mean', value: data.area_summary.mean },
                  { label: 'Q3', value: 1182 },
                  { label: 'Maximum', value: data.area_summary.max },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-warm-muted">{label}</span>
                      <span className="font-semibold text-aubergine">{value.toLocaleString()} sq ft</span>
                    </div>
                    <div className="h-2 bg-ice rounded-full overflow-hidden">
                      <div
                        className="h-full bg-aubergine/50 rounded-full"
                        style={{ width: `${((value - data.area_summary.min) / (data.area_summary.max - data.area_summary.min)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bedrooms distribution */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Database className="w-4 h-4 text-aubergine" />
                <h3 className="font-bold text-aubergine">BHK Distribution</h3>
              </div>
              <div className="space-y-2.5">
                {Object.entries(data.bedrooms_distribution)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([bhk, count]) => {
                    const pct = (count / data.total_records) * 100;
                    return (
                      <div key={bhk} className="flex items-center gap-3">
                        <div className="w-16 text-xs font-bold text-aubergine text-right">{bhk} BHK</div>
                        <div className="flex-1 h-5 bg-ice rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-aubergine rounded-lg flex items-center pl-2 transition-all duration-700"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          >
                            <span className="text-[10px] text-white font-semibold whitespace-nowrap">
                              {pct > 8 ? `${count.toLocaleString()}` : ''}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-warm-muted w-12 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Amenities coverage */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-aubergine" />
                <h3 className="font-bold text-aubergine">Amenity Coverage (%)</h3>
              </div>
              <div className="space-y-2.5">
                {Object.entries(data.amenities_percentage)
                  .sort(([, a], [, b]) => b - a)
                  .map(([amenity, pct]) => (
                    <div key={amenity} className="flex items-center gap-3">
                      <div className="w-36 text-xs text-warm-muted text-right truncate">{amenity}</div>
                      <div className="flex-1 h-3 bg-ice rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-marigold/60 to-marigold rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-aubergine w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Top localities table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-ice flex items-center gap-2">
              <MapPin className="w-4 h-4 text-aubergine" />
              <h3 className="font-bold text-aubergine">Top Localities by Listing Volume</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-ice bg-ice/40">
                    {['Rank', 'Locality', 'Listings', 'Avg Price', 'Median Price', 'Avg Price/sqft'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] uppercase tracking-widest text-warm-muted font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.top_locations.map((loc, i) => (
                    <tr key={loc.name} className="border-b border-ice/50 hover:bg-ice/30 transition-colors">
                      <td className="px-5 py-3 text-warm-muted text-xs">#{i + 1}</td>
                      <td className="px-5 py-3 font-semibold text-aubergine">{loc.name}</td>
                      <td className="px-5 py-3 text-aubergine">{loc.count.toLocaleString()}</td>
                      <td className="px-5 py-3">{formatINR(loc.avg_price)}</td>
                      <td className="px-5 py-3">{formatINR(loc.median_price)}</td>
                      <td className="px-5 py-3">₹{loc.avg_price_per_sqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/sqft</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Preprocessing notes */}
          <div className="glass-card rounded-2xl p-6 border-l-4 border-l-marigold">
            <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-3">Preprocessing Summary</p>
            <ul className="space-y-2 text-sm text-warm-muted">
              <li>✓ <strong className="text-aubergine">0 missing values</strong> — all 6,347 records fully complete</li>
              <li>✓ <strong className="text-aubergine">0 duplicates</strong> — verified with pandas <code className="bg-ice px-1 rounded text-xs">duplicated()</code></li>
              <li>✓ <strong className="text-aubergine">Leakage prevention</strong> — train/test split performed <em>before</em> any fitting</li>
              <li>✓ <strong className="text-aubergine">Rare locality grouping</strong> — OneHotEncoder <code className="bg-ice px-1 rounded text-xs">min_frequency=5</code></li>
              <li>✓ <strong className="text-aubergine">Log1p target transform</strong> — applied via TransformedTargetRegressor to handle price skewness</li>
              <li>✓ <strong className="text-aubergine">Outlier strategy</strong> — records with Price {'<'} ₹1L, Area {'<'} 100 sqft, or BHK {'<'} 1 removed</li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};
