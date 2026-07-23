import type { InputHTMLAttributes } from 'react';
import { inputClasses } from './styles';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClasses(className)} {...props} />;
}
