import Image from "next/image";
import Link from "next/link";
import type { Property, Room } from "@kith/database";
import { formatNgn } from "@kith/domain";
import { IconHomeCheck, IconUsers } from "@/components/icons";

const tierStyle: Record<Room["tier"], string> = {
  circle: "text-kith-blue-deep bg-kith-blue/10",
  market: "text-kith-green-deep bg-kith-green/10",
  elite: "text-paper bg-navy",
};

export function RoomCard({ room, property, imageUrl }: { room: Room; property: Property; imageUrl?: string }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-card bg-paper shadow-card transition-shadow hover:shadow-lift hairline">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {imageUrl ? (
          <Image
            src={imageUrl} alt={property.title} width={800} height={600}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        <span className={`absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-semibold ${tierStyle[room.tier]}`}>
          {room.tier === "circle" ? "Circle · live auction" : room.tier[0]!.toUpperCase() + room.tier.slice(1)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl leading-tight">{property.title}</h2>
          <p className="tabular shrink-0 text-sm font-semibold text-navy">
            {room.saleMode === "fixed" && room.priceKobo !== null ? `${formatNgn(room.priceKobo)}/session` : `floor ${room.floorPriceKobo !== null ? formatNgn(room.floorPriceKobo) : "—"}`}
          </p>
        </div>
        <p className="mt-1 text-sm text-ink/60">{property.address}, {property.city}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink/60">
          <span className="inline-flex items-center gap-1.5">
            <IconUsers width={14} height={14} /> {room.capacity} {room.capacity === 1 ? "person" : "people"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconHomeCheck width={14} height={14} className="text-kith-green-deep" /> Porter-verified
          </span>
          <span>{room.amenities.length} amenities</span>
        </div>
        <Link
          href={`/rooms/${room.id}`}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-navy-soft"
        >
          View room
        </Link>
      </div>
    </article>
  );
}
