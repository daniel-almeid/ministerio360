import type { SystemStatus } from "./systemStatus";

export const UNSTABLE_AFTER = 2;

export type SystemView = "ok" | "maintenance" | "offline" | "unstable";

// Regras de qual tela mostrar (separadas para teste)
export function decideView(input: {
    online: boolean;
    status: SystemStatus;
    failures: number;
    loadedOnce: boolean;
}): SystemView {
    if (input.status.active && !input.status.isAdmin) return "maintenance";
    if (!input.online && !input.loadedOnce) return "offline";
    if (input.online && input.failures >= UNSTABLE_AFTER) return "unstable";
    return "ok";
}
