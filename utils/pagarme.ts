declare const Pagarme: any;

export async function tokenizeCard(card: {
  number: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}) {
  if (typeof window === "undefined") {
    throw new Error("Tokenização deve ser chamada no browser.");
  }

  const client = await Pagarme.client.connect({
    publicKey: process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY!,
  });

  const encrypted = await client.security.encrypt({
    card_number: card.number,
    card_holder_name: card.holderName,
    card_expiration_month: card.expMonth,
    card_expiration_year: card.expYear,
    card_cvv: card.cvv,
  });

  return encrypted;
}
