import { scryptSync } from "node:crypto";

import { hashPassword, verifyPassword } from "../../auth/password";
import { createSession } from "../../auth/session";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
} from "../../repositories/users/user-repository";

const DUMMY_PASSWORD_HASH = (() => {
  const salt = "6c6f6769636c61622d73616c742d7631";
  const derived = scryptSync("LogicLab-invalid-account-password", salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return `scrypt$16384$8$1$${salt}$${derived.toString("hex")}`;
})();

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function validUsername(value: string) {
  return /^[A-Za-z0-9_]{3,50}$/.test(value);
}

export async function register(input: { email: string; username: string; password: string }) {
  if (!validEmail(input.email) || !validUsername(input.username))
    throw new Error("Invalid account details.");
  if (input.password.length < 10 || input.password.length > 200)
    throw new Error("Password must be 10–200 characters.");
  if (await findUserByEmail(input.email))
    throw new Error("An account with this email already exists.");
  if (await findUserByUsername(input.username)) throw new Error("That username is already in use.");
  const user = await createUser({
    email: input.email.trim(),
    username: input.username.trim(),
    passwordHash: await hashPassword(input.password),
  });
  await createSession(user.id);
  return { id: user.id, email: user.email, username: user.username };
}

export async function login(input: { email: string; password: string }) {
  const user = await findUserByEmail(input.email.trim());
  const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordValid = await verifyPassword(input.password, passwordHash);
  if (!user || user.accountStatus !== "ACTIVE" || !passwordValid)
    throw new Error("Invalid email or password.");
  await createSession(user.id);
  return { id: user.id, email: user.email, username: user.username };
}
