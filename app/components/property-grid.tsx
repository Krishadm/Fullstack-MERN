'use client';
import * as React from "react"
import { PropertyCard } from "./property-card"
import { Property } from "@/lib/api-client"
import { Building2 } from "lucide-react"

function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/60">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-6 skeleton rounded-lg w-2/3" />
        <div className="h-4 skeleton rounded-lg w-full" />
        <div className="h-3 skeleton rounded-lg w-1/2" />
        <div className="pt-3 border-t grid grid-cols-3 gap-2">
          <div className="h-10 skeleton rounded-lg" />
          <div className="h-10 skeleton rounded-lg" />
          <div className="h-10 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function PropertyGrid({ properties, isLoading }: { properties: Property[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const list: Property[] = Array.isArray(properties)
    ? properties
    : (properties as any)?.properties ?? []

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4 bg-muted/30 rounded-2xl border border-dashed border-border">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-muted flex items-center justify-center">
          <Building2 className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No properties found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Try adjusting your filters or search in a different city.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {list.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
