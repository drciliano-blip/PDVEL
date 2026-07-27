import { ResgatarFichaForm } from '@/components/ResgatarFichaForm';

export default function ResgatarFichaPage() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted text-sm">
        Digite ou leia o código da ficha antes de entregar o item no balcão.
      </p>
      <ResgatarFichaForm operadorPadrao="" />
    </div>
  );
}
