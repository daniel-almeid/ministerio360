import { mpClient } from "../client";

async function createStandardPlan() {
  try {
    const payload = {
      reason: "Plano Standard - Ministerio360",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 5.00,
        currency_id: "BRL",
      },
      back_url: "https://ministerio360.vercel.app/planos",
      status: "active",
    };

    console.log("Enviando payload Standard:", payload);

    const response = await mpClient.post("/preapproval_plan", payload);

    console.log("Plano Standard criado com sucesso");
    console.log("ID:", response.data.id);
    console.log("Objeto completo:", JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error("Erro ao criar plano Standard:");
    console.error(error.response?.data ?? error.message);
  }
}

createStandardPlan();
