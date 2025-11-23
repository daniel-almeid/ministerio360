import { mpClient } from "../client.js";

async function createPremiumPlan() {
  try {
    const response = await mpClient.post("/preapproval_plan", {
      reason: "Plano Premium - Ministerio360",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 1.00,
        currency_id: "BRL",
      },
      back_url: "https://seu-dominio.com/assinatura/retorno",
      status: "active",
    });

    console.log("Plano Premium criado com sucesso");
    console.log("ID:", response.data.id);
    console.log("Objeto completo:", response.data);
  } catch (err: any) {
    console.error("Erro ao criar plano Premium:", err.response?.data || err);
  }
}

createPremiumPlan();
