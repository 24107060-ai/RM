import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import type { PropertyPredictionRequest, PredictionResponse, LocationItem } from '../types';
import { SectionHeader, GoldAccentLine, ErrorBanner, AnimatedCounter } from '../components/UIComponents';
import {
  MapPin, BedDouble, ArrowRight, RotateCcw, Info,
  CheckCircle, AlertTriangle, Building2, ChevronDown, X
} from 'lucide-react';

const AMENITY_FIELDS: Array<{ key: keyof PropertyPredictionRequest; label: string; description: string }> = [
  { key: 'gymnasium', label: 'Gymnasium', description: 'Fitness centre on premises' },
  { key: 'lift_available', label: 'Lift / Elevator', description: 'At least one elevator in building' },
  { key: 'car_parking', label: 'Car Parking', description: 'Dedicated parking spot' },
  { key: 'maintenance_staff', label: 'Maintenance Staff', description: 'On-site building maintenance' },
  { key: 'security_24x7', label: '24×7 Security', description: 'Round-the-clock guards or CCTV' },
  { key: 'children_play_area', label: "Children's Play Area", description: 'Playground within the complex' },
  { key: 'clubhouse', label: 'Clubhouse', description: 'Community hall or recreation center' },
  { key: 'intercom', label: 'Intercom', description: 'Visitor intercom system' },
  { key: 'landscaped_gardens', label: 'Landscaped Gardens', description: 'Maintained green spaces' },
  { key: 'indoor_games', label: 'Indoor Games', description: 'Table tennis, carom, chess room' },
  { key: 'gas_connection', label: 'Piped Gas', description: 'PNG / piped gas connection' },
  { key: 'jogging_track', label: 'Jogging Track', description: 'Walking / running track on compound' },
  { key: 'swimming_pool', label: 'Swimming Pool', description: 'Swimming pool within the complex' },
];

const DEFAULT_FORM: PropertyPredictionRequest = {
  area: 850,
  bedrooms: 2,
  location: '',
  new_or_resale: 0,
  gymnasium: 0,
  lift_available: 1,
  car_parking: 1,
  maintenance_staff: 0,
  security_24x7: 1,
  children_play_area: 1,
  clubhouse: 0,
  intercom: 0,
  landscaped_gardens: 0,
  indoor_games: 0,
  gas_connection: 0,
  jogging_track: 0,
  swimming_pool: 0,
};

// Locality searchable dropdown
const LocationDropdown: React.FC<{
  value: string;
  onChange: (val: string) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    setLoading(true);
    api.getLocations(q || undefined)
      .then(setLocations)
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    search('');
  }, [search]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(q), 280);
  };

  const handleSelect = (loc: string) => {
    setQuery(loc);
    onChange(loc);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setOpen(false);
    search('');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query
    ? locations.filter((l) => l.name.toLowerCase().includes(query.toLowerCase())).slice(0, 30)
    : locations.slice(0, 30);

  return (
    <div ref={wrapperRef} className="relative">
      <div className={`relative flex items-center border rounded-xl overflow-hidden transition-all ${
        error ? 'border-rose-400 bg-rose-50' : open ? 'border-aubergine shadow-md' : 'border-ice-dark bg-white hover:border-aubergine/40'
      }`}>
        <MapPin className="absolute left-3 w-4 h-4 text-warm-muted flex-shrink-0" />
        <input
          id="location-search"
          type="text"
          autoComplete="off"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder="Search locality (e.g. Kharghar, Powai...)"
          className="w-full py-3 pl-9 pr-10 text-sm bg-transparent text-aubergine placeholder-warm-muted/60 focus:outline-none"
          aria-label="Search Mumbai locality"
        />
        {query ? (
          <button onClick={handleClear} className="absolute right-3 p-0.5 text-warm-muted hover:text-aubergine" aria-label="Clear location">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <ChevronDown className="absolute right-3 w-4 h-4 text-warm-muted" />
        )}
      </div>

      {open && (
        <div className="absolute z-30 top-full mt-1.5 w-full bg-white border border-ice shadow-glass-hover rounded-xl overflow-hidden max-h-64 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-warm-muted">Searching localities…</p>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-warm-muted">
              <p>No matching locality found.</p>
              <p className="text-xs mt-1">You may still enter any name — the model will use a regional baseline for unknown localities.</p>
            </div>
          ) : (
            filtered.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleSelect(loc.name)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-ice/60 flex items-center justify-between transition-colors border-b border-ice/50 last:border-0"
              >
                <span className="font-medium text-aubergine">{loc.name}</span>
                <span className="text-[11px] text-warm-muted">
                  {loc.count} listings · ₹{(loc.avg_price_per_sqft / 1000).toFixed(1)}K/sqft
                </span>
              </button>
            ))
          )}
        </div>
      )}
      {error && <p className="text-rose-600 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  );
};

