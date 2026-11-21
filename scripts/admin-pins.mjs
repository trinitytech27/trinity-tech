/**
 * Create the ADMIN_PIN_VERIFIERS value for the three named admins.
 *
 *   PIN_SANJU=xxxx PIN_MADDY=xxxx PIN_JOSE=xxxx node scripts/admin-pins.mjs [--write]
 *
 * Prints ADMIN_PIN_VERIFIERS=... (salted scrypt verifiers, never the codes).
 * With --write it also updates .env.local (git-ignored). Put the same value in
 * your hosting provider's environment variables (e.g. Vercel → Settings →
 * Environment Variables) — never commit it, the repository is public.
 */
import fs from "node:fs";
import process from "node:process";
import { createPinVerifier } from "../server/security.mjs";

const admins = { sanju: "PIN_SANJU", maddy: "PIN_MADDY", jose: "PIN_JOSE" };
const out = {};
for (const [id, key] of Object.entries(admins)) {
  const pin = process.env[key];
  if (!pin || !/^\d{4,12}$/.test(pin)) {
    console.error(`Missing or invalid ${key} (4–12 digits).`);
    process.exit(1);
  }
  out[id] = createPinVerifier(pin);
}
const line = "ADMIN_PIN_VERIFIERS=" + JSON.stringify(out);

if (process.argv.includes("--write")) {
  const file = ".env.local";
  const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const kept = prev
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("ADMIN_PIN_VERIFIERS="));
  fs.writeFileSync(file, [...kept, line].join("\n") + "\n");
  console.log("Updated .env.local with ADMIN_PIN_VERIFIERS for: " + Object.keys(out).join(", "));
} else {
  console.log(line);
}
