import { RequestContext } from "./request-context";

const ALLOWED_IPS = [
  "85.242.157.131", // example single static IP (external) - I'd love to ignore this one
  "127.0.0.1", // local loopback
];

// Allowed CIDR ranges (useful for local networks)
const ALLOWED_CIDRS = [
  "192.168.1.0/24", // example: whole 192.168.1.x subnet
  "10.0.0.0/8", // example: whole 10.x.x.x private range
];

function ipv4ToInt(ip: string): number {
  const parts = ip.split(".");
  if (parts.length !== 4) throw new Error("Not an IPv4 address");
  return parts.reduce((acc, p) => (acc << 8) + parseInt(p, 10), 0) >>> 0;
}

/** Check if an IPv4 address is inside a CIDR */
function cidrContains(cidr: string, ip: string): boolean {
  const [net, prefixStr] = cidr.split("/");
  const prefix = Number(prefixStr);
  if (!net || isNaN(prefix)) return false;

  try {
    const netInt = ipv4ToInt(net);
    const ipInt = ipv4ToInt(ip);
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return (netInt & mask) === (ipInt & mask);
  } catch (e) {
    // not IPv4 -> false
    return false;
  }
}

function isAllowedIp(ip: string | null): boolean {
  if (!ip) return false;

  // direct match
  if (ALLOWED_IPS.includes(ip)) return true;

  // check each CIDR range
  for (const cidr of ALLOWED_CIDRS) {
    if (cidrContains(cidr, ip)) return true;
  }

  return false;
}

export class UserValidationService {
  constructor(private readonly request: RequestContext) {}

  public isRequestAllowed(): boolean {
    const isLocalIp = isAllowedIp(this.request.clientIp);

    return isLocalIp;
  }
}
