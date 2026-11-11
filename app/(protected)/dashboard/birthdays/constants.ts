export const MONTH_NAMES = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
] as const;

// DDI usado quando o telefone foi salvo sem o código do país
export const DEFAULT_COUNTRY_CODE = "55";

// Valores provisórios que o cabeçalho usa enquanto carrega ou quando falha
const PLACEHOLDER_CHURCH_NAMES = ["Carregando...", "Igreja não definida", "Sem nome", "Erro ao carregar"];

// Mesma mensagem de parabéns do app
export function birthdayMessage(firstName: string, churchName?: string | null) {
    const church =
        churchName && !PLACEHOLDER_CHURCH_NAMES.includes(churchName.trim())
            ? churchName.trim()
            : null;

    const signature = church
        ? `Toda a família da ${church} celebra com você!`
        : "Sua família na fé celebra com você!";

    return (
        `Feliz aniversário, ${firstName}! 🎉🎂\n\n` +
        "Que Deus abençoe sua vida com muita saúde, paz e alegria neste novo ano. " +
        signature
    );
}
