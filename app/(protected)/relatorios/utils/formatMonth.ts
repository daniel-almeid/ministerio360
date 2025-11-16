export function formatMonthName(month: string) {
    const [year, monthNum] = month.split("-");

    return new Date(Number(year), Number(monthNum) - 1).toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
    });
}
