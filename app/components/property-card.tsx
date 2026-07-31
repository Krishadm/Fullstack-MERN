'use client';
import * as React from "react"
import Link from "next/link"
import { Property } from "@/lib/api-client"
import { formatCurrency } from "@/lib/utils"
import { MapPin, BedDouble, Bath, Maximize2, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

const TYPE_COLORS: Record<string, string> = {
  apartment: "bg-blue-50 text-blue-700",
  house:     "bg-green-50 text-green-700",
  villa:     "bg-purple-50 text-purple-700",
  commercial:"bg-orange-50 text-orange-700",
  plot:      "bg-yellow-50 text-yellow-700",
  pg:        "bg-pink-50 text-pink-700",
}

export function PropertyCard({ property }: { property: Property }) {
  const isForSale = property.status === "for_sale"
  const [imgError, setImgError] = React.useState(false)
  const [liked, setLiked] = React.useState(false)

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div className="bg-card rounded-2xl overflow-hidden border border-border/60 card-hover h-full flex flex-col">

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
          {property.images && property.images.length > 0 && !imgError ? (
            <img
              src={property.images[0]}
              alt={property.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 bg-gradient-to-br from-muted to-muted/50">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="text-xs">No Image</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={cn("badge-pill shadow-sm", isForSale
              ? "bg-primary text-white"
              : "bg-secondary text-secondary-foreground"
            )}>
              {isForSale ? "For Sale" : "For Rent"}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className={cn("badge-pill shadow-sm capitalize", TYPE_COLORS[property.type] || "bg-muted text-muted-foreground")}>
              {property.type}
            </span>
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(l => !l) }}
            className={cn(
              "absolute bottom-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-md",
              liked ? "bg-red-500 opacity-100" : "bg-white/90 opacity-0 group-hover:opacity-100 hover:bg-white"
            )}
          >
            <Heart className={cn("w-4 h-4 transition-colors", liked ? "text-white fill-white" : "text-muted-foreground")} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Price */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xl font-bold text-primary leading-tight">
                {formatCurrency(property.price)}
              </p>
              {!isForSale && <p className="text-xs text-muted-foreground">per month</p>}
            </div>
            {property.inquiryCount ? (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                {property.inquiryCount} inquiries
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary/60" />
            <span className="truncate">{property.locality}, {property.city}</span>
          </div>

          {/* Specs */}
          <div className={`mt-auto pt-3 border-t border-border/60 grid gap-2 ${property.type === 'plot' ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {property.type !== 'plot' && (
              <>
                <div className="flex flex-col items-center gap-0.5">
                  <BedDouble className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{property.bedrooms}</span>
                  <span className="text-[10px] text-muted-foreground">Beds</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Bath className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{property.bathrooms}</span>
                  <span className="text-[10px] text-muted-foreground">Baths</span>
                </div>
              </>
            )}
            <div className="flex flex-col items-center gap-0.5">
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">{property.area}</span>
              <span className="text-[10px] text-muted-foreground">sq.ft</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
