'use client';
import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  useGetProperty, 
  useUpdateProperty, 
  PropertyUpdateType, 
  PropertyUpdateStatus 
} from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form"
import { Trash2, ArrowLeft } from "lucide-react"
import { ImageUploader } from "@/components/image-uploader"
import { useQueryClient } from "@tanstack/react-query"
import { getGetPropertyQueryKey } from "@/lib/api-client"

const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.nativeEnum(PropertyUpdateType),
  status: z.nativeEnum(PropertyUpdateStatus),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  city: z.string().min(2, "City is required"),
  locality: z.string().min(2, "Locality is required"),
  address: z.string().min(5, "Full address is required"),
  bedrooms: z.coerce.number().min(0, "Cannot be negative"),
  bathrooms: z.coerce.number().min(0, "Cannot be negative"),
  area: z.coerce.number().min(1, "Area must be greater than 0"),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  isFurnished: z.boolean(),
  parkingAvailable: z.boolean(),
})

type PropertyFormValues = z.infer<typeof propertySchema>

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>()
  const propertyId = id!
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const { data: property, isLoading: isPropLoading } = useGetProperty(propertyId, !!propertyId)
  
  const updateProperty = useUpdateProperty()
  
  const [images, setImages] = React.useState<string[]>([])
  
  const [amenities, setAmenities] = React.useState<string[]>([])
  const [newAmenity, setNewAmenity] = React.useState("")

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
  })

  // Auth guard
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isAuthLoading, router])

  // Populate form
  React.useEffect(() => {
    if (property) {
      if (user && property.ownerUserId !== user.id) {
        toast({ title: "Unauthorized", description: "You don't own this property", variant: "destructive" })
        router.push(`/properties/${property.id}`)
        return
      }

      form.reset({
        title: property.title,
        description: property.description,
        type: property.type as any,
        status: property.status as any,
        price: property.price,
        city: property.city,
        locality: property.locality,
        address: property.address,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        isFurnished: property.isFurnished || false,
        parkingAvailable: property.parkingAvailable || false,
        images: property.images || [],
        amenities: property.amenities || [],
      })
      
      setImages(property.images || [])
      setAmenities(property.amenities || [])
    }
  }, [property, user, form, toast])

  const handleImagesChange = (updated: string[]) => {
    setImages(updated)
    form.setValue("images", updated, { shouldDirty: true })
  }

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()])
      setNewAmenity("")
      form.setValue("amenities", [...amenities, newAmenity.trim()], { shouldDirty: true })
    }
  }

  const removeAmenity = (index: number) => {
    const updated = amenities.filter((_, i) => i !== index)
    setAmenities(updated)
    form.setValue("amenities", updated, { shouldDirty: true })
  }

  const onSubmit = (data: PropertyFormValues) => {
    updateProperty.mutate({ id: propertyId, ...data }, {
      onSuccess: (updatedProperty) => {
        toast({
          title: "Property Updated",
          description: "Your listing has been updated.",
        })
        queryClient.setQueryData(getGetPropertyQueryKey(propertyId), updatedProperty)
        router.push(`/properties/${propertyId}`)
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update property.",
          variant: "destructive"
        })
      }
    })
  }

  if (isAuthLoading || isPropLoading || !user) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4 -ml-4" onClick={() => router.push(`/properties/${propertyId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Property
        </Button>
        <h1 className="text-3xl font-serif font-bold text-foreground">Edit Listing</h1>
        <p className="text-muted-foreground">Update your property details.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Form fields are identical to CreatePropertyPage, omitting some for brevity and focusing on key editable ones */}
          <Card>
            <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Type</FormLabel>
                    <Select {...field}>
                      <option value="apartment">Apartment</option><option value="house">House</option><option value="villa">Villa</option>
                      <option value="commercial">Commercial</option><option value="plot">Plot</option><option value="pg">PG</option>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel>
                    <Select {...field}><option value="for_sale">Sale</option><option value="for_rent">Rent</option></Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Location & Description</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="locality" render={({ field }) => (
                  <FormItem><FormLabel>Locality</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl></FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Specs & Features</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="bedrooms" render={({ field }) => (
                  <FormItem><FormLabel>Beds</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="bathrooms" render={({ field }) => (
                  <FormItem><FormLabel>Baths</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem><FormLabel>Area (sq.ft)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <div className="flex gap-6">
                 <FormField control={form.control} name="isFurnished" render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl><input type="checkbox" className="w-4 h-4 rounded text-primary" checked={field.value} onChange={field.onChange} /></FormControl>
                      <FormLabel className="cursor-pointer">Furnished</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="parkingAvailable" render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl><input type="checkbox" className="w-4 h-4 rounded text-primary" checked={field.value} onChange={field.onChange} /></FormControl>
                      <FormLabel className="cursor-pointer">Parking Available</FormLabel>
                    </FormItem>
                  )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Media & Amenities</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Amenities</Label>
                <div className="flex gap-2">
                  <Input value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }} />
                  <Button type="button" variant="secondary" onClick={addAmenity}>Add</Button>
                </div>
                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {amenities.map((amenity, idx) => (
                      <div key={idx} className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {amenity} <button type="button" onClick={() => removeAmenity(idx)}><Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive"/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Label className="mb-3 block">Images</Label>
                <ImageUploader images={images} onChange={handleImagesChange} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pb-12">
            <Button variant="outline" onClick={() => router.push(`/properties/${propertyId}`)}>Cancel</Button>
            <Button type="submit" disabled={!form.formState.isDirty || updateProperty.isPending}>
              {updateProperty.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
