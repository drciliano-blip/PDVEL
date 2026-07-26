# PDV de Eventos — Visão e Roadmap (Plataforma Cashless)

> Documento de visão e arquitetura, não uma spec detalhada. Cada fase vira um prompt próprio e detalhado antes de ser implementada. Construir em fases, testando cada uma antes de avançar para a próxima.

## O que é

Evolução do PDV (hoje um protótipo standalone, pensado para ser vendido a empresas que administram eventos) para uma **plataforma cashless de eventos** — inspirada no modelo Zig, com diferenciais: reembolso PIX instantâneo sem taxa, BYOD (o celular do cliente é a carteira), API aberta.

## Base já decidida

- **Stack:** Next.js + Supabase.
- **Gateway de pagamento:** Asaas (PIX dinâmico + webhook + split de pagamento por cliente/vendor).
- **Reembolso em massa:** um BaaS (Asaas, Stark Bank, Transfeera ou Efí) para devolver saldo por PIX instantaneamente.

## Separação honesta: software × hardware

**Software (construído aqui, em fases):** dashboard em tempo real, catálogo, vendas, carteira cashless via BYOD/PWA, recarga e reembolso por PIX, estoque com baixa automática e previsão de demanda, split de pagamento, métricas de equipe, níveis de acesso, relatórios, conciliação, API/webhooks.

**Hardware/infraestrutura física (fora de escopo — exige parceiro de hardware):** pulseiras/cartões RFID, Smart POS próprios, rede mesh local, edge computing embarcado, totens físicos dedicados. O sistema é desenhado para conversar com esses dispositivos via API no futuro, mas não os programa. **Princípio-guia: priorizar BYOD** — o celular do cliente como carteira cashless (PWA, sem instalar app, PIX/Apple Pay/Google Pay) elimina a necessidade da maioria desse hardware.

## Arquitetura de alto nível

- **Frontend:** Next.js — web app + PWA (cliente e operadores).
- **Backend/dados:** Supabase (Postgres, Auth, Realtime).
- **Tempo real:** Supabase Realtime alimentando o dashboard ao vivo.
- **Pagamentos:** Asaas — PIX dinâmico, split, webhooks.
- **Reembolso em massa:** API do BaaS escolhido.
- **Resiliência offline (sem hardware dedicado):** PWA com service worker + IndexedDB + fila de sincronização, não rede mesh física.

## Fases

1. **PDV de consumo + PIX real (Asaas)** — catálogo, venda, cobrança PIX, venda vira receita. *Já especificada em `Fase1_PDV_Consumo_Asaas.md`. O protótipo mock atual (produtos, caixa, venda, relatórios, clientes, estoque, cancelamento, recibo, identificação de convidado, totem, LGPD) cobre a UX desta fase; falta a integração real (Supabase de produção + Asaas sandbox) para considerá-la de fato concluída e testada.*
2. **Carteira cashless BYOD** — cliente escaneia QR, abre PWA, se identifica (CPF), recarrega saldo via PIX, consome debitando do saldo. Split por vendor quando o evento tem marcas parceiras.
3. **Dashboard em tempo real** — faturamento por hora, ticket médio ao vivo, check-in/out, ranking de produtos, via Supabase Realtime.
4. **Estoque + inteligência** — baixa automática (já no protótipo mock), alerta de ruptura, IA preditiva de demanda. *Dynamic pricing e cruzamento climático dependem de histórico acumulado — só fazem sentido depois de dados reais.*
5. **Reembolso PIX instantâneo + fechamento automático** — resgate do saldo restante ao fim do evento via BaaS, sem fila e sem taxa; fechamento de caixa automático.
6. **Pessoas, acesso e relatórios avançados** — métricas por operador, níveis de acesso, conciliação bancária.
7. **Open API / integrações** — webhooks e API documentada para ingressos (Sympla/Eventbrite), ERPs, CRMs.

**Camada de hardware** (paralela, só com parceiro): RFID, Smart POS próprios, mesh/edge offline, totens físicos dedicados — o sistema nasce pronto para integrar via API, mas a construção física é de terceiros.

## Regras de execução

- Antes de iniciar cada fase, pedir a spec detalhada daquela fase (não presumir escopo).
- Não implementar hardware (RFID, Smart POS, mesh, totens físicos) — só deixar o sistema preparado para integrar com eles via API.
- IA preditiva e dynamic pricing ficam para as fases finais, quando já houver histórico de vendas.
- BYOD é o que torna o modelo viável sem virar fabricante de hardware — é o princípio central a proteger em qualquer decisão de arquitetura.
