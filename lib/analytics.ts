// Estatística de uso do site (PostHog), sem cookies e sem guardar nada no navegador.
// Cada aba aberta é uma visita anônima. Na área logada, os eventos são ligados à igreja
// apenas pelo código interno dela (sem nome, e-mail, telefone ou valores).
// Só liga com NEXT_PUBLIC_POSTHOG_KEY configurada (Vercel), e nunca em localhost.

export type SiteEvent =
    | "$pageview"
    | "clique"
    | "conta_criada"
    | "login_feito"
    | "logout"
    | "recurso_recibo_impresso"
    | "recurso_ficha_impressa"
    | "assinatura_iniciada"
    | "assinatura_concluida"
    | "assinatura_erro";

type Props = Record<string, string | number | boolean | null | undefined>;

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");

function randomId() {
    try {
        return crypto.randomUUID();
    } catch {
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }
}

// Estado só em memória (some ao fechar a aba)
const visitId = typeof window !== "undefined" ? randomId() : "";
let distinctId = visitId;
let identified = false;
let superProps: Props = {};

function enabled() {
    if (typeof window === "undefined" || !KEY) return false;
    const h = window.location.hostname;
    return h !== "localhost" && h !== "127.0.0.1" && !h.endsWith(".local");
}

// Tira do endereço os códigos de convite/confirmação e qualquer parâmetro que não seja de campanha
export function cleanUrl(href: string): { url: string; path: string } {
    try {
        const u = new URL(href);
        const path = u.pathname
            .replace(/^\/(confirmar|convite)\/[^/]+/, "/$1/:token")
            .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi, "/:id");
        const keep = new URLSearchParams();
        u.searchParams.forEach((v, k) => {
            if (/^utm_|^(gclid|fbclid|ref)$/.test(k)) keep.set(k, v);
        });
        const q = keep.toString();
        return { url: `${u.origin}${path}${q ? `?${q}` : ""}`, path };
    } catch {
        return { url: "", path: "" };
    }
}

function campaign(): Props {
    const p: Props = {};
    try {
        new URL(window.location.href).searchParams.forEach((v, k) => {
            if (/^utm_(source|medium|campaign|term|content)$/.test(k)) p[k] = v.slice(0, 100);
        });
    } catch {
        // sem campanha
    }
    return p;
}

function referrer(): Props {
    const r = document.referrer;
    if (!r) return { $referrer: "$direct", $referring_domain: "$direct" };
    try {
        const u = new URL(r);
        if (u.host === window.location.host) return {};
        return { $referrer: `${u.origin}${u.pathname}`, $referring_domain: u.host };
    } catch {
        return {};
    }
}

const firstReferrer = typeof window !== "undefined" ? referrer() : {};
const firstCampaign = typeof window !== "undefined" ? campaign() : {};

function send(event: string, properties: Record<string, unknown>) {
    const body = JSON.stringify({
        api_key: KEY,
        event,
        distinct_id: distinctId,
        timestamp: new Date().toISOString(),
        properties,
    });
    try {
        fetch(`${HOST}/i/v0/e/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
        }).catch(() => {});
    } catch {
        // estatística nunca atrapalha o uso
    }
}

export function track(event: SiteEvent, props: Props = {}) {
    if (!enabled()) return;
    const { url, path } = cleanUrl(window.location.href);
    send(event, {
        ...superProps,
        ...firstReferrer,
        ...firstCampaign,
        ...props,
        $current_url: url,
        $pathname: path,
        $host: window.location.host,
        $session_id: visitId,
        $lib: "ministerio360-site",
        $device_type: window.innerWidth < 768 ? "Mobile" : "Desktop",
        $screen_width: window.screen?.width,
        $geoip_disable: true,
        plataforma: "site",
        // visita anônima não cria perfil; só a igreja (código interno) tem perfil
        $process_person_profile: identified,
    });
}

// Área logada: liga os eventos à igreja (só o código interno)
export function identifyChurch(churchId: string, plan: string | null, active: boolean | null) {
    if (!enabled() || !churchId) return;
    superProps = { ...superProps, ...(plan ? { plano: plan } : {}) };
    if (identified && distinctId === churchId) return;
    const anon = distinctId;
    distinctId = churchId;
    identified = true;
    const set: Record<string, unknown> = { tipo: "igreja" };
    if (plan) set.plano = plan;
    if (active !== null) set.assinatura_ativa = active;
    send("$identify", { $anon_distinct_id: anon, $set: set, $geoip_disable: true, $lib: "ministerio360-site" });
}

// Saiu da conta: volta a ser uma visita anônima nova
export function resetAnalytics() {
    distinctId = randomId();
    identified = false;
    superProps = {};
}
