export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-foreground hover:brightness-105',
  secondary: 'bg-surface-muted text-foreground border border-border hover:bg-border/40',
  ghost: 'text-muted hover:text-foreground',
  danger: 'text-danger hover:bg-danger-bg',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-14 px-6 text-base',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = ''
): string {
  return [base, variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(' ');
}

export function cardClasses(className = ''): string {
  return ['rounded-xl border border-border bg-surface shadow-sm', className].filter(Boolean).join(' ');
}

export function inputClasses(className = ''): string {
  return [
    'h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}
