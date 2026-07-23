import { Card } from '@/components/ui/Card';

export default function PrivacidadePage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Política de Privacidade</h1>
        <p className="text-muted text-sm mt-1">
          Rascunho técnico — descreve o que este sistema efetivamente coleta e para quê. Não
          substitui a revisão de um advogado antes do uso com clientes e convidados reais.
        </p>
      </div>

      <Card className="flex flex-col gap-4 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold mb-1">Quais dados coletamos</h2>
          <p className="text-muted">
            Ao identificar um convidado no ponto de venda, podemos coletar: nome (opcional), CPF
            (opcional) e o número do cartão de consumo emitido pelo espaço para o evento. Não
            coletamos nem armazenamos dados de cartão de crédito ou débito — pagamentos são feitos
            por PIX ou dinheiro, processados fora deste cadastro.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">Para que usamos</h2>
          <p className="text-muted">
            Esses dados servem apenas para identificar rapidamente o convidado durante o
            atendimento no evento (ex.: emissão de nota, histórico de compras). Cada venda é paga
            no ato — este cadastro não cria uma conta ou saldo em aberto.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">Consentimento</h2>
          <p className="text-muted">
            Sempre que um CPF é registrado, pedimos a confirmação explícita do titular antes de
            salvar. Sem essa confirmação, o CPF não é armazenado.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">Prazo de guarda e remoção</h2>
          <p className="text-muted">
            Os dados ficam associados ao evento em que foram coletados. O titular pode solicitar a
            correção ou remoção do seu cadastro a qualquer momento, entrando em contato com o
            espaço responsável pelo evento.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">Compartilhamento</h2>
          <p className="text-muted">
            Os dados do convidado não são compartilhados com terceiros, exceto quando exigido por
            lei.
          </p>
        </section>
      </Card>
    </div>
  );
}
