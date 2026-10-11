import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteBookmark,
  recordActivity,
  recordHistory,
} from "../../../../src/server/repositories/activity/activity-repository";
import { findExperiment } from "../../../../src/server/repositories/experiments/experiment-repository";

const { executeQuery } = vi.hoisted(() => ({ executeQuery: vi.fn() }));
vi.mock("../../../../src/server/database/connection", () => ({ executeQuery }));

beforeEach(() => executeQuery.mockReset());

describe("Phase 20 ownership enforcement", () => {
  it("scopes experiment reads by authenticated user", async () => {
    executeQuery.mockResolvedValueOnce([]);
    await expect(findExperiment("user-a", "experiment-b")).resolves.toBeNull();
    expect(executeQuery).toHaveBeenCalledWith(expect.stringContaining("UserId=@userId"), {
      userId: "user-a",
      experimentId: "experiment-b",
    });
  });

  it("scopes bookmark deletion by authenticated user", async () => {
    executeQuery.mockResolvedValueOnce([]);
    await deleteBookmark("user-a", "bookmark-b");
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining("BookmarkId=@bookmarkId AND UserId=@userId"),
      { bookmarkId: "bookmark-b", userId: "user-a" }
    );
  });

  it("rejects history entries that reference another user's experiment", async () => {
    executeQuery.mockResolvedValueOnce([]);
    await expect(
      recordHistory("user-a", { actionType: "OPEN", experimentId: "experiment-b" })
    ).rejects.toThrow("Experiment not found");
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining("ExperimentId=@id AND UserId=@userId"),
      { id: "experiment-b", userId: "user-a" }
    );
  });

  it("rejects activity entries that reference another user's comparison", async () => {
    executeQuery.mockResolvedValueOnce([]);
    await expect(
      recordActivity("user-a", { activityType: "OPEN", comparisonId: "comparison-b" })
    ).rejects.toThrow("Comparison not found");
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining("ComparisonId=@id AND UserId=@userId"),
      { id: "comparison-b", userId: "user-a" }
    );
  });
});
