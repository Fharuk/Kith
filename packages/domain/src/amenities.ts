/**
 * One amenity vocabulary, shared by listing, filtering and display.
 *
 * Free-text amenities rot fast ("Wi-Fi", "wifi", "Wifi included" are three different filters),
 * so the canonical list lives here and everything else normalises into it.
 */
export const AMENITIES = [
  "WiFi", "AC", "Security", "Generator", "Kitchen", "Laundry", "Parking", "Gym", "Pool", "Water",
] as const;

export type Amenity = (typeof AMENITIES)[number];

const CANONICAL = new Map(AMENITIES.map((a) => [a.toLowerCase(), a]));
const ALIASES: Record<string, Amenity> = {
  "wi-fi": "WiFi", wifi: "WiFi", internet: "WiFi", broadband: "WiFi",
  "air conditioning": "AC", "air-conditioner": "AC", "a/c": "AC",
  borehole: "Water", "borehole water": "Water", "running water": "Water", water: "Water",
  "prepaid meter": "Generator", "24/7 security": "Security", guard: "Security",
  parking: "Parking", car: "Parking",
  gymnasium: "Gym", swimming: "Pool",
};

/** Map whatever a landlord typed into the canonical vocabulary; drop what we cannot place. */
export function normalizeAmenities(values: string[]): Amenity[] {
  const out = new Set<Amenity>();
  for (const raw of values) {
    for (const part of String(raw).split(",")) {
      const key = part.trim().toLowerCase();
      if (!key) continue;
      const hit = CANONICAL.get(key) ?? ALIASES[key];
      if (hit) out.add(hit);
    }
  }
  return [...out];
}
