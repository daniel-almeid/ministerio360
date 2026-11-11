// WhatsApp no computador: abre o WhatsApp Web / app de mesa com a mensagem pronta (mesmas regras do app)

// DDI usado quando o telefone foi salvo sem o código do país
const DEFAULT_COUNTRY_CODE = "55";

// "(11) 98888-1020" -> "5511988881020". Retorna null se não parecer um telefone válido.
export function toWhatsAppNumber(phone: string | null | undefined) {
    if (!phone) return null;

    let digits = phone.replace(/\D/g, "");

    // Salvo com "+" (ex.: "+55 11 98888-1020" ou número de outro país): já está completo
    if (phone.trim().startsWith("+")) {
        return digits.length >= 10 && digits.length <= 15 ? digits : null;
    }

    // "0 11 98888-1020" / "011..." -> tira o zero de discagem
    digits = digits.replace(/^0+/, "");

    // DDD + número (10 ou 11 dígitos): acrescenta o DDI do Brasil
    if (digits.length === 10 || digits.length === 11) {
        return DEFAULT_COUNTRY_CODE + digits;
    }

    // Já tem DDI (ex.: 55 + DDD + número, ou outro país)
    if (digits.length >= 12 && digits.length <= 15) {
        return digits;
    }

    return null;
}

// Conversa com um número, com a mensagem já escrita
export function whatsappChatUrl(number: string, message: string) {
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// Só o texto: a pessoa escolhe a conversa ou o grupo no WhatsApp
export function whatsappShareUrl(message: string) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function openInNewTab(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
}

// Copia um texto; devolve false se o navegador não deixar
export async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
