#!/usr/bin/env node

/**
 * swap-usdc-eth skill
 *
 * Swaps USDC for ETH on Uniswap V3 (Base network) using the agent's wallet.
 * Used to acquire ETH for gas fees or reality.eth market bounties.
 *
 * Usage:
 *   node index.js --amount-usdc 50
 *   node index.js --amount-usdc 100 --slippage 1.0
 *
 * Environment:
 *   PRIVATE_KEY - EVM private key for the agent's dedicated wallet
 *   BASE_RPC_URL      - RPC endpoint for Base network
 */

import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Base network contract addresses
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const SWAP_ROUTER_ADDRESS = "0x2626664c2603336E57B271c5C0b26F421741e481";
const QUOTER_ADDRESS = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";
const USDC_DECIMALS = 6;
const FEE_TIER = 500; // 0.05% pool

// Minimal Quoter V2 ABI for price quotes
const QUOTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
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
      "amount-usdc": { type: "string" },
      slippage: { type: "string", default: "0.5" },
    },
  });

  const amountUsdc = values["amount-usdc"];
  const slippagePct = Number(values.slippage);

  // Validate inputs
  if (!amountUsdc || isNaN(Number(amountUsdc)) || Number(amountUsdc) <= 0) {
    fatal("--amount-usdc is required and must be a positive number.");
  }
  if (isNaN(slippagePct) || slippagePct < 0 || slippagePct > 50) {
    fatal("--slippage must be between 0 and 50 (percent).");
  }

  // Check secrets
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) fatal("PRIVATE_KEY not configured. Add it in your Pinata dashboard.");

  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) fatal("BASE_RPC_URL not configured. Add it in your Pinata dashboard.");

  // Load ABIs
  const erc20AbiPath = join(__dirname, "..", "..", "abi", "ERC20.json");
  const swapRouterAbiPath = join(__dirname, "..", "..", "abi", "UniswapV3SwapRouter.json");

  let erc20Abi, swapRouterAbi;
  try {
    erc20Abi = JSON.parse(await readFile(erc20AbiPath, "utf-8"));
    swapRouterAbi = JSON.parse(await readFile(swapRouterAbiPath, "utf-8"));
  } catch (err) {
    fatal(`Failed to load ABIs: ${err.message}`);
  }

  // Connect to Base
  const { ethers } = await import("ethers");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Check USDC balance
  const usdc = new ethers.Contract(USDC_ADDRESS, erc20Abi, wallet);
  const amountIn = ethers.parseUnits(amountUsdc, USDC_DECIMALS);

  const usdcBalance = await usdc.balanceOf(wallet.address);
  if (usdcBalance < amountIn) {
    fatal(
      `Insufficient USDC balance. Wallet has ${ethers.formatUnits(usdcBalance, USDC_DECIMALS)} USDC, ` +
      `but ${amountUsdc} requested.`
    );
  }

  // Approve SwapRouter to spend USDC
  const currentAllowance = await usdc.allowance(wallet.address, SWAP_ROUTER_ADDRESS);
  if (currentAllowance < amountIn) {
    try {
      const approveTx = await usdc.approve(SWAP_ROUTER_ADDRESS, amountIn);
      await approveTx.wait(1);
    } catch (err) {
      fatal(`USDC approval failed: ${err.reason || err.message}`);
    }
  }

  // Get a price quote from the Uniswap V3 Quoter to calculate slippage-protected minimum output
  const quoter = new ethers.Contract(QUOTER_ADDRESS, QUOTER_ABI, provider);

  let expectedAmountOut;
  try {
    const quoteResult = await quoter.quoteExactInputSingle.staticCall({
      tokenIn: USDC_ADDRESS,
      tokenOut: WETH_ADDRESS,
      amountIn,
      fee: FEE_TIER,
      sqrtPriceLimitX96: 0n,
    });
    expectedAmountOut = quoteResult.amountOut;
  } catch (err) {
    fatal(`Failed to get price quote: ${err.reason || err.message}`);
  }

  // Apply slippage tolerance to the quoted output
  const slippageBps = BigInt(Math.floor(slippagePct * 100)); // e.g. 0.5% → 50 bps
  const amountOutMinimum = expectedAmountOut - (expectedAmountOut * slippageBps / 10000n);

  // Build swap params
  const swapRouter = new ethers.Contract(SWAP_ROUTER_ADDRESS, swapRouterAbi, wallet);

  const swapParams = {
    tokenIn: USDC_ADDRESS,
    tokenOut: WETH_ADDRESS,
    fee: FEE_TIER,
    recipient: wallet.address,
    amountIn,
    amountOutMinimum,
    sqrtPriceLimitX96: 0n,
  };

  // Execute swap
  let tx;
  try {
    tx = await swapRouter.exactInputSingle(swapParams);
  } catch (err) {
    fatal(`Swap transaction failed: ${err.reason || err.message}`);
  }

  // Wait for confirmation
  const receipt = await tx.wait(1);

  result({
    success: true,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    amountIn: amountUsdc,
    amountInToken: "USDC",
    amountOutToken: "WETH",
    slippage: slippagePct,
    agentWallet: wallet.address,
    swapRouter: SWAP_ROUTER_ADDRESS,
    feeTier: FEE_TIER,
  });
}

main().catch((err) => fatal(err.message));
