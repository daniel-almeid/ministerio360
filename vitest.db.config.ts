import path from "node:path";
import { defineConfig } from "vitest/config";

process.env.TZ = "America/Sao_Paulo";

// Testes do banco (permissões, convites, planos...): npm run test:db
// Rodam no banco do Supabase dentro de uma transação que é desfeita no fim.
export default defineConfig({
    resolve: { alias: { "@": path.resolve(__dirname) } },
    test: {
        include: ["tests/db/**/*.test.ts"],
        environment: "node",
        testTimeout: 60_000,
        hookTimeout: 60_000,
        fileParallelism: false,
    },
});
