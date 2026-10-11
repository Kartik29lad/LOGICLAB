import type { UserEntity } from "../../../contracts/repositories/user-repository.contract";
import { executeQuery } from "../../database/connection";

export interface StoredUser extends UserEntity {
  passwordHash: string;
  role: string;
  accountStatus: string;
}

function map(row: Record<string, unknown>): StoredUser {
  return {
    id: String(row.UserId),
    email: String(row.Email),
    username: String(row.Username),
    createdAt: new Date(String(row.CreatedAt)),
    updatedAt: new Date(String(row.UpdatedAt)),
    passwordHash: String(row.PasswordHash),
    role: String(row.Role),
    accountStatus: String(row.AccountStatus),
  };
}

export async function findUserByUsername(username: string): Promise<StoredUser | null> {
  const rows = await executeQuery<Record<string, unknown>>(
    `SELECT TOP 1 UserId, Email, Username, PasswordHash, Role, AccountStatus, CreatedAt, UpdatedAt FROM dbo.Users WHERE NormalizedUsername = UPPER(@username)`,
    { username }
  );
  return rows[0] ? map(rows[0]) : null;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const rows = await executeQuery<Record<string, unknown>>(
    `SELECT TOP 1 UserId, Email, Username, PasswordHash, Role, AccountStatus, CreatedAt, UpdatedAt FROM dbo.Users WHERE NormalizedEmail = UPPER(@email)`,
    { email }
  );
  return rows[0] ? map(rows[0]) : null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const rows = await executeQuery<Record<string, unknown>>(
    `SELECT TOP 1 UserId, Email, Username, PasswordHash, Role, AccountStatus, CreatedAt, UpdatedAt FROM dbo.Users WHERE UserId = @id`,
    { id }
  );
  return rows[0] ? map(rows[0]) : null;
}

export async function createUser(input: {
  email: string;
  username: string;
  passwordHash: string;
}): Promise<StoredUser> {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    INSERT INTO dbo.Users (Username, NormalizedUsername, Email, NormalizedEmail, PasswordHash)
    OUTPUT INSERTED.UserId, INSERTED.Email, INSERTED.Username, INSERTED.PasswordHash, INSERTED.Role, INSERTED.AccountStatus, INSERTED.CreatedAt, INSERTED.UpdatedAt
    VALUES (@username, UPPER(@username), @email, UPPER(@email), @passwordHash)`,
    input
  );
  if (!rows[0]) throw new Error("User creation failed.");
  return map(rows[0]);
}
