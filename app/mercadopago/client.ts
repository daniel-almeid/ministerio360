import axios from "axios";
import dotenv from "dotenv";
import path from "path";

// Carrega o .env.local manualmente
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error("MP_ACCESS_TOKEN não definido nas variáveis de ambiente");
}

export const mpClient = axios.create({
  baseURL: "https://api.mercadopago.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
  },
});
