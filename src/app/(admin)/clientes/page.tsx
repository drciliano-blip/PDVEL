import { listClientes } from '@/lib/data/clientes';
import { listEventosByCliente } from '@/lib/data/eventos';
import { listEspacos } from '@/lib/data/espacos';
import {
  createClienteAction,
  createEventoAction,
  criarSubcontaAsaasAction,
  toggleFichasHabilitadasAction,
} from './actions';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EntrarEventoButton } from '@/components/EntrarEventoButton';
import { ClientesSubNav } from '@/components/ClientesSubNav';

export default async function ClientesPage() {
  const clientes = await listClientes();
  const espacos = await listEspacos();
  const eventosPorCliente = await Promise.all(
    clientes.map(async (cliente) => ({
      cliente,
      eventos: await listEventosByCliente(cliente.id),
    }))
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-muted text-sm">Empresas que usam o PDV nos eventos delas.</p>
      </div>

      <ClientesSubNav ativo="clientes" />

      <Card>
        <form action={createClienteAction} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Nome da empresa</label>
            <Input name="nome" required className="w-56" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Comissão (%)</label>
            <Input name="comissaoPercentual" type="number" step="0.1" min="0" max="100" required className="w-28" />
          </div>
          <Button type="submit">Adicionar cliente</Button>
        </form>
      </Card>

      <div className="flex flex-col gap-6">
        {eventosPorCliente.map(({ cliente, eventos }) => (
          <Card key={cliente.id} className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold">{cliente.nome}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Comissão: {cliente.comissaoPercentual}%</span>
                {cliente.asaasWalletId ? (
                  <Badge tone="success">Asaas conectado</Badge>
                ) : (
                  <Badge tone="warning">Asaas pendente</Badge>
                )}
              </div>
            </div>

            {eventos.length === 0 ? (
              <p className="text-sm text-muted">Nenhum evento cadastrado ainda.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {eventos.map((evento) => (
                  <li key={evento.id} className="flex items-center justify-between gap-2 flex-wrap">
                    <span>
                      {evento.nome}{' '}
                      <span className="text-muted">
                        · {new Date(evento.data).toLocaleDateString('pt-BR')}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <form action={toggleFichasHabilitadasAction.bind(null, evento.id)}>
                        <Button type="submit" variant="ghost" size="sm">
                          <Badge tone={evento.fichasHabilitadas ? 'success' : 'neutral'}>
                            {evento.fichasHabilitadas ? 'Fichas habilitadas' : 'Fichas desabilitadas'}
                          </Badge>
                        </Button>
                      </form>
                      <EntrarEventoButton eventoId={evento.id} clienteId={cliente.id} />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form action={createEventoAction} className="flex flex-wrap items-end gap-3 border-t border-border pt-3">
              <input type="hidden" name="clienteId" value={cliente.id} />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Novo evento</label>
                <Input name="nome" placeholder="Nome do evento" required className="w-48" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Data</label>
                <Input name="data" type="date" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Espaço</label>
                <select
                  name="espacoId"
                  className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">Sem espaço definido</option>
                  {espacos.map((espaco) => (
                    <option key={espaco.id} value={espaco.id}>
                      {espaco.nome}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted pb-2.5">
                <input type="checkbox" name="fichasHabilitadas" className="w-4 h-4" />
                Habilitar impressão de fichas
              </label>
              <Button type="submit" variant="secondary" size="sm">
                Adicionar evento
              </Button>
            </form>

            {!cliente.asaasWalletId && (
              <details className="border-t border-border pt-3">
                <summary className="text-sm font-medium cursor-pointer text-accent">
                  Completar cadastro Asaas (necessário para cobrar PIX com split)
                </summary>
                <form
                  action={criarSubcontaAsaasAction.bind(null, cliente.id)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Tipo</label>
                    <select
                      name="tipoPessoa"
                      className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
                      defaultValue="juridica"
                    >
                      <option value="juridica">Pessoa jurídica</option>
                      <option value="fisica">Pessoa física</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">E-mail</label>
                    <Input name="email" type="email" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">CPF/CNPJ</label>
                    <Input name="cpfCnpj" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Celular</label>
                    <Input name="mobilePhone" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Faturamento/renda mensal (R$)</label>
                    <Input name="incomeValue" type="number" step="0.01" min="0" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Data de nascimento (se pessoa física)</label>
                    <Input name="birthDate" type="date" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Tipo de empresa (se pessoa jurídica)</label>
                    <select
                      name="companyType"
                      className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
                      defaultValue=""
                    >
                      <option value="">—</option>
                      <option value="MEI">MEI</option>
                      <option value="LIMITED">Limitada</option>
                      <option value="INDIVIDUAL">Empresário individual</option>
                      <option value="ASSOCIATION">Associação</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">CEP</label>
                    <Input name="postalCode" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Endereço</label>
                    <Input name="address" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Número</label>
                    <Input name="addressNumber" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted">Bairro</label>
                    <Input name="province" required />
                  </div>
                  <Button type="submit" size="sm" className="w-fit self-end">
                    Enviar cadastro Asaas
                  </Button>
                </form>
              </details>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
