/**
 * Socket.io origin allowlist.
 *
 * A bare string allowlist silently fails for socket.io, and "allow everything" hands any
 * website a websocket to our auction plane. The rules are explicit and testable:
 *  · non-browser clients (no Origin header) are allowed — server-to-server smoke checks
 *  · configured origins always pass
 *  · sandbox live-preview hosts (*.e2b.app) pass so the in-editor preview works
 *  · localhost/127.0.0.1 on any port passes for local development
 */
export function createOriginChecker(allowed: string[]) {
  return (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
    try {
      if (!origin) return cb(null, true);
      const { hostname } = new URL(origin);
      const allow =
        allowed.includes(origin) ||
        hostname.endsWith(".e2b.app") ||
        hostname === "localhost" ||
        hostname === "127.0.0.1";
      cb(null, allow);
    } catch {
      cb(null, false);
    }
  };
}
