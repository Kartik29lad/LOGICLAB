import { AuthenticationError } from "../../../errors";
import { getSessionUserId } from "../../auth/session";

export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new AuthenticationError("Authentication required.");
  return userId;
}
