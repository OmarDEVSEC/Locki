import tls from "node:tls";
import type { SecurityResult, SecuritySignals, TlsInfo } from "@/lib/types";

const EXPOSED_PATHS = ["/.env", "/.git/HEAD"];
const FETCH_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}

function getTlsInfo(hostname: string): Promise<TlsInfo> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, timeout: FETCH_TIMEOUT_MS },
      () => {
        const cert = socket.getPeerCertificate();
        resolve({
          valid: socket.authorized,
          protocol: socket.getProtocol() ?? undefined,
          cipher: socket.getCipher()?.standardName,
          issuer: [cert?.issuer?.O, cert?.issuer?.CN]
            .flat()
            .find((v): v is string => typeof v === "string"),
        });
        socket.end();
      },
    );
    socket.on("error", () => resolve({ valid: false }));
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ valid: false });
    });
  });
}

async function checkExposedPaths(origin: string): Promise<string[]> {
  const found: string[] = [];
  await Promise.all(
    EXPOSED_PATHS.map(async (path) => {
      try {
        const res = await withTimeout(
          fetch(origin + path, { redirect: "manual" }),
          FETCH_TIMEOUT_MS,
        );
        if (res.status === 200) found.push(path);
      } catch {
        // unreachable path counts as "not exposed", not as a signal either way
      }
    }),
  );
  return found;
}

export async function scoreSecurity(rawUrl: string): Promise<SecurityResult> {
  const url = new URL(rawUrl);
  const https = url.protocol === "https:";

  try {
    const res = await withTimeout(
      fetch(url.origin, { redirect: "follow" }),
      FETCH_TIMEOUT_MS,
    );
    const headers = res.headers;
    const setCookies =
      typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
    const cookiesSecure =
      setCookies.length === 0 ||
      setCookies.every(
        (c) =>
          /secure/i.test(c) && /httponly/i.test(c) && /samesite/i.test(c),
      );

    const [tlsInfo, exposedPaths] = await Promise.all([
      https ? getTlsInfo(url.hostname) : Promise.resolve({ valid: false }),
      checkExposedPaths(url.origin),
    ]);

    const signals: SecuritySignals = {
      https,
      tls: tlsInfo,
      hasCSP: headers.has("content-security-policy"),
      hasHSTS: headers.has("strict-transport-security"),
      hasXFrameOptions: headers.has("x-frame-options"),
      hasXContentTypeOptions: headers.has("x-content-type-options"),
      cookiesSecure,
      exposedPaths,
    };

    let score = 100;
    if (!signals.https) score -= 40;
    if (!signals.hasCSP) score -= 10;
    if (!signals.cookiesSecure) score -= 10;
    if (signals.exposedPaths.length > 0) score -= 30;

    return { score: Math.max(0, score), signals };
  } catch (err) {
    return {
      score: 0,
      signals: {
        https,
        tls: { valid: false },
        hasCSP: false,
        hasHSTS: false,
        hasXFrameOptions: false,
        hasXContentTypeOptions: false,
        cookiesSecure: false,
        exposedPaths: [],
      },
      error: err instanceof Error ? err.message : "site unreachable",
    };
  }
}
