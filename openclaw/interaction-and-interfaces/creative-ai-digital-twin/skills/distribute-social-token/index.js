#!/usr/bin/env node

/**
 * distribute-social-token skill
 *
 * Sends ERC-20 social tokens from the agent's wallet to a recipient address
 * on Base network.
 *
 * Usage:
 *   node index.js --recipient 0x... --amount 100
 *   node index.js --recipient 0x... --amount 50 --token-address 0x...
 *
 * Environment:
 *   PRIVATE_KEY   - EVM private key for the agent's dedicated wallet
 *   BASE_RPC_URL        - RPC endpoint for Base network
 *   SOCIAL_TOKEN_ADDRESS - Default ERC-20 token contract address (optional if --token-address provided)
 */

import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
      recipient: { type: "string" },
      amount: { type: "string" },
      "token-address": { type: "string" },
    },
  });

  const recipient = values.recipient;
  const amount = values.amount;
  const tokenAddress = values["token-address"] || process.env.SOCIAL_TOKEN_ADDRESS;

  // Validate inputs
  if (!recipient || !recipient.startsWith("0x")) {
    fatal("--recipient is required and must be a valid Ethereum address (0x...).");
  }
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    fatal("--amount is required and must be a positive number.");
  }
  if (!tokenAddress || !tokenAddress.startsWith("0x")) {
    fatal(
      "Token address is required. Provide --token-address or set SOCIAL_TOKEN_ADDRESS in your Pinata dashboard."
    );
  }

  // Check secrets
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) fatal("PRIVATE_KEY not configured. Add it in your Pinata dashboard.");

  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) fatal("BASE_RPC_URL not configured. Add it in your Pinata dashboard.");

  // Load ABI
  const abiPath = join(__dirname, "..", "..", "abi", "ERC20.json");
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
  const ethBalance = await provider.getBalance(wallet.address);
  if (ethBalance === 0n) {
    fatal(
      `Agent wallet ${wallet.address} has 0 ETH on Base. ` +
      "Fund it with a small amount of ETH for gas fees."
    );
  }

  // Connect to token contract
  const token = new ethers.Contract(tokenAddress, abi, wallet);

  // Get token decimals and parse amount
  let decimals;
  try {
    decimals = await token.decimals();
  } catch (err) {
    fatal(`Failed to read token decimals at ${tokenAddress}: ${err.message}`);
  }

  const parsedAmount = ethers.parseUnits(amount, decimals);

  // Check token balance
  const tokenBalance = await token.balanceOf(wallet.address);
  if (tokenBalance < parsedAmount) {
    fatal(
      `Insufficient token balance. Wallet has ${ethers.formatUnits(tokenBalance, decimals)} tokens, ` +
      `but ${amount} requested.`
    );
  }

  // Execute transfer
  let tx;
  try {
    tx = await token.transfer(recipient, parsedAmount);
  } catch (err) {
    const reason = err.reason || err.message;
    fatal(`Transfer failed: ${reason}`);
  }

  // Wait for confirmation
  const receipt = await tx.wait(1);

  result({
    success: true,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    recipient,
    amount,
    tokenAddress,
    agentWallet: wallet.address,
  });
}

main().catch((err) => fatal(err.message));
