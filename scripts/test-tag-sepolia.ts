/**
 * Prueba GRATIS de la mecánica ERC-8021 en Celo Sepolia (testnet):
 * 1. Envía una tx tagueada (self-transfer con toDataSuffix — schema 0)
 * 2. Envía una llamada a contrato tagueada (approve(0) en cUSD testnet,
 *    sufijo APPENDEADO al calldata — el caso real del rebalancer)
 * 3. Verifica ambas con verifyTx del SDK (decode del tag on-chain)
 *
 * Uso: TEST_PRIVATE_KEY=0x... npx tsx scripts/test-tag-sepolia.ts
 */
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  encodeFunctionData,
  concat,
  parseAbi,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { toDataSuffix, verifyTx } from "@celo/attribution-tags";

const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: { default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://celo-sepolia.blockscout.com" } },
});

// Un cUSD de Celo Sepolia (verificado con código on-chain — sirve cualquier ERC20 para el approve(0) de prueba)
const CUSD_SEPOLIA = "0xAe10A9e08d979e7D154D3b0212FB7cbf70fa6Bb1" as const;
const TAG = process.env.ATTRIBUTION_TAG || "yieldpilot_tagtest"; // el real cuando exista

const pk = process.env.TEST_PRIVATE_KEY as `0x${string}` | undefined;
if (!pk) { console.error("Falta TEST_PRIVATE_KEY"); process.exit(1); }

const account = privateKeyToAccount(pk);
const publicClient = createPublicClient({ chain: celoSepolia, transport: http() });
const walletClient = createWalletClient({ account, chain: celoSepolia, transport: http() });

const bal = await publicClient.getBalance({ address: account.address });
console.log(`signer ${account.address} · balance ${bal} wei`);
if (bal === 0n) { console.error("Sin CELO de testnet — pasa por faucet.celo.org"); process.exit(1); }

const suffix = toDataSuffix(TAG) as Hex;
console.log(`tag "${TAG}" → suffix ${suffix}`);

// --- 1. transferencia simple tagueada (data = suffix a secas) ---
console.log("\n[1/2] self-transfer tagueada…");
const tx1 = await walletClient.sendTransaction({ to: account.address, value: 0n, data: suffix });
await publicClient.waitForTransactionReceipt({ hash: tx1 });
console.log(`  tx: https://celo-sepolia.blockscout.com/tx/${tx1}`);

// --- 2. llamada a contrato tagueada (calldata + suffix APPENDEADO — caso real) ---
console.log("[2/2] approve(spender, 0) en cUSD con tag appendeado…");
const erc20 = parseAbi(["function approve(address spender, uint256 amount) returns (bool)"]);
const encoded = encodeFunctionData({ abi: erc20, functionName: "approve", args: [account.address, 0n] });
const tx2 = await walletClient.sendTransaction({ to: CUSD_SEPOLIA, data: concat([encoded, suffix]) });
await publicClient.waitForTransactionReceipt({ hash: tx2 });
console.log(`  tx: https://celo-sepolia.blockscout.com/tx/${tx2}`);

// --- 3. verificación con el SDK (lo que haría un indexador/el Dune) ---
console.log("\nverificando decode on-chain con verifyTx()…");
for (const [label, hash] of [["transfer", tx1], ["contract-call", tx2]] as const) {
  const decoded = await verifyTx({ client: publicClient, hash });
  console.log(`  ${label}: ${decoded ? "✅ tag decodificado = " + JSON.stringify(decoded) : "❌ NO se pudo decodificar"}`);
}
console.log("\nSi ambos ✅ → writeTagged del rebalancer es correcto. Listo para mainnet.");
