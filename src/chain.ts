import {
  createPublicClient,
  createWalletClient,
  http,
  encodeFunctionData,
  concat,
  type Address,
  type Abi,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { toDataSuffix } from "@celo/attribution-tags";
import { config } from "./config.js";

export const publicClient = createPublicClient({
  chain: celo,
  transport: http(config.rpcUrl),
});

export const account = config.signerPrivateKey
  ? privateKeyToAccount(config.signerPrivateKey)
  : null;

export const walletClient = account
  ? createWalletClient({ account, chain: celo, transport: http(config.rpcUrl) })
  : null;

/** Sufijo ERC-8021: solo el tag asignado por celobuilders cuenta en el leaderboard. */
export function attributionSuffix(): Hex | null {
  if (!config.attributionTag) return null;
  return toDataSuffix(config.attributionTag) as Hex;
}

export type TaggedCall = {
  to: Address;
  abi: Abi;
  functionName: string;
  args: readonly unknown[];
};

/**
 * Ejecuta una llamada a contrato con el attribution tag APPENDEADO al calldata
 * (ERC-8021). Clave: se concatena al final del calldata codificado — asignar
 * `data = suffix` a secas solo funciona en transferencias vacías.
 */
export async function writeTagged(call: TaggedCall): Promise<Hex> {
  if (!walletClient || !account) throw new Error("Sin SIGNER_PRIVATE_KEY: no se puede firmar.");
  const encoded = encodeFunctionData({
    abi: call.abi,
    functionName: call.functionName,
    args: call.args as unknown[],
  });
  const suffix = attributionSuffix();
  const data = suffix ? concat([encoded, suffix]) : encoded;

  // simulate primero: si revierte, mejor saberlo antes de firmar
  await publicClient.call({ account: account.address, to: call.to, data });

  const hash = await walletClient.sendTransaction({ to: call.to, data });
  await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  return hash;
}
