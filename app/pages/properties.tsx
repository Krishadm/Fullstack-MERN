'use client';
import * as React from "react"
import { useListProperties, PropertyType, PropertyStatus } from "@/lib/api-client"
import { PropertyGrid } from "@/components/property-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Filter, SlidersHorizontal } from "lucide-react"

export default function PropertiesPage() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()

  const [city, setCity] = React.useState(searchParams.get("city") || "")
  const [type, setType] = React.useState<PropertyType | "">(searchParams.get("type") as PropertyType || "")
  const [status, setStatus] = React.useState<PropertyStatus | "">(searchParams.get("status") as PropertyStatus || "")
  const [minPrice, setMinPrice] = React.useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get("maxPrice") || "")
  const [bedrooms, setBedrooms] = React.useState(searchParams.get("bedrooms") || "")
  const [sortBy, setSortBy] = React.useState(searchParams.get("sortBy") || "newest")

  const [page, setPage] = React.useState(1)
  const limit = 12

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false)

  // Debounce city & price inputs to avoid firing on every keystroke
  const [cityInput, setCityInput] = React.useState(city)
  const [minPriceInput, setMinPriceInput] = React.useState(minPrice)
  const [maxPriceInput, setMaxPriceInput] = React.useState(maxPrice)

  React.useEffect(() => {
    const t = setTimeout(() => { setCity(cityInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [cityInput])

  React.useEffect(() => {
    const t = setTimeout(() => { setMinPrice(minPriceInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [minPriceInput])

  React.useEffect(() => {
    const t = setTimeout(() => { setMaxPrice(maxPriceInput); setPage(1) }, (400))
    return () => clearTimeout(t)
  }, [maxPriceInput])

  const { data, isLoading } = useListProperties({
    city: city || undefined,
    type: type || undefined,
    status: status || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    bedrooms: bedrooms || undefined,
    sortBy: sortBy || undefined,
    page,
    limit,
  })

  const clearFilters = () => {
    setCity("")
    setCityInput("")
    setType("")
    setStatus("")
    setMinPrice("")
    setMinPriceInput("")
    setMaxPrice("")
    setMaxPriceInput("")
    setBedrooms("")
    setSortBy("newest")
    setPage(1)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Find Properties</h1>
          <p className="text-muted-foreground mt-2">
            {data?.total ? `${data.total} properties found` : "Browse our collection of properties"}
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Label className="text-muted-foreground whitespace-nowrap">Sort by</Label>
            <Select 
              value={sortBy} 
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="w-40 border-muted"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Area: Largest</option>
            </Select>
          </div>
          <Button 
            variant="outline" 
            className="md:hidden"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className={`w-full md:w-64 lg:w-80 flex-shrink-0 space-y-6 ${isMobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-card border rounded-xl p-5 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 className="font-serif font-semibold text-lg flex items-center">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-primary" /> Filters
              </h3>
              <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Clear all
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input 
                  placeholder="Enter city..." 
                  value={cityInput} 
                  onChange={(e) => setCityInput(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Property Status</Label>
                <Select value={status} onChange={(e) => { setStatus(e.target.value as PropertyStatus); setPage(1) }}>
                  <option value="">Any Status</option>
                  <option value="for_sale">Buy</option>
                  <option value="for_rent">Rent</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select value={type} onChange={(e) => { setType(e.target.value as PropertyType); setPage(1) }}>
                  <option value="">Any Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                  <option value="plot">Plot</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price Range (₹)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={minPriceInput} 
                    onChange={(e) => setMinPriceInput(e.target.value)} 
                  />
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPriceInput} 
                    onChange={(e) => setMaxPriceInput(e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Select value={bedrooms} onChange={(e) => { setBedrooms(e.target.value); setPage(1) }}>
                  <option value="">Any</option>
                  <option value="1">1+ BHK</option>
                  <option value="2">2+ BHK</option>
                  <option value="3">3+ BHK</option>
                  <option value="4">4+ BHK</option>
                </Select>
              </div>
              
              <div className="md:hidden space-y-2 pt-2 border-t mt-4">
                 <Label>Sort by</Label>
                 <Select 
                    value={sortBy} 
                    onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="area_desc">Area: Largest</option>
                  </Select>
              </div>

            </div>
          </div>
        </aside>

        {/* Properties Grid */}
        <div className="flex-1 w-full min-w-0">
          <PropertyGrid properties={data?.properties || []} isLoading={isLoading} />
          
          {/* Pagination */}
          {!isLoading && data && data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground px-4">
                Page <span className="font-medium text-foreground">{page}</span> of {data.totalPages}
              </div>
              <Button 
                variant="outline" 
                disabled={page === data.totalPages}
                onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
