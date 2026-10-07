import { describe, expect, it } from "vitest";

import { GET as liveHandler } from "../../src/app/live/route";

describe("Phase 4: Health Probes", () => {
  it("returns 200 OK with alive status for /live probe", async () => {
    const response = liveHandler();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.status).toBe("alive");
    expect(json.timestamp).toBeDefined();
  });
});
