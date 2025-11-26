import { mpClient } from "../client";

async function main() {
    try {
        const response = await mpClient.post("/preapproval_plan", {
            reason: "Plano Standard - Ministerio360",
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                transaction_amount: 1.0,
                currency_id: "BRL"
            },
            back_url: "https://seu-dominio.com/assinatura/retorno",
            status: "active"
        });

        console.log("Plano Standard criado com sucesso");
        console.log("ID:", response.data.id);
        console.log("Objeto completo:", JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error("Erro ao criar plano Standard");
        console.error(error.response?.data ?? error.message);
    }
}

main();
