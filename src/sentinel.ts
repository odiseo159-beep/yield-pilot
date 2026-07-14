import { config } from "./config.js";
import { account } from "./chain.js";

export type SentinelReport = {
  target: string;
  score: number;
  recommendation: "SAFE" | "CAUTION" | "AVOID";
  action: string;
  reason: string;
};

/**
 * Check de seguridad pre-operación contra celo-sentinel.
 * Con SENTINEL_PAID=true paga $0.001 vía x402 (requiere signer fondeado con USDT);
 * si no, llama directo (válido cuando el sentinel corre en modo free).
 * Fail-open con CAUTION: si el sentinel no responde, se opera solo con tokens del allowlist.
 */
export async function checkToken(addr: string): Promise<SentinelReport> {
  const url = `${config.sentinelUrl}/check/token/${addr}`;
  try {
    let res: Response;
    if (config.sentinelPaid && account) {
      const { wrapFetchWithPaymentFromConfig } = await import("@x402/fetch");
      const { ExactEvmScheme } = await import("@x402/evm");
      const fetchWithPay = wrapFetchWithPaymentFromConfig(fetch, {
        schemes: [{ network: "eip155:42220", client: new ExactEvmScheme(account) }],
      });
      res = await fetchWithPay(url);
    } else {
      res = await fetch(url);
    }
    if (!res.ok) throw new Error(`sentinel HTTP ${res.status}`);
    return (await res.json()) as SentinelReport;
  } catch (e) {
    return {
      target: addr,
      score: 0,
      recommendation: "CAUTION",
      action: "proceed_with_limits",
      reason: `sentinel no disponible (${e instanceof Error ? e.message : e}) — operando solo allowlist`,
    };
  }
}
