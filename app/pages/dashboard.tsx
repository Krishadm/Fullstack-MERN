'use client';
import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useGetMyListings, useListInquiries, useDeleteProperty, Property } from "@/lib/api-client"
import { useQueryClient } from "@tanstack/react-query"
import { getGetMyListingsQueryKey } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  Home, MessageSquare, Edit, Trash2, ExternalLink,
  Calendar, MapPin, PlusCircle, BedDouble, Bath,
  Maximize2, AlertTriangle, X, Phone, Mail
} from "lucide-react"

// ── Simple inline confirm dialog ──
function DeleteDialog({ property, onConfirm, onCancel, isPending }: {
  property: Property
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 fade-up">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Delete Property</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6 bg-muted/50 rounded-lg p-3 border-l-4 border-destructive/30">
          Are you sure you want to delete <span className="font-semibold text-foreground">"{property.title}"</span>?
          All inquiries for this property will also be removed.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1 gap-2" onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
            ) : (
              <><Trash2 className="w-4 h-4" /> Delete</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Property listing row card ──
function PropertyRow({ property, onDelete }: { property: Property; onDelete: (p: Property) => void }) {
  return (
    <div className="bg-white border border-border/60 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-44 h-40 sm:h-auto flex-shrink-0 bg-muted">
          {property.images?.[0] ? (
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
          <span className={cn(
            "absolute top-2 left-2 badge-pill text-white shadow-sm",
            property.status === 'for_sale' ? "bg-primary" : "bg-secondary text-secondary-foreground"
          )}>
            {property.status === 'for_sale' ? 'Sale' : 'Rent'}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-3 mb-1">
              <Link href={`/properties/${property.id}`}>
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 leading-snug">
                  {property.title}
                </h3>
              </Link>
              <span className="font-bold text-primary text-sm flex-shrink-0">{formatCurrency(property.price)}</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3" /> {property.locality}, {property.city}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{property.bedrooms} Beds</span>
              <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms} Baths</span>
              <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" />{property.area} sqft</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              {property.inquiryCount || 0} inquiries
            </span>
            <div className="flex items-center gap-2">
              <Link href={`/properties/${property.id}`}>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" title="View">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link href={`/properties/${property.id}/edit`}>
                <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg gap-1.5 text-xs font-medium hover:border-primary/40 hover:text-primary">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg gap-1.5 text-xs font-medium text-destructive border-destructive/20 hover:bg-destructive hover:text-white hover:border-destructive"
                onClick={() => onDelete(property)}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: listings, isLoading: listingsLoading } = useGetMyListings(!!user)
  const { data: inquiries, isLoading: inquiriesLoading } = useListInquiries(!!user)
  const deleteProperty = useDeleteProperty()

  const [deleteTarget, setDeleteTarget] = React.useState<Property | null>(null)

  React.useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login")
  }, [user, authLoading, router])

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deleteProperty.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast({ title: "Property deleted successfully" })
        queryClient.invalidateQueries({ queryKey: getGetMyListingsQueryKey() })
        setDeleteTarget(null)
      },
      onError: (err: any) => {
        toast({ title: err.message || "Failed to delete", variant: "destructive" })
        setDeleteTarget(null)
      },
    })
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {deleteTarget && (
        <DeleteDialog
          property={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteProperty.isPending}
        />
      )}

      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back, {user.name.split(' ')[0]} 👋
                </h1>
                <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
              </div>
              <div className="flex gap-3">
                <Link href="/inquiries">
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" /> Sent Inquiries
                  </Button>
                </Link>
                <Link href="/properties/new">
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                    <PlusCircle className="w-4 h-4" /> Add Property
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "My Listings",       value: listings?.length ?? 0,                          color: "text-primary" },
                { label: "Total Inquiries",   value: listings?.reduce((a, p) => a + (p.inquiryCount || 0), 0) ?? 0, color: "text-green-600" },
                { label: "Received Messages", value: inquiries?.length ?? 0,                         color: "text-orange-500" },
              ].map((s, i) => (
                <div key={i} className="bg-muted/50 rounded-xl px-4 py-3 text-center">
                  <p className={cn("text-2xl font-bold font-serif", s.color)}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* My Properties */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-foreground">My Properties</h2>
                <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
                  {listings?.length || 0} total
                </span>
              </div>

              {listingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-36 skeleton rounded-2xl" />
                  ))}
                </div>
              ) : listings && listings.length > 0 ? (
                <div className="space-y-3">
                  {listings.map(p => (
                    <PropertyRow key={p.id} property={p} onDelete={setDeleteTarget} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-border rounded-2xl p-12 text-center">
                  <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Home className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">No properties listed yet</h3>
                  <p className="text-sm text-muted-foreground mb-5">Start listing your properties to receive inquiries from buyers and tenants.</p>
                  <Link href="/properties/new">
                    <Button className="gap-2"><PlusCircle className="w-4 h-4" /> List Your First Property</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Received Inquiries */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-foreground">Received Inquiries</h2>
                <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">
                  {inquiries?.length || 0}
                </span>
              </div>

              <div className="bg-white border border-border/60 rounded-2xl overflow-hidden">
                {inquiriesLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}
                  </div>
                ) : inquiries && inquiries.length > 0 ? (
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link href={`/properties/${inq.propertyId}`}>
                            <p className="text-xs font-semibold text-primary hover:underline line-clamp-1">{inq.propertyTitle}</p>
                          </Link>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80 italic bg-muted/40 rounded-lg p-2.5 mb-2 border-l-2 border-primary/20">
                          "{inq.message}"
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-foreground">{inq.fromUserName}</p>
                          <div className="flex gap-2">
                            {inq.fromUserPhone && (
                              <a href={`tel:${inq.fromUserPhone}`} className="text-[10px] text-primary flex items-center gap-1 hover:underline">
                                <Phone className="w-3 h-3" />{inq.fromUserPhone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No inquiries received yet.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Inquiries will appear here when buyers contact you.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
