import { CancelarFichaForm } from '@/components/CancelarFichaForm';

export default function CancelarFichaPage() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted text-sm">
        Cancela uma única ficha (não afeta outras fichas da mesma venda).
      </p>
      <CancelarFichaForm operadorPadrao="" />
    </div>
  );
}
