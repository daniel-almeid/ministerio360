import path from "node:path";
import { defineConfig } from "vitest/config";

// Datas dos testes sempre no horário de Brasília (igual ao uso real)
process.env.TZ = "America/Sao_Paulo";

// Testes rápidos (sem banco): npm test
export default defineConfig({
    resolve: { alias: { "@": path.resolve(__dirname) } },
    esbuild: { jsx: "automatic" },
    test: {
        include: ["tests/unit/**/*.test.{ts,tsx}", "tests/api/**/*.test.ts", "tests/ui/**/*.test.tsx"],
        environment: "node",
        restoreMocks: true,
        setupFiles: ["tests/setup.ts"],
    },
});