// Amenity Toggle Button
const AmenityToggle: React.FC<{
  field: typeof AMENITY_FIELDS[number];
  value: number;
  onChange: (val: number) => void;
}> = ({ field, value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(value === 1 ? 0 : 1)}
    title={field.description}
    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 select-none ${
      value === 1
        ? 'bg-aubergine text-white border-aubergine shadow-sm'
        : 'bg-white text-warm-muted border-ice-dark hover:border-aubergine/40 hover:text-aubergine'
    }`}
    aria-pressed={value === 1}
    aria-label={`${field.label}: ${value === 1 ? 'enabled' : 'disabled'}`}
  >
    {field.label}
  </button>
);

// Prediction Result Card
const PredictionResultCard: React.FC<{
  result: PredictionResponse;
  onReset: () => void;
  onTryAnother: () => void;
}> = ({ result, onReset, onTryAnother }) => {
  const crores = result.estimated_price_inr / 10000000;
  return (
    <div className="animate-fadeIn">
      <div className="glass-card rounded-3xl p-8 md:p-10 border border-marigold/20 shadow-gold-glow/30 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-marigold mb-2">Price Estimate</p>
            <div className="editorial-title text-5xl font-bold text-aubergine leading-none">
              <AnimatedCounter
                value={crores}
                prefix="₹"
                suffix=" Cr"
                decimals={2}
              />
            </div>
            <p className="text-warm-muted text-sm mt-2">{result.price_per_sqft_formatted}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            result.location_known ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {result.location_known ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {result.location_known ? `${result.location_property_count} records` : 'Unseen locality'}
          </div>
        </div>

        {/* Confidence Interval */}
        {result.confidence_interval && (
          <div className="bg-ice/60 rounded-2xl p-5 mb-6 border border-ice-dark/40">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-warm-muted" />
              <p className="text-xs font-bold uppercase tracking-widest text-warm-muted">
                {result.confidence_interval.confidence_level} Prediction Interval
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-[11px] text-warm-muted mb-0.5">Lower</p>
                <p className="font-bold text-aubergine text-base">{result.confidence_interval.lower_formatted}</p>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-2 rounded-full bg-ice-dark relative overflow-hidden">
                  <div
                    className="absolute h-full bg-marigold/70 rounded-full"
                    style={{ left: '20%', right: '20%' }}
                  />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2 bg-marigold rounded-sm" />
                </div>
                <p className="text-[10px] text-warm-muted mt-1">{result.confidence_interval.confidence_level} band</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-warm-muted mb-0.5">Upper</p>
                <p className="font-bold text-aubergine text-base">{result.confidence_interval.upper_formatted}</p>
              </div>
            </div>
            <p className="text-[11px] text-warm-muted mt-3 leading-relaxed">{result.confidence_interval.explanation}</p>
          </div>
        )}

        {/* Submitted features summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Area', value: `${result.submitted_features.area_sqft.toLocaleString()} sq ft` },
            { label: 'BHK', value: `${result.submitted_features.bedrooms} Bedroom` },
            { label: 'Type', value: result.submitted_features.property_type },
            { label: 'Amenities', value: `${result.submitted_features.amenities_count}/13` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-warm-surface rounded-xl p-3 text-center">
              <p className="text-[11px] uppercase tracking-wide text-warm-muted mb-0.5">{label}</p>
              <p className="text-sm font-bold text-aubergine">{value}</p>
            </div>
          ))}
        </div>

        {/* Locality display */}
        <div className="flex items-center gap-2 bg-aubergine-soft border border-aubergine-border rounded-xl px-4 py-2.5 mb-5">
          <MapPin className="w-4 h-4 text-aubergine flex-shrink-0" />
          <span className="text-sm font-medium text-aubergine">{result.submitted_features.location}</span>
          <span className="text-xs text-warm-muted ml-auto">{result.location_property_count} historical listings</span>
        </div>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-2 mb-5">
            {result.warnings.map((w, i) => (
              <div key={i} className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">{w}</p>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[11px] text-warm-muted leading-relaxed bg-ice/40 rounded-lg p-3 mb-6 border border-ice-dark/30">
          <span className="font-semibold">Disclaimer:</span> {result.disclaimer}
        </p>

        {/* Model attribution */}
        <div className="flex items-center justify-between text-xs text-warm-muted border-t border-ice pt-4 mb-6">
          <span>Model: <span className="font-semibold text-aubergine">{result.model_name}</span></span>
          <span>v{result.model_version}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onTryAnother}
            className="flex-1 flex items-center justify-center gap-2 bg-aubergine text-white py-3 rounded-xl text-sm font-semibold hover:bg-aubergine-light transition-all"
          >
            <span>Try Another</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 border border-ice px-4 py-3 rounded-xl text-sm font-medium text-warm-muted hover:text-aubergine hover:border-aubergine/30 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

// ——— Main Predict Page ———
interface PredictPageProps {
  predictRef: React.RefObject<HTMLDivElement>;
}

export const PredictPage: React.FC<PredictPageProps> = ({ predictRef }) => {
  const [form, setForm] = useState<PropertyPredictionRequest>(DEFAULT_FORM);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const updateField = <K extends keyof PropertyPredictionRequest>(key: K, value: PropertyPredictionRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setValidationErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<string, string>> = {};
    if (!form.location.trim()) errors.location = 'Please select or type a locality name.';
    if (!form.area || form.area < 100) errors.area = 'Area must be at least 100 sq ft.';
    if (form.area > 15000) errors.area = 'Area cannot exceed 15,000 sq ft.';
    if (!form.bedrooms || form.bedrooms < 1) errors.bedrooms = 'BHK must be at least 1.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    setResult(null);
    try {
      const res = await api.predictPrice(form);
      setResult(res);
      setShowResult(true);
    } catch (err: any) {
      setApiError(err.message || 'Prediction request failed. Please check the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setResult(null);
    setShowResult(false);
    setApiError(null);
    setValidationErrors({});
  };

  const handleTryAnother = () => {
    setResult(null);
    setShowResult(false);
    setApiError(null);
  };

  return (
    <div ref={predictRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        eyebrow="Price Prediction"
        title="Estimate your Mumbai property"
        subtitle="Fill in the property details below. All fields are sourced from the Mumbai1.csv dataset columns."
      />
      <GoldAccentLine />

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form panel */}
        <div className="lg:col-span-3">
          <form id="property-prediction-form" onSubmit={handleSubmit} noValidate className="glass-card rounded-3xl p-8 shadow-glass space-y-7">

            {/* Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-warm-muted mb-2" htmlFor="location-search">
                Locality <span className="text-marigold">*</span>
              </label>
              <LocationDropdown
                value={form.location}
                onChange={(val) => updateField('location', val)}
                error={validationErrors.location}
              />
            </div>

            {/* Area + BHK row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="area-input" className="block text-xs font-bold uppercase tracking-widest text-warm-muted mb-2">
                  Built-up Area (sq ft) <span className="text-marigold">*</span>
                </label>
                <div className={`flex items-center border rounded-xl overflow-hidden transition-all ${
                  validationErrors.area ? 'border-rose-400 bg-rose-50' : 'border-ice-dark bg-white hover:border-aubergine/40 focus-within:border-aubergine focus-within:shadow-md'
                }`}>
                  <input
                    id="area-input"
                    type="number"
                    min="100"
                    max="15000"
                    step="50"
                    value={form.area || ''}
                    onChange={(e) => updateField('area', parseFloat(e.target.value) || 0)}
                    className="w-full py-3 pl-4 pr-2 text-sm bg-transparent text-aubergine focus:outline-none"
                    placeholder="850"
                    aria-label="Property area in square feet"
                  />
                  <span className="pr-4 text-xs text-warm-muted font-medium whitespace-nowrap">sq ft</span>
                </div>
                {validationErrors.area && (
                  <p className="text-rose-600 text-xs mt-1.5 ml-1">{validationErrors.area}</p>
                )}
                <p className="text-[11px] text-warm-muted mt-1 ml-1">Dataset range: 200–8,511 sq ft (mean: 1,004 sq ft)</p>
              </div>

              <div>
                <label htmlFor="bedrooms-input" className="block text-xs font-bold uppercase tracking-widest text-warm-muted mb-2">
                  Bedrooms (BHK) <span className="text-marigold">*</span>
                </label>
                <div className={`flex items-center border rounded-xl overflow-hidden transition-all ${
                  validationErrors.bedrooms ? 'border-rose-400 bg-rose-50' : 'border-ice-dark bg-white hover:border-aubergine/40 focus-within:border-aubergine focus-within:shadow-md'
                }`}>
                  <BedDouble className="w-4 h-4 ml-3 text-warm-muted flex-shrink-0" />
                  <select
                    id="bedrooms-input"
                    value={form.bedrooms}
                    onChange={(e) => updateField('bedrooms', parseInt(e.target.value))}
                    className="w-full py-3 pl-3 pr-4 text-sm bg-transparent text-aubergine focus:outline-none appearance-none cursor-pointer"
                    aria-label="Number of bedrooms"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <option key={n} value={n}>{n} BHK {n >= 6 ? '(rare)' : ''}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-warm-muted mt-1 ml-1">Most common: 1 BHK (36%) & 2 BHK (41%)</p>
              </div>
            </div>

            {/* New or Resale */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-3">Property Condition</p>
              <div className="flex gap-3">
                {[{ val: 0, label: 'Resale / Secondary', sub: '66% of dataset' }, { val: 1, label: 'New Construction', sub: '34% of dataset' }].map(({ val, label, sub }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateField('new_or_resale', val)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      form.new_or_resale === val
                        ? 'bg-aubergine text-white border-aubergine shadow-md'
                        : 'bg-white text-warm-muted border-ice-dark hover:border-aubergine/40'
                    }`}
                    aria-pressed={form.new_or_resale === val}
                  >
                    <span className="block">{label}</span>
                    <span className="text-[10px] font-normal opacity-60">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-1">Amenities</p>
              <p className="text-xs text-warm-muted mb-3">Select all amenities available at this property:</p>
              <div className="flex flex-wrap gap-2">
                {AMENITY_FIELDS.map((field) => (
                  <AmenityToggle
                    key={field.key}
                    field={field}
                    value={form[field.key] as number}
                    onChange={(v) => updateField(field.key, v)}
                  />
                ))}
              </div>
            </div>

            {/* API Error */}
            {apiError && <ErrorBanner title="Prediction Failed" message={apiError} onRetry={() => setApiError(null)} />}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-aubergine hover:bg-aubergine-light text-white py-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Running Inference...</span>
                </>
              ) : (
                <>
                  <span>Estimate Property Price</span>
                  <ArrowRight className="w-4 h-4 text-marigold" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {showResult && result ? (
            <PredictionResultCard
              result={result}
              onReset={handleReset}
              onTryAnother={handleTryAnother}
            />
          ) : (
            <div className="glass-card rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center gap-5 min-h-[500px] border border-dashed border-ice-dark">
              <div className="w-16 h-16 bg-ice rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-aubergine/30" />
              </div>
              <div>
                <p className="font-bold text-aubergine mb-1.5">Prediction result will appear here</p>
                <p className="text-sm text-warm-muted max-w-[220px] leading-relaxed">
                  Complete the form and click "Estimate Property Price" to see your calibrated valuation.
                </p>
              </div>
              <div className="w-full border-t border-ice mt-2 pt-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-warm-muted mb-3">Quick Reference</p>
                {[
                  { label: 'Dataset median', value: '₹95L' },
                  { label: 'Dataset mean', value: '₹1.52 Cr' },
                  { label: 'Price per sq ft avg', value: '₹13,555' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-warm-muted">{label}</span>
                    <span className="font-semibold text-aubergine">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
