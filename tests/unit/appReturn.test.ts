import { describe, expect, it } from "vitest";
import { cameFromApp } from "@/components/system/appReturn";

const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = (meta: Record<string, unknown>) => `x.${b64({ sub: "1", user_metadata: meta })}.y`;

describe("volta ao aplicativo depois de confirmar o e-mail", () => {
    it("conta criada pelo app: manda de volta ao app", () => {
        expect(cameFromApp(`#access_token=${token({ origem: "app", church_name: "Igreja São João" })}&type=signup`)).toBe(true);
    });
    it("conta criada pelo site: segue no site", () => {
        expect(cameFromApp(`#access_token=${token({ church_name: "Igreja" })}&type=signup`)).toBe(false);
    });
    it("troca de senha ou link quebrado: não faz nada", () => {
        expect(cameFromApp(`#access_token=${token({ origem: "app" })}&type=recovery`)).toBe(false);
        expect(cameFromApp("#access_token=lixo&type=signup")).toBe(false);
        expect(cameFromApp("")).toBe(false);
    });
});
