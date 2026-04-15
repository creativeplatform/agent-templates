#!/usr/bin/env node

/**
 * mint-metoken skill
 *
 * Mints new MeTokens by depositing DAI into the bonding curve contract on Base.
 * The agent deposits the specified amount of DAI as reserve, and the bonding
 * curve mints fresh MeTokens to the agent's wallet.
 *
 * Usage:
 *   node index.js --amount-dai 5
 *   node index.js --amount-dai 10
 *
 * Environment:
 *   AGENT_PRIVATE_KEY - EVM private key for the agent's dedicated wallet
 *   BASE_RPC_URL      - RPC endpoint for Base network
 *   METOKEN_ADDRESS   - The creator's MeToken bonding curve contract on Base
 */

import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// DAI on Base
const DAI_ADDRESS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
const DAI_DECIMALS = 18;

// Maximum DAI per mint without explicit operator confirmation
const MAX_DAI_PER_MINT = 10;

// Minimal ABI for the MeToken bonding curve mint function
const METOKEN_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "_reserveAmount", type: "uint256" }
    ],
    name: "mint",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
];

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
      "amount-dai": { type: "string" },
    },
  });

  const amountDai = values["amount-dai"];

  // Validate inputs
  if (!amountDai || isNaN(Number(amountDai)) || Number(amountDai) <= 0) {
    fatal("--amount-dai is required and must be a positive number.");
  }
  if (Number(amountDai) > MAX_DAI_PER_MINT) {
    fatal(
      `Cannot mint with more than ${MAX_DAI_PER_MINT} DAI per transaction without explicit operator confirmation. ` +
      `Requested: ${amountDai} DAI.`
    );
  }

  // Check secrets
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) fatal("AGENT_PRIVATE_KEY not configured. Add it in your Pinata dashboard.");

  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) fatal("BASE_RPC_URL not configured. Add it in your Pinata dashboard.");

  const meTokenAddress = process.env.METOKEN_ADDRESS;
  if (!meTokenAddress || !meTokenAddress.startsWith("0x")) {
    fatal(
      "METOKEN_ADDRESS not configured. Add the creator's MeToken contract address for Base in your Pinata dashboard."
    );
  }

  // Load ERC-20 ABI for DAI interactions
  const erc20AbiPath = join(__dirname, "..", "..", "abi", "ERC20.json");
  let erc20Abi;
  try {
    erc20Abi = JSON.parse(await readFile(erc20AbiPath, "utf-8"));
  } catch (err) {
    fatal(`Failed to load ERC-20 ABI from ${erc20AbiPath}: ${err.message}`);
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

  // Connect to DAI contract
  const dai = new ethers.Contract(DAI_ADDRESS, erc20Abi, wallet);

  // Parse DAI amount
  const parsedAmount = ethers.parseUnits(amountDai, DAI_DECIMALS);

  // Check DAI balance
  const daiBalance = await dai.balanceOf(wallet.address);
  if (daiBalance < parsedAmount) {
    fatal(
      `Insufficient DAI balance. Wallet has ${ethers.formatUnits(daiBalance, DAI_DECIMALS)} DAI, ` +
      `but ${amountDai} DAI requested for minting.`
    );
  }

  // Approve MeToken contract to spend DAI
  const currentAllowance = await dai.allowance(wallet.address, meTokenAddress);
  if (currentAllowance < parsedAmount) {
    try {
      const approveTx = await dai.approve(meTokenAddress, parsedAmount);
      await approveTx.wait(1);
    } catch (err) {
      fatal(`DAI approval failed: ${err.reason || err.message}`);
    }
  }

  // Connect to MeToken bonding curve contract
  const meToken = new ethers.Contract(meTokenAddress, METOKEN_ABI, wallet);

  // Execute mint
  let tx;
  try {
    tx = await meToken.mint(parsedAmount);
  } catch (err) {
    fatal(`MeToken mint failed: ${err.reason || err.message}`);
  }

  // Wait for confirmation
  const receipt = await tx.wait(1);

  result({
    success: true,
    action: "mint_metoken",
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    daiSpent: amountDai,
    meTokenAddress,
    agentWallet: wallet.address,
  });
}

main().catch((err) => fatal(err.message));
