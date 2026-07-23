import type { HTMLAttributes } from 'react';
import { cardClasses } from './styles';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export function Card({ className, padding = true, ...props }: CardProps) {
  return <div className={cardClasses([padding ? 'p-5' : '', className].filter(Boolean).join(' '))} {...props} />;
}
