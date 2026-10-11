import { AuthorizationError, ValidationError } from "../../../errors";
import { getSessionUserId } from "../../auth/session";
import * as repository from "../../repositories/activity/activity-repository";

export async function requireActivityUser() {
  const userId = await getSessionUserId();
  if (!userId) throw new AuthorizationError("Authentication required.");
  return userId;
}

export async function favorites(userId: string) {
  return repository.listFavorites(userId);
}
export async function favorite(userId: string, slug: string, value: boolean) {
  if (!slug.trim()) throw new ValidationError("Content slug is required.");
  return repository.setFavorite(userId, slug.trim(), value);
}
export async function bookmarks(userId: string) {
  return repository.listBookmarks(userId);
}
export async function addBookmark(
  userId: string,
  input: Parameters<typeof repository.createBookmark>[1]
) {
  return repository.createBookmark(userId, input);
}
export async function removeBookmark(userId: string, bookmarkId: string) {
  return repository.deleteBookmark(userId, bookmarkId);
}
export async function history(userId: string, limit?: number) {
  return repository.listHistory(userId, limit);
}
export async function activitySummary(userId: string, days?: number) {
  return repository.getActivitySummary(userId, days);
}
export async function logHistory(
  userId: string,
  input: repository.HistoryInput & { contentSlug?: string }
) {
  if (input.contentSlug && !input.contentItemId) {
    const content = await repository.resolveContentItem(input.contentSlug);
    if (!content) throw new ValidationError("Content not found.");
    input = {
      ...input,
      contentItemId: content.ContentItemId,
      contentVersionId: input.contentVersionId ?? content.ContentVersionId,
    };
  }
  return repository.recordHistory(userId, input);
}
export async function logActivity(
  userId: string,
  input: repository.ActivityInput & { contentSlug?: string }
) {
  if (input.contentSlug && !input.contentItemId) {
    const content = await repository.resolveContentItem(input.contentSlug);
    if (!content) throw new ValidationError("Content not found.");
    input = { ...input, contentItemId: content.ContentItemId };
  }
  return repository.recordActivity(userId, input);
}
