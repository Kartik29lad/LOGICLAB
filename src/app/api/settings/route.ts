import { NextResponse, type NextRequest } from "next/server";

import {
  readFiniteNumber,
  readJsonObject,
  readString,
} from "../../../server/api/request-validation";
import { getSessionUserId } from "../../../server/auth/session";
import { executeQuery } from "../../../server/database/connection";
import { assertSameOriginMutation } from "../../../server/security/csrf";
import { assertAllowedFields, readStrictBoolean } from "../../../server/security/input";

const DEFAULTS = {
  Theme: "SYSTEM",
  Language: "en",
  DefaultPlaybackSpeed: 1,
  AutoPlay: false,
  ReducedMotion: false,
  SoundEnabled: true,
};

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { authenticated: false, ...DEFAULTS },
      { headers: { "cache-control": "private, no-store" } }
    );
  }
  const rows = await executeQuery<Record<string, unknown>>(
    `SELECT Theme, Language, DefaultPlaybackSpeed, AutoPlay, ReducedMotion, SoundEnabled FROM dbo.UserSettings WHERE UserId=@userId`,
    { userId }
  );
  return NextResponse.json(
    { authenticated: true, ...(rows[0] ?? DEFAULTS) },
    { headers: { "cache-control": "private, no-store" } }
  );
}

export async function PUT(request: NextRequest) {
  assertSameOriginMutation(request);
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  try {
    const body = await readJsonObject(request);
    assertAllowedFields(body, [
      "theme",
      "language",
      "defaultPlaybackSpeed",
      "autoPlay",
      "reducedMotion",
      "soundEnabled",
    ]);
    const theme = readString(body, "theme", { maxLength: 10 }) ?? "SYSTEM";
    if (!["LIGHT", "DARK", "SYSTEM"].includes(theme)) throw new Error("Invalid theme.");
    const language = readString(body, "language", { maxLength: 10 }) ?? "en";
    const speed = readFiniteNumber(body, "defaultPlaybackSpeed", {
      min: 0.25,
      max: 4,
      required: true,
    })!;
    const autoPlay = readStrictBoolean(body, "autoPlay", false);
    const reducedMotion = readStrictBoolean(body, "reducedMotion", false);
    const sound = readStrictBoolean(body, "soundEnabled", true);
    await executeQuery(
      `MERGE dbo.UserSettings AS target USING (SELECT @userId UserId) source ON target.UserId=source.UserId WHEN MATCHED THEN UPDATE SET Theme=@theme, Language=@language, DefaultPlaybackSpeed=@speed, AutoPlay=@autoPlay, ReducedMotion=@reducedMotion, SoundEnabled=@sound, UpdatedAt=SYSUTCDATETIME() WHEN NOT MATCHED THEN INSERT(UserId,Theme,Language,DefaultPlaybackSpeed,AutoPlay,ReducedMotion,SoundEnabled) VALUES(@userId,@theme,@language,@speed,@autoPlay,@reducedMotion,@sound);`,
      { userId, theme, language, speed, autoPlay, reducedMotion, sound }
    );
    return NextResponse.json({ ok: true }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_SETTINGS",
          message: error instanceof Error ? error.message : "Unable to update settings.",
        },
      },
      { status: 400 }
    );
  }
}
