'use client';
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  useGetProperty, useGetSimilarProperties,
  useCreateInquiry, useDeleteProperty
} from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PropertyGrid } from "@/components/property-grid"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  MapPin, BedDouble, Bath, Maximize2, Car, Sofa,
  Calendar, Phone, Send, Key, Edit, Trash2,
  AlertTriangle, X, CheckCircle2, ChevronLeft,
  ChevronRight, Share2, Heart, MessageSquare
} from "lucide-react"

function DeleteDialog({ title, onConfirm, onCancel, isPending }: {
  title: string; onConfirm: () => void; onCancel: () => void; isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 fade-up">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Delete Listing</h3>
            <p className="text-xs text-muted-foreground">This cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 border-l-4 border-destructive/30 mb-6">
          Delete <span className="font-semibold text-foreground">"{title}"</span>? All inquiries will also be removed.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" className="flex-1 gap-2" onClick={onConfirm} disabled={isPending}>
            {isPending
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
              : <><Trash2 className="w-4 h-4" />Delete</>
            }
          </Button>
        </div>
      </div>
    </div>
  )
}

const TYPE_COLORS: Record<string, string> = {
  apartment: "bg-blue-100 text-blue-700",
  house:     "bg-green-100 text-green-700",
  villa:     "bg-purple-100 text-purple-700",
  commercial:"bg-orange-100 text-orange-700",
  plot:      "bg-yellow-100 text-yellow-700",
  pg:        "bg-pink-100 text-pink-700",
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>()
  const propertyId = params?.id
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const { data: property, isLoading } = useGetProperty(propertyId)
  const { data: similarProperties } = useGetSimilarProperties(propertyId)
  const createInquiry = useCreateInquiry()
  const deleteProperty = useDeleteProperty()

  const [activeImage, setActiveImage] = React.useState(0)
  const [message, setMessage] = React.useState("")
  const [showDelete, setShowDelete] = React.useState(false)
  const [inquirySent, setInquirySent] = React.useState(false)

  React.useEffect(() => {
    if (property) { setActiveImage(0); window.scrollTo(0, 0) }
  }, [property])

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    createInquiry.mutate({ propertyId: propertyId!, message }, {
      onSuccess: () => {
        toast({ title: "Inquiry sent!", description: "The owner will contact you soon." })
        setMessage("")
        setInquirySent(true)
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to send inquiry.", variant: "destructive" })
      }
    })
  }

  const handleDelete = () => {
    deleteProperty.mutate(property!.id, {
      onSuccess: () => {
        toast({ title: "Property deleted successfully" })
        router.push("/dashboard")
      },
      onError: (err: any) => {
        toast({ title: err.message || "Failed to delete", variant: "destructive" })
        setShowDelete(false)
      }
    })
  }

  const images = property?.images || []
  const prevImage = () => setActiveImage(i => (i - 1 + images.length) % images.length)
  const nextImage = () => setActiveImage(i => (i + 1) % images.length)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-6">This listing may have been removed.</p>
          <Link href="/properties"><Button>Browse Properties</Button></Link>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === property.ownerUserId
  const isForSale = property.status === "for_sale"

  return (
    <>
      {showDelete && (
        <DeleteDialog
          title={property.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          isPending={deleteProperty.isPending}
        />
      )}

      <div className="min-h-screen bg-muted/20 pb-20">

        {/* ── Gallery ── */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link href="/properties" className="hover:text-primary">Properties</Link>
              <span>/</span>
              <span className="text-foreground font-medium line-clamp-1">{property.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[50vh] lg:h-[65vh]">
              {/* Main image */}
              <div className="lg:col-span-3 relative rounded-2xl overflow-hidden bg-muted group">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[activeImage]}
                      alt={property.title}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    {images.length > 1 && (
                      <>
                        <button onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button key={i} onClick={() => setActiveImage(i)}
                              className={cn("w-1.5 h-1.5 rounded-full transition-all", i === activeImage ? "bg-white w-4" : "bg-white/50")} />
                          ))}
                        </div>
                      </>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <MapPin className="w-8 h-8" />
                      </div>
                      <p className="text-sm">No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              <div className="hidden lg:flex flex-col gap-3 h-full overflow-y-auto">
                {images.slice(0, 4).map((img, i) => (
                  <div key={i} onClick={() => setActiveImage(i)}
                    className={cn("flex-1 rounded-xl overflow-hidden cursor-pointer border-2 transition-all min-h-0",
                      activeImage === i ? "border-primary shadow-md" : "border-transparent hover:border-primary/40"
                    )}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="flex-1 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/30 text-xs">
                    No photos
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Title block */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={cn("badge-pill", isForSale ? "bg-primary text-white" : "bg-secondary text-secondary-foreground")}>
                    {isForSale ? "For Sale" : "For Rent"}
                  </span>
                  <span className={cn("badge-pill capitalize", TYPE_COLORS[property.type] || "bg-muted text-muted-foreground")}>
                    {property.type}
                  </span>
                  {property.isFurnished && <span className="badge-pill bg-green-100 text-green-700">Furnished</span>}
                  <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Listed {new Date(property.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-3">{property.title}</h1>
                <p className="flex items-center gap-1.5 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  {property.address}, {property.locality}, {property.city}
                </p>
                <div className="flex items-end gap-2">
                  <span className="font-serif text-3xl md:text-4xl font-bold text-primary">{formatCurrency(property.price)}</span>
                  {!isForSale && <span className="text-muted-foreground text-sm mb-1">/ month</span>}
                </div>
              </div>

              {/* Quick stats */}
              <div className={`grid gap-3 ${property.type === 'plot' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {property.type !== 'plot' && (
                  <>
                    <div className="bg-white border border-border/60 rounded-xl p-4 text-center">
                      <BedDouble className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="font-bold text-foreground text-lg leading-none">{property.bedrooms}</p>
                      <p className="text-xs text-muted-foreground mt-1">Bedrooms</p>
                    </div>
                    <div className="bg-white border border-border/60 rounded-xl p-4 text-center">
                      <Bath className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="font-bold text-foreground text-lg leading-none">{property.bathrooms}</p>
                      <p className="text-xs text-muted-foreground mt-1">Bathrooms</p>
                    </div>
                  </>
                )}
                <div className="bg-white border border-border/60 rounded-xl p-4 text-center">
                  <Maximize2 className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="font-bold text-foreground text-lg leading-none">{property.area}</p>
                  <p className="text-xs text-muted-foreground mt-1">Area (sqft)</p>
                </div>
                <div className="bg-white border border-border/60 rounded-xl p-4 text-center">
                  {property.parkingAvailable ? <Car className="w-5 h-5 text-primary mx-auto mb-2" /> : <Sofa className="w-5 h-5 text-primary mx-auto mb-2" />}
                  <p className="font-bold text-foreground text-lg leading-none">{property.parkingAvailable ? "Yes" : (property.isFurnished ? "Yes" : "No")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{property.parkingAvailable ? "Parking" : "Furnished"}</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white border border-border/60 rounded-2xl p-6">
                <h2 className="font-serif text-xl font-bold mb-4">About this Property</h2>
                <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
                  {property.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white border border-border/60 rounded-2xl p-6">
                  <h2 className="font-serif text-xl font-bold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />{a}
                      </div>
                    ))}
                    {property.parkingAvailable && (
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />Parking Available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-4">

              {/* Owner actions */}
              {isOwner ? (
                <div className="bg-white border border-primary/20 rounded-2xl overflow-hidden">
                  <div className="bg-primary/5 border-b border-primary/10 px-5 py-4">
                    <h3 className="font-semibold text-foreground">Manage Your Listing</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">You are the owner of this property</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3">
                      <span className="text-sm text-muted-foreground">Total Inquiries</span>
                      <span className="font-bold text-xl text-primary">{property.inquiryCount || 0}</span>
                    </div>
                    <Link href={`/properties/${property.id}/edit`} className="block">
                      <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                        <Edit className="w-4 h-4" /> Edit Listing
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive hover:text-white hover:border-destructive"
                      onClick={() => setShowDelete(true)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete Listing
                    </Button>
                    <Link href="/dashboard" className="block">
                      <Button variant="ghost" className="w-full gap-2 text-muted-foreground">
                        <MessageSquare className="w-4 h-4" /> View All Inquiries
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Contact form */
                <div className="bg-white border border-border/60 rounded-2xl overflow-hidden sticky top-24">
                  <div className="bg-muted/30 border-b px-5 py-4">
                    <h3 className="font-semibold text-foreground">Contact Owner</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Listed by <span className="font-semibold text-foreground">{property.ownerName}</span>
                    </p>
                  </div>
                  <div className="p-5">
                    {user ? (
                      inquirySent ? (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-foreground mb-1">Inquiry Sent!</h4>
                          <p className="text-sm text-muted-foreground">The owner will reach out to you soon.</p>
                          <Button variant="outline" size="sm" className="mt-4" onClick={() => setInquirySent(false)}>
                            Send Another
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleInquiry} className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground block mb-1.5">Your Message</label>
                            <Textarea
                              placeholder={`Hi, I'm interested in this ${property.type}. Please share more details.`}
                              className="min-h-[110px] resize-none text-sm"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex items-start gap-2 bg-blue-50 text-blue-700 rounded-lg p-3 text-xs">
                            <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            Owner's contact will be shared after your inquiry is accepted.
                          </div>
                          <Button type="submit" className="w-full gap-2" disabled={createInquiry.isPending || !message.trim()}>
                            {createInquiry.isPending
                              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                              : <><Send className="w-4 h-4" />Send Inquiry</>
                            }
                          </Button>
                        </form>
                      )
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Key className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold mb-1">Sign in to contact owner</h4>
                        <p className="text-xs text-muted-foreground mb-4">Login to send inquiries and view contact details.</p>
                        <Link href="/auth/login">
                          <Button className="w-full">Login / Register</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Property summary card */}
              <div className="bg-white border border-border/60 rounded-2xl p-5">
                <h4 className="font-semibold text-sm text-foreground mb-3">Property Summary</h4>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: "Type",      value: property.type.charAt(0).toUpperCase() + property.type.slice(1) },
                    { label: "Status",    value: isForSale ? "For Sale" : "For Rent" },
                    { label: "Area",      value: `${property.area} sq.ft` },
                    ...(property.type !== 'plot' ? [
                      { label: "Bedrooms",  value: property.bedrooms },
                      { label: "Bathrooms", value: property.bathrooms },
                      { label: "Furnished", value: property.isFurnished ? "Yes" : "No" },
                    ] : []),
                    { label: "Parking",   value: property.parkingAvailable ? "Available" : "Not Available" },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-medium text-foreground">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          {similarProperties && similarProperties.length > 0 && (
            <div className="mt-16 pt-10 border-t">
              <div className="mb-8">
                <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-1">You may also like</p>
                <h2 className="font-serif text-2xl font-bold">Similar Properties</h2>
              </div>
              <PropertyGrid properties={similarProperties.slice(0, 4)} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
