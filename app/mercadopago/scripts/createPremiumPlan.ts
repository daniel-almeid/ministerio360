// mercadopago/scripts/createPremiumPlan.ts
import { mpClient } from "./client";

async function createPremiumPlan() {
  try {
    const payload = {
      reason: "Plano Premium - Ministerio360",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 8.0, // R$ 8,00
        currency_id: "BRL",
      },
      back_url: "https://ministerio360.vercel.app/planos",
      status: "active",
    };

    console.log("Enviando payload Premium:", payload);

    const response = await mpClient.post("/preapproval_plan", payload);

    console.log("Plano Premium criado com sucesso");
    console.log("ID:", response.data.id);
    console.log("Objeto completo:", JSON.stringify(response.data, null, 2));
  } catch (err: any) {
    console.error("Erro ao criar plano Premium:");
    console.error(err?.response?.data || err?.message || err);
  }
}

createPremiumPlan();
