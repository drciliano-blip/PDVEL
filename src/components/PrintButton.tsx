'use client';

import { Button } from '@/components/ui/Button';

export function PrintButton({ label = 'Imprimir' }: { label?: string }) {
  return (
    <Button type="button" variant="secondary" onClick={() => window.print()} className="print:hidden">
      {label}
    </Button>
  );
}
