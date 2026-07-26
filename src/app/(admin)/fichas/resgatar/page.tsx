import { ResgatarFichaForm } from '@/components/ResgatarFichaForm';

export default function ResgatarFichaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Resgatar ficha</h1>
        <p className="text-muted text-sm">
          Digite ou leia o código da ficha antes de entregar o item no balcão.
        </p>
      </div>
      <ResgatarFichaForm operadorPadrao="" />
    </div>
  );
}
