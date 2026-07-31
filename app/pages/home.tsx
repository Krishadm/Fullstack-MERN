'use client';
import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, MapPin, TrendingUp, Shield, Headphones, ArrowRight, Building2, Home, Warehouse } from "lucide-react"
import {
  useGetFeaturedProperties,
  useGetStatsOverview,
  useGetTopCities,
  PropertyType,
  PropertyStatus
} from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PropertyGrid } from "@/components/property-grid"
import { cn } from "@/lib/utils"

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", icon: Building2 },
  { value: "house",     label: "House",     icon: Home },
  { value: "villa",     label: "Villa",     icon: Home },
  { value: "commercial",label: "Commercial",icon: Warehouse },
  { value: "plot",      label: "Plot",      icon: MapPin },
]

export default function HomePage() {
  const router = useRouter()
  const [searchCity, setSearchCity] = React.useState("")
  const [searchType, setSearchType] = React.useState<PropertyType | "">("")
  const [searchStatus, setSearchStatus] = React.useState<"for_sale" | "for_rent">("for_sale")

  const { data: featuredProperties, isLoading } = useGetFeaturedProperties({ limit: 8 })
  const { data: stats } = useGetStatsOverview()
  const { data: topCities } = useGetTopCities()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchCity) params.set("city", searchCity)
    if (searchType) params.set("type", searchType)
    params.set("status", searchStatus)
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="flex flex-col w-full">

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')" }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />

        {/* Decorative blobs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-40 w-48 h-48 bg-secondary/20 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl fade-up">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-white/90 text-sm font-medium">India's #1 Property Platform</span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Find Your
              <span className="block text-secondary">Dream Home</span>
              in India
            </h1>
            <p className="text-white/70 text-lg md:text-xl mb-10 leading-relaxed">
              Explore {stats?.totalProperties?.toLocaleString() ?? "50,000"}+ verified properties across {stats?.totalCities ?? "100"}+ cities. Buy, sell, or rent with confidence.
            </p>

            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 md:p-3">
              {/* Buy / Rent toggle */}
              <div className="flex gap-1 mb-3 px-1 pt-1">
                {(["for_sale", "for_rent"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSearchStatus(s)}
                    className={cn(
                      "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                      searchStatus === s
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {s === "for_sale" ? "Buy" : "Rent"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    placeholder="Search city, locality, landmark..."
                    className="pl-10 h-12 border-border/60 bg-muted/30 text-sm"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  />
                </div>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as PropertyType)}
                  className="h-12 px-3 rounded-lg border border-border/60 bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-40"
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <Button type="submit" className="h-12 px-7 bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm gap-2">
                  <Search className="h-4 w-4" /> Search
                </Button>
              </form>

              {/* Quick type pills */}
              <div className="flex gap-2 mt-3 px-1 pb-1 flex-wrap">
                {PROPERTY_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => { setSearchType(t.value as PropertyType); }}
                    className={cn(
                      "text-xs px-3 py-1 rounded-full border transition-all",
                      searchType === t.value
                        ? "bg-primary/10 border-primary/30 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: `${stats?.totalProperties?.toLocaleString() ?? "—"}+`, label: "Active Listings" },
              { value: `${stats?.totalCities ?? "—"}+`,                       label: "Cities Covered" },
              { value: `${stats?.forSaleCount?.toLocaleString() ?? "—"}`,     label: "For Sale" },
              { value: `${stats?.forRentCount?.toLocaleString() ?? "—"}`,     label: "For Rent" },
            ].map((s, i) => (
              <div key={i} className={cn("py-8 px-6 text-center", i < 3 && "border-r border-border/60")}>
                <p className="font-serif text-3xl font-bold text-primary mb-1">{s.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Featured</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Premium Listings</h2>
              <p className="text-muted-foreground mt-2 max-w-lg">Handpicked properties with exceptional value and quality.</p>
            </div>
            <Link href="/properties" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <PropertyGrid properties={featuredProperties || []} isLoading={isLoading} />
          <div className="mt-8 text-center sm:hidden">
            <Link href="/properties">
              <Button variant="outline" className="w-full gap-2">View All Properties <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Top Cities ── */}
      {Array.isArray(topCities) && topCities.length > 0 && (
        <section className="py-20 bg-muted/40 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Explore</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Popular Cities</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topCities.map((c) => (
                <Link key={c.city} href={`/properties?city=${encodeURIComponent(c.city)}`}>
                  <div className="bg-card border border-border/60 rounded-2xl p-5 text-center card-hover cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary transition-colors">
                      <Building2 className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <p className="font-semibold text-sm text-foreground mb-0.5">{c.city}</p>
                    <p className="text-xs text-muted-foreground">{c.count} listings</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why HomeHive ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Why Us</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Why Choose HouseFind?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield,      color: "bg-blue-50 text-blue-600",   title: "Verified Listings",    desc: "Every property is manually verified by our team to ensure authenticity and accuracy." },
              { icon: TrendingUp,  color: "bg-green-50 text-green-600", title: "Best Market Prices",   desc: "Get real-time market insights and price trends to make informed decisions." },
              { icon: Headphones,  color: "bg-purple-50 text-purple-600",title: "24/7 Support",        desc: "Our dedicated support team is always available to assist you through your journey." },
            ].map((f, i) => (
              <div key={i} className="bg-muted/30 rounded-2xl p-8 border border-border/40 hover:border-primary/20 hover:bg-white transition-all group">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5", f.color)}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary/95 to-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-4">Get Started</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to List Your Property?
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Join thousands of property owners who trust HouseFind to connect with the right buyers and tenants.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/properties/new">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-13 px-8 text-base font-semibold shadow-lg gap-2 w-full sm:w-auto">
                <Home className="w-5 h-5" /> List Property Free
              </Button>
            </Link>
            <Link href="/properties">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/10 h-13 px-8 text-base w-full sm:w-auto gap-2">
                Browse Properties <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
