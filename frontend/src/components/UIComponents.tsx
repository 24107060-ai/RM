import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-ice-dark/40 rounded-lg animate-pulse ${className}`} />
);

interface CardSkeletonProps {
  lines?: number;
}
export const CardSkeleton: React.FC<CardSkeletonProps> = ({ lines = 3 }) => (
  <div className="glass-card rounded-2xl p-6 space-y-4">
    <Skeleton className="h-5 w-2/5" />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/5' : 'w-full'}`} />
    ))}
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, accent }) => (
  <div className={`glass-card rounded-2xl p-6 transition-all duration-200 hover:shadow-glass-hover ${accent ? 'border-marigold/30 border-2' : ''}`}>
    <p className="text-xs uppercase tracking-widest text-warm-muted font-semibold mb-2">{label}</p>
    <p className={`text-2xl font-bold ${accent ? 'text-marigold' : 'text-aubergine'} editorial-title leading-none`}>
      {value}
    </p>
    {sub && <p className="text-xs text-warm-muted mt-1.5">{sub}</p>}
  </div>
);

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ title = 'Error', message, onRetry }) => (
  <div className="flex flex-col gap-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4">
    <div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-sm mt-0.5">{message}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="self-start text-sm font-semibold text-rose-600 underline underline-offset-2 hover:text-rose-800 transition-colors"
      >
        Try again
      </button>
    )}
  </div>
);

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
    {icon && <div className="text-warm-muted/40">{icon}</div>}
    <div>
      <p className="text-lg font-semibold text-aubergine">{title}</p>
      {description && <p className="text-sm text-warm-muted mt-1.5 max-w-xs mx-auto">{description}</p>}
    </div>
    {action}
  </div>
);

interface BadgeProps {
  label: string;
  variant?: 'default' | 'marigold' | 'success' | 'warning' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const variants: Record<string, string> = {
    default: 'bg-ice text-aubergine border-ice-dark',
    marigold: 'bg-marigold/10 text-amber-800 border-marigold/30',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]}`}>
      {label}
    </span>
  );
};

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, subtitle, center }) => (
  <div className={`mb-10 ${center ? 'text-center' : ''}`}>
    {eyebrow && (
      <p className="text-xs font-bold uppercase tracking-widest text-marigold mb-2">{eyebrow}</p>
    )}
    <h2 className="editorial-title text-3xl md:text-4xl font-bold text-aubergine leading-tight">{title}</h2>
    {subtitle && (
      <p className="mt-3 text-base text-warm-muted max-w-2xl leading-relaxed">{subtitle}</p>
    )}
  </div>
);

export const Divider: React.FC = () => (
  <div className="w-full border-t border-ice/70 my-12" />
);

export const GoldAccentLine: React.FC = () => (
  <div className="w-16 h-1 rounded-full bg-marigold mt-4" />
);

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (value - start) * eased;
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
};
