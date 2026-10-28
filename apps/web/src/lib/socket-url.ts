/**
 * Browser-side socket URL. Never hardcodes localhost: the sandbox preview serves each
 * port on its own host, so we derive the realtime host from the page's own origin
 * (swap the port) unless NEXT_PUBLIC_SOCKET_URL is explicitly configured.
 */
export function resolveSocketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicit) return explicit;
  if (typeof window === "undefined") return "http://localhost:3001";
  const { hostname, protocol } = window.location;
  const portMatch = hostname.match(/^(\d+)-(.+)$/); // "{port}-{sandboxId}.e2b.app"
  if (portMatch) {
    const [, , rest] = portMatch;
    return `${protocol}//3001-${rest}`;
  }
  return `${protocol}//${hostname}:3001`;
}
