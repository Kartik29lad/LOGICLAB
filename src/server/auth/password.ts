import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const N = 16384;
const r = 8;
const p = 1;
const KEY_LENGTH = 64;

function scrypt(
  password: string,
  salt: string,
  keylen: number,
  options: { N?: number; r?: number; p?: number }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, nRaw, rRaw, pRaw, salt, expectedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !nRaw || !rRaw || !pRaw || !salt || !expectedHex) return false;
  const n = Number(nRaw);
  const blockR = Number(rRaw);
  const blockP = Number(pRaw);
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(blockR) || !Number.isSafeInteger(blockP))
    return false;
  if (n < 16384 || n > 65536 || blockR < 8 || blockR > 32 || blockP < 1 || blockP > 4) return false;
  if (!/^[0-9a-f]{32}$/i.test(salt) || !/^[0-9a-f]+$/i.test(expectedHex)) return false;
  if (expectedHex.length !== KEY_LENGTH * 2) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const derived = await scrypt(password, salt, expected.length, {
    N: n,
    r: blockR,
    p: blockP,
  });
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
