# Testes do Ministério360 (site)

| Comando | O que testa |
|---|---|
| `npm test` | Regras (planos, permissões, finanças), rotas da API (assinatura, webhook, convite, excluir conta) e telas (portão de acesso, cartão do plano, pagamento). Não usa internet nem banco. |
| `npm run test:watch` | O mesmo, rodando de novo a cada arquivo salvo. |
| `npm run test:db` | Regras do banco (isolamento entre igrejas, papéis, usuários, escalas, finanças, admin, planos). |

## Testes do banco

Rodam no banco real, **dentro de uma transação que é desfeita no final** — nada fica gravado.

1. No Supabase: **Connect → Session pooler** e copie a URI (com a senha do banco).
2. No `.env.local`, adicione: `SUPABASE_DB_URL=postgresql://...`
3. No GitHub (para rodar automático): **Settings → Secrets and variables → Actions → New repository secret**, nome `SUPABASE_DB_URL`, com a mesma URI.

Sem essa variável, os testes do banco são pulados.

## Pastas

- `tests/unit` — funções puras
- `tests/api` — rotas da API com Supabase e Pagar.me falsos (`fakes.ts`)
- `tests/ui` — telas (React Testing Library)
- `tests/db` — banco (`helpers.sql` + `harness.ts`)
