import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const workerSource = String.raw`
(() => {
  const safeSend = self.postMessage.bind(self);
  const blockedGlobals = [
    "fetch", "XMLHttpRequest", "WebSocket", "EventSource", "WebTransport",
    "importScripts", "Worker", "SharedWorker", "BroadcastChannel", "MessageChannel",
    "indexedDB", "caches", "setTimeout", "setInterval", "clearTimeout", "clearInterval",
  ];

  for (const name of blockedGlobals) {
    try {
      Object.defineProperty(self, name, {
        value: undefined,
        writable: false,
        configurable: false,
      });
    } catch {
      // Some browser globals are non-configurable; CSP remains the network boundary.
    }
  }

  function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === "object") {
      const output = {};
      for (const key of Object.keys(value).sort()) output[key] = stable(value[key]);
      return output;
    }
    return value;
  }

  function equal(left, right) {
    try {
      return JSON.stringify(stable(left)) === JSON.stringify(stable(right));
    } catch {
      return false;
    }
  }

  // This learning runner accepts JavaScript plus basic TypeScript function
  // annotations (primitive parameters/return types and primitive arrays).
  // It intentionally does not claim to transpile the full TypeScript language.
  function eraseSupportedTypeAnnotations(source) {
    return source.replace(
      /(function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*)\(([^)]*)\)(?:\s*:\s*(?:number\[\]|string\[\]|boolean\[\]|number|string|boolean|void|any|unknown))?\s*\{/g,
      (_match, declaration, rawParameters) => {
        const parameters = rawParameters.replace(
          /([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*(?:number\[\]|string\[\]|boolean\[\]|number|string|boolean|any|unknown)/g,
          "$1",
        );
        return declaration + "(" + parameters + ") {";
      },
    );
  }

  self.onmessage = (event) => {
    const request = event.data;
    if (!request || typeof request.requestId !== "string") return;
    const { requestId, source, functionName, tests } = request;
    const startedAt = performance.now();

    try {
      if (typeof source !== "string" || source.length > 20000) throw new Error("Invalid solution source.");
      if (typeof functionName !== "string" || !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(functionName)) {
        throw new Error("Invalid solution function name.");
      }
      if (!Array.isArray(tests) || tests.length < 1 || tests.length > 10) {
        throw new Error("Invalid test suite.");
      }

      // The worker has no DOM. Its response CSP disables network access and imports;
      // the parent also terminates the worker after a strict time limit.
      const executableSource = eraseSupportedTypeAnnotations(source);
      const factory = new Function(
        '"use strict";\n' + executableSource + '\n; return typeof ' + functionName + ' === "function" ? ' + functionName + ' : null;'
      );
      const solver = factory();
      if (typeof solver !== "function") throw new Error("Define a function named " + functionName + " to run this challenge.");

      const results = [];
      for (const test of tests) {
        const testStartedAt = performance.now();
        try {
          const actual = solver(...test.args);
          if (actual && typeof actual.then === "function") {
            throw new Error("Async solutions are not supported in this challenge runner.");
          }
          const passed = equal(actual, test.expected);
          results.push({
            id: test.id,
            label: test.label,
            passed,
            expected: test.expected,
            actual,
            durationMs: Math.max(0, Math.round(performance.now() - testStartedAt)),
          });
        } catch (error) {
          results.push({
            id: test.id,
            label: test.label,
            passed: false,
            expected: test.expected,
            actual: null,
            durationMs: Math.max(0, Math.round(performance.now() - testStartedAt)),
            error: error instanceof Error ? error.message : "Test execution failed.",
          });
        }
      }

      safeSend({
        requestId,
        ok: true,
        durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
        tests: results,
      });
    } catch (error) {
      safeSend({
        requestId,
        ok: false,
        error: error instanceof Error ? error.message : "Unable to execute this solution.",
      });
    }
  };
})();
`;

export function GET() {
  const response = new NextResponse(workerSource, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Content-Security-Policy": [
        "default-src 'none'",
        "script-src 'unsafe-eval'",
        "connect-src 'none'",
        "worker-src 'none'",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
      ].join("; "),
    },
  });
  return response;
}
