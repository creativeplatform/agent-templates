#!/usr/bin/env node
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = { to: [], subject: "", file: null, text: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--to" && argv[i + 1]) {
      out.to.push(argv[++i]);
      continue;
    }
    if (a === "--subject" && argv[i + 1]) {
      out.subject = argv[++i];
      continue;
    }
    if (a === "--file" && argv[i + 1]) {
      out.file = argv[++i];
      continue;
    }
    if (a === "--text" && argv[i + 1]) {
      out.text = argv[++i];
      continue;
    }
  }
  return out;
}

async function readBody({ file, text }) {
  if (text != null) return text;
  if (file) {
    const abs = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
    return fs.readFileSync(abs, "utf8");
  }
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

const { to, subject, file, text } = parseArgs(process.argv);

if (!to.length) {
  console.error("send.mjs: need at least one --to address");
  process.exit(1);
}
if (!subject) {
  console.error("send.mjs: need --subject");
  process.exit(1);
}

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const secure =
  process.env.SMTP_SECURE === "1" ||
  process.env.SMTP_SECURE === "true" ||
  process.env.SMTP_SECURE === "yes";
const from = process.env.EMAIL_FROM;
const replyTo = process.env.EMAIL_REPLY_TO;

if (!host || !port || !user || pass === undefined || !from) {
  console.error(
    "send.mjs: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM"
  );
  process.exit(1);
}

const body =
  process.env.EMAIL_BODY !== undefined
    ? process.env.EMAIL_BODY
    : await readBody({ file, text });

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
});

const info = await transporter.sendMail({
  from,
  to: to.join(", "),
  subject,
  text: body,
  ...(replyTo ? { replyTo } : {}),
});

console.log(JSON.stringify({ messageId: info.messageId, accepted: info.accepted }));
