import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

dotenv.config();

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  throw new Error(
    "MP_ACCESS_TOKEN não encontrado. Configure no .env.local (dev) e nas variáveis do Vercel (prod)."
  );
}

export const mpClient = axios.create({
  baseURL: "https://api.mercadopago.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
});
