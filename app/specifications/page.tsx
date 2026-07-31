'use client';
import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const SPECS = [
  {
    category: "Flooring",
    rows: [
      { area: "Living & Dining",       detail: "Double-charged vitrified tiles, 800×800 mm, premium brand" },
      { area: "Master Bedroom",        detail: "Vitrified tiles, 600×600 mm, anti-skid finish" },
      { area: "Other Bedrooms",        detail: "Vitrified tiles, 600×600 mm" },
      { area: "Kitchen",               detail: "Anti-skid ceramic tiles, 300×300 mm" },
      { area: "Toilets",               detail: "Anti-skid ceramic tiles, 300×300 mm" },
      { area: "Balconies",             detail: "Anti-skid vitrified tiles, 600×600 mm" },
      { area: "Staircase & Corridors", detail: "Granite / Kota stone" },
    ],
  },
  {
    category: "Doors & Windows",
    rows: [
      { area: "Main Door",        detail: "Teak wood frame, flush door with veneer finish, digital/brass lock" },
      { area: "Internal Doors",   detail: "Engineered hardwood frame, flush door with laminate finish" },
      { area: "Toilet Doors",     detail: "WPC frame, waterproof flush door" },
      { area: "Windows",          detail: "UPVC sliding / casement, single-glazed, with mosquito mesh" },
      { area: "Ventilators",      detail: "Aluminium louvred ventilators" },
      { area: "Balcony Railings", detail: "MS powder-coated or toughened glass railing" },
    ],
  },
  {
    category: "Kitchen",
    rows: [
      { area: "Counter Platform",  detail: "Black Galaxy granite / engineered stone" },
      { area: "Sink",              detail: "SS sink, single bowl" },
      { area: "Wall Tiles (dado)", detail: "Ceramic tiles up to 2 ft above counter" },
      { area: "CP Fittings",       detail: "Premium brand — Jaquar / Hindware / equivalent" },
      { area: "Water Provision",   detail: "Hot & cold water provision for sink + RO + dishwasher" },
    ],
  },
  {
    category: "Toilets & Bathrooms",
    rows: [
      { area: "Sanitary Ware", detail: "Premium brand — Cera / Hindware / equivalent" },
      { area: "CP Fittings",   detail: "Jaquar or equivalent — chrome finish" },
      { area: "Wall Tiles",    detail: "Full-height ceramic tiles, 300×450 mm" },
      { area: "Floor Tiles",   detail: "Anti-skid ceramic, 300×300 mm" },
      { area: "Shower Area",   detail: "Overhead shower provision with glass partition in master bath" },
      { area: "Accessories",   detail: "Towel rod, soap dispenser, mirror — provided" },
    ],
  },
  {
    category: "Electrical",
    rows: [
      { area: "Wiring",    detail: "Finolex / Havells or equivalent — concealed" },
      { area: "Switches",  detail: "Modular switches — Legrand / Schneider / equivalent" },
      { area: "MCB / DB",  detail: "Individual MCB for each circuit; RCCB at main DB" },
      { area: "Points",    detail: "Adequate power points in all rooms; AC provision in all bedrooms & living" },
      { area: "Internet",  detail: "CAT6 cabling provision in living, master bedroom" },
      { area: "TV Points", detail: "Provision in living room and master bedroom" },
    ],
  },
  {
    category: "Painting & Finishes",
    rows: [
      { area: "Interior Walls", detail: "Premium emulsion paint — Asian Paints / Berger / equivalent" },
      { area: "Exterior Walls", detail: "Weather-proof exterior paint with anti-algae coating" },
      { area: "Ceiling",        detail: "OBD / white cement finish" },
      { area: "Common Areas",   detail: "Texture / designer finish" },
    ],
  },
];

export default function SpecificationsPage() {
  const [open, setOpen] = React.useState<string | null>("Flooring");

  return (
    <div className="flex flex-col w-full">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 py-20 text-center">
        <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-3">Building Quality</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Flat Specifications</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          Detailed building specifications covering flooring, doors, kitchen, bathrooms, electrical and finishes.
        </p>
      </section>

      {/* Specs */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">

            <div className="px-6 py-5 border-b border-border/60 bg-muted/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Building Specifications</p>
            </div>

            <div className="divide-y divide-border/60">
              {SPECS.map((section) => (
                <div key={section.category}>
                  {/* Accordion header */}
                  <button
                    onClick={() => setOpen(open === section.category ? null : section.category)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left"
                  >
                    <span className="font-semibold text-foreground">{section.category}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                      open === section.category && "rotate-180"
                    )} />
                  </button>

                  {/* Accordion body */}
                  {open === section.category && (
                    <div className="px-6 pb-5">
                      <table className="w-full text-sm">
                        <tbody>
                          {section.rows.map((row, i) => (
                            <tr key={i} className={cn(
                              "border-b border-border/40 last:border-0",
                              i % 2 === 0 ? "bg-muted/20" : ""
                            )}>
                              <td className="py-3 pr-6 font-medium text-foreground w-2/5 align-top">{row.area}</td>
                              <td className="py-3 text-muted-foreground align-top">{row.detail}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
