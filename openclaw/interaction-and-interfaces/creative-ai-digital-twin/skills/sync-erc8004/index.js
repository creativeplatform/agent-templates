#!/usr/bin/env node

/**
 * sync-erc8004 skill
 *
 * Registers a Digital Twin Agent's alignment score on the ERC-8004 smart contract
 * deployed on Base.
 *
 * Usage:
 *   node index.js --score 100 --rounds 15 --operator-address 0x...
 *
 * Environment:
 *   AGENT_PRIVATE_KEY - EVM private key for the agent's dedicated wallet
 *   BASE_RPC_URL      - RPC endpoint for Base network
 */

import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Placeholder — update when the ERC-8004 registry is deployed on Base
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

const __dirname = dirname(fileURLToPath(import.meta.url));

function result(data) {
  process.stdout.write(JSON.stringify(data) + "\n");
}

function fatal(error) {
  result({ success: false, error });
  process.exit(1);
}

async function main() {
  const { values } = parseArgs({
    options: {
      score: { type: "string" },
      rounds: { type: "string" },
      "operator-address": { type: "string" },
      "metadata-uri": { type: "string", default: "" },
    },
  });

  const score = Number(values.score);
  const rounds = Number(values.rounds);
  const operatorAddress = values["operator-address"];
  const metadataUri = values["metadata-uri"];

  // Validate inputs
  if (score !== 100) fatal("Coherence score must be exactly 100 for on-chain registration.");
  if (rounds < 10) fatal("Minimum 10 prediction rounds required for registration.");
  if (!operatorAddress || !operatorAddress.startsWith("0x")) {
    fatal("--operator-address is required and must be a valid Ethereum address.");
  }

  // Check contract address
  if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    fatal(
      "ERC-8004 registry contract has not been deployed yet. " +
      "Update CONTRACT_ADDRESS in skills/sync-erc8004/index.js when the contract is live on Base."
    );
  }

  // Check secrets
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) fatal("AGENT_PRIVATE_KEY not configured. Add it in your Pinata dashboard.");

  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) fatal("BASE_RPC_URL not configured. Add it in your Pinata dashboard.");

  // Load ABI
  const abiPath = join(__dirname, "..", "..", "abi", "ERC8004Registry.json");
  let abi;
  try {
    const abiJson = await readFile(abiPath, "utf-8");
    abi = JSON.parse(abiJson);
  } catch (err) {
    fatal(`Failed to load ABI from ${abiPath}: ${err.message}`);
  }

  // Connect to Base
  const { ethers } = await import("ethers");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Verify agent wallet has ETH for gas
  const balance = await provider.getBalance(wallet.address);
  if (balance === 0n) {
    fatal(
      `Agent wallet ${wallet.address} has 0 ETH on Base. ` +
      "Fund it with a small amount of ETH for gas fees."
    );
  }

  // Connect to contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  // Execute registration
  let tx;
  try {
    tx = await contract.registerAlignment(
      operatorAddress,
      score,
      rounds,
      metadataUri
    );
  } catch (err) {
    const reason = err.reason || err.message;
    fatal(`Transaction failed: ${reason}`);
  }

  // Wait for confirmation
  const receipt = await tx.wait(1);

  result({
    success: true,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    contractAddress: CONTRACT_ADDRESS,
    agentWallet: wallet.address,
    operatorAddress,
    coherenceScore: score,
    totalRounds: rounds,
  });
}

main().catch((err) => fatal(err.message));
