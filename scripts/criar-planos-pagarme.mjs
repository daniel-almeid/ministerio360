// =====================================================================
// Ministério360 · cria os planos novos no Pagar.me (rodar UMA vez)
//
// Como usar (na pasta do site, C:\Users\Daniel\ministerio360):
//     node scripts/criar-planos-pagarme.mjs
//
// A chave secreta é lida de PAGARME_SECRET_KEY (variável de ambiente,
// .env.local ou .env). Ela não é exibida nem enviada a nenhum outro lugar.
//
// No final, o script mostra (e salva em scripts/planos-pagarme.sql) o SQL
// com os preços novos e os IDs. Esse SQL vai para o SQL Editor do Supabase.
// Pode rodar de novo sem medo: planos que já existem não são duplicados.
// Os planos antigos (R$ 49,90 e R$ 89,90) continuam lá para quem já assina.
// =====================================================================

import fs from "node:fs";
import path from "node:path";

const API = "https://api.pagar.me/core/v5";

function readKey() {
    if (process.env.PAGARME_SECRET_KEY) return process.env.PAGARME_SECRET_KEY.trim();
    for (const file of [".env.local", ".env"]) {
        const full = path.resolve(process.cwd(), file);
        if (!fs.existsSync(full)) continue;
        for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
            const m = line.match(/^\s*PAGARME_SECRET_KEY\s*=\s*(.*)\s*$/);
            if (m) return m[1].replace(/^["']|["']$/g, "").trim();
        }
    }
    return null;
}

const key = readKey();
if (!key) {
    console.error("❌ Não achei PAGARME_SECRET_KEY (nem no ambiente, nem em .env.local/.env).");
    console.error("   Rode este comando dentro da pasta do site (ministerio360).");
    process.exit(1);
}
const AUTH = "Basic " + Buffer.from(key + ":").toString("base64");
const TEST_KEY = key.startsWith("sk_test");

// Planos a criar ---------------------------------------------------------
const PLANS = [
    { slug: "standard",      label: "Standard", monthly: 3990, yearly: 39900 },
    { slug: "premium_basic", label: "Premium",  monthly: 6990, yearly: 69900 },
    { slug: "premium",       label: "Premium+", monthly: 9990, yearly: 99900 },
];
const YEARLY_INSTALLMENTS = Array.from({ length: 12 }, (_, i) => i + 1); // 1x a 12x

async function api(method, url, body) {
    const res = await fetch(API + url, {
        method,
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, json };
}

async function existingPlans() {
    const found = [];
    for (let page = 1; page <= 10; page++) {
        const { ok, json } = await api("GET", `/plans?page=${page}&size=100`);
        if (!ok || !Array.isArray(json?.data)) break;
        found.push(...json.data);
        if (json.data.length < 100) break;
    }
    return found.filter((p) => p.status === "active");
}

function planBody(name, description, interval, price, installments) {
    return {
        name,
        description,
        shippable: false,
        payment_methods: ["credit_card"],
        installments,
        statement_descriptor: "MINISTERIO360",
        currency: "BRL",
        interval,
        interval_count: 1,
        billing_type: "prepaid",
        items: [{ name, quantity: 1, pricing_scheme: { scheme_type: "unit", price } }],
        metadata: { app: "ministerio360" },
    };
}

async function ensurePlan(existing, name, description, interval, price, installments) {
    const same = existing.find((p) => p.name === name && p.interval === interval);
    if (same) {
        console.log(`• Já existe: ${name} → ${same.id}`);
        return { id: same.id, installments: Math.max(...(same.installments ?? [1])) };
    }

    let res = await api("POST", "/plans", planBody(name, description, interval, price, installments));
    let usedInstallments = installments;

    // Se a conta não aceitar parcelamento em assinatura, cria só à vista
    if (!res.ok && installments.length > 1) {
        console.warn(`⚠️  ${name}: o Pagar.me recusou o parcelamento (${res.json?.message ?? res.status}). Criando só à vista.`);
        usedInstallments = [1];
        res = await api("POST", "/plans", planBody(name, description, interval, price, usedInstallments));
    }

    if (!res.ok || !res.json?.id) {
        console.error(`❌ Erro ao criar ${name}:`, JSON.stringify(res.json, null, 2));
        process.exit(1);
    }
    console.log(`✅ Criado: ${name} → ${res.json.id}`);
    return { id: res.json.id, installments: Math.max(...usedInstallments) };
}

const money = (cents) => (cents / 100).toFixed(2);

console.log(`\nConta Pagar.me: ${TEST_KEY ? "TESTE (sk_test)" : "PRODUÇÃO"}\n`);
const existing = await existingPlans();
const sql = [
    "-- Gerado por scripts/criar-planos-pagarme.mjs",
    `-- Conta Pagar.me: ${TEST_KEY ? "TESTE" : "PRODUÇÃO"} · ${new Date().toLocaleString("pt-BR")}`,
    "-- Rodar no SQL Editor do Supabase DEPOIS do etapa4a_planos.sql",
    "",
];

for (const p of PLANS) {
    const monthly = await ensurePlan(existing, `Ministério360 ${p.label} Mensal`, `Plano ${p.label} - cobrança mensal`, "month", p.monthly, [1]);
    const yearly = await ensurePlan(existing, `Ministério360 ${p.label} Anual`, `Plano ${p.label} - cobrança anual`, "year", p.yearly, YEARLY_INSTALLMENTS);

    sql.push(
        `update public.plans set`,
        `    price_monthly = ${money(p.monthly)}, price_cents = ${p.monthly}, duration_days = 30,`,
        `    price_yearly_cents = ${p.yearly}, yearly_max_installments = ${yearly.installments},`,
        `    pagarme_plan_id = '${monthly.id}', pagarme_yearly_plan_id = '${yearly.id}', active = true`,
        `where plan_slug = '${p.slug}';`,
        ""
    );
}

const out = path.resolve(process.cwd(), "scripts", "planos-pagarme.sql");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, sql.join("\n"));

console.log("\n================ SQL para o SQL Editor ================\n");
console.log(sql.join("\n"));
console.log(`(salvo também em ${out})\n`);
