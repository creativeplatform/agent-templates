#!/usr/bin/env node

/**
 * create-reality-market skill
 *
 * Creates a binary (yes/no) prediction market on reality.eth deployed on Base.
 * The agent can later act as the initial reporter to resolve the market.
 *
 * Usage:
 *   node index.js --question "Will the streamer beat this level on the next try?" --timeout 86400 --bounty 0.01
 *   node index.js --question "..." --timeout 3600 --bounty 0.005 --arbitrator 0x...
 *
 * Environment:
 *   PRIVATE_KEY  - EVM private key for the agent's dedicated wallet
 *   BASE_RPC_URL       - RPC endpoint for Base network
 *   REALITY_ETH_ADDRESS - reality.eth contract address on Base
 */

import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// reality.eth binary template ID (yes/no questions)
const BINARY_TEMPLATE_ID = 2;

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
      question: { type: "string" },
      timeout: { type: "string" },
      bounty: { type: "string" },
      arbitrator: { type: "string", default: "" },
    },
  });

  const question = values.question;
  const timeout = Math.round(Number(values.timeout));
  const bounty = values.bounty;
  const arbitrator = values.arbitrator;

  // Validate inputs
  if (!question || question.trim().length === 0) {
    fatal("--question is required. Provide a clear binary (yes/no) question.");
  }
  if (isNaN(timeout) || timeout < 30) {
    fatal("--timeout is required and must be at least 30 seconds.");
  }
  if (!bounty || isNaN(Number(bounty)) || Number(bounty) <= 0) {
    fatal("--bounty is required and must be a positive ETH amount.");
  }

  // Check secrets
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) fatal("PRIVATE_KEY not configured. Add it in your Pinata dashboard.");

  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) fatal("BASE_RPC_URL not configured. Add it in your Pinata dashboard.");

  const contractAddress = process.env.REALITY_ETH_ADDRESS;
  if (!contractAddress || !contractAddress.startsWith("0x")) {
    fatal(
      "REALITY_ETH_ADDRESS not configured. Add the reality.eth contract address for Base in your Pinata dashboard."
    );
  }

  // Load ABI
  const abiPath = join(__dirname, "..", "..", "abi", "RealityETH.json");
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

  // Parse bounty and check ETH balance
  const bountyWei = ethers.parseEther(bounty);
  const ethBalance = await provider.getBalance(wallet.address);

  if (ethBalance < bountyWei) {
    fatal(
      `Insufficient ETH for bounty. Wallet has ${ethers.formatEther(ethBalance)} ETH, ` +
      `but ${bounty} ETH bounty requested (plus gas). Consider running swap-usdc-eth first.`
    );
  }

  // Connect to reality.eth contract
  const realityEth = new ethers.Contract(contractAddress, abi, wallet);

  // Use agent's own address as arbitrator if none specified
  const resolvedArbitrator = arbitrator && arbitrator.startsWith("0x")
    ? arbitrator
    : wallet.address;

  // Generate a unique nonce
  const nonce = BigInt(Date.now());

  // Opening timestamp: now (question is immediately open for answers)
  const openingTs = Math.floor(Date.now() / 1000);

  // Execute askQuestion
  let tx;
  try {
    tx = await realityEth.askQuestion(
      BINARY_TEMPLATE_ID,
      question,
      resolvedArbitrator,
      timeout,
      openingTs,
      nonce,
      { value: bountyWei }
    );
  } catch (err) {
    fatal(`Market creation failed: ${err.reason || err.message}`);
  }

  // Wait for confirmation
  const receipt = await tx.wait(1);

  // Extract question ID from logs by matching the reality.eth contract address
  let questionId = null;
  if (receipt.logs && receipt.logs.length > 0) {
    const log = receipt.logs.find(
      (l) => l.address.toLowerCase() === contractAddress.toLowerCase()
    );
    questionId = log?.topics?.[1] || null;
  }

  result({
    success: true,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    questionId,
    question,
    timeout,
    bounty,
    arbitrator: resolvedArbitrator,
    contractAddress,
    agentWallet: wallet.address,
  });
}

main().catch((err) => fatal(err.message));
