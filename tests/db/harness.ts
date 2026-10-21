// =====================================================================
// Testes do banco: cada teste roda numa transação que SEMPRE é desfeita
// (ROLLBACK). Nada do que o teste cria fica gravado no Supabase.
//
// Precisa da variável SUPABASE_DB_URL (no .env.local ou no GitHub):
//   Supabase › Project Settings › Database › Connection string › URI
//   (use o "Session pooler", porta 5432)
// =====================================================================
import { readFileSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { Client } from "pg";
import { afterAll, test } from "vitest";

loadEnv({ path: path.resolve(__dirname, "../../.env.local"), quiet: true });
loadEnv({ quiet: true });

const DB_URL = process.env.SUPABASE_DB_URL;
const HELPERS = readFileSync(path.join(__dirname, "helpers.sql"), "utf8");

if (!DB_URL) {
    console.warn("⚠️  SUPABASE_DB_URL não definida: os testes do banco foram pulados.");
}

let client: Client | null = null;

async function getClient() {
    if (!client) {
        const fresh = new Client({
            connectionString: DB_URL,
            ssl: { rejectUnauthorized: false },
            application_name: "ministerio360-testes",
            connectionTimeoutMillis: 15_000,
        });
        await fresh.connect(); // se falhar, o próximo teste tenta conectar de novo
        await fresh.query("set statement_timeout = '30s'");
        client = fresh;
    }
    return client;
}

afterAll(async () => {
    await client?.end();
    client = null;
});

// Roda um bloco PL/pgSQL (o "corpo" do teste) com as funções auxiliares de helpers.sql.
// Um erro "FALHOU: ..." vindo do banco faz o teste falhar com a mensagem certa.
export function dbTest(name: string, body: string) {
    test.skipIf(!DB_URL)(name, async () => {
        const db = await getClient();
        await db.query("begin");
        try {
            await db.query(HELPERS);
            await db.query(`do $test$ ${body} $test$;`);
        } finally {
            await db.query("rollback");
        }
    });
}
