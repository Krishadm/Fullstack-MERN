'use client';
import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreateProperty, PropertyInputType, PropertyInputStatus } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form"
import { Building, Trash2 } from "lucide-react"
import { ImageUploader } from "@/components/image-uploader"

const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.nativeEnum(PropertyInputType),
  status: z.nativeEnum(PropertyInputStatus),
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

export default function CreatePropertyPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const createProperty = useCreateProperty()
  
  const [images, setImages] = React.useState<string[]>([])
  
  const [amenities, setAmenities] = React.useState<string[]>([])
  const [newAmenity, setNewAmenity] = React.useState("")

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      type: "apartment",
      status: "for_sale",
      price: 0,
      city: "",
      locality: "",
      address: "",
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      isFurnished: false,
      parkingAvailable: false,
      images: [],
      amenities: [],
    },
  })

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  const handleImagesChange = (updated: string[]) => {
    setImages(updated)
    form.setValue("images", updated)
  }

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()])
      setNewAmenity("")
      form.setValue("amenities", [...amenities, newAmenity.trim()])
    }
  }

  const removeAmenity = (index: number) => {
    const updated = amenities.filter((_, i) => i !== index)
    setAmenities(updated)
    form.setValue("amenities", updated)
  }

  const onSubmit = (data: PropertyFormValues) => {
    createProperty.mutate(data, {
      onSuccess: (property: import('@/lib/api-client').Property) => {
        toast({
          title: "Property Listed",
          description: "Your property has been successfully listed.",
        })
        router.push(`/properties/${property.id}`)
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to list property.",
          variant: "destructive"
        })
      }
    })
  }

  if (isLoading || !user) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">List a Property</h1>
        <p className="text-muted-foreground">Fill in the details below to publish your property on HouseFind.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Luxurious 3BHK Apartment in Bandra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select {...field}>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Villa</option>
                        <option value="commercial">Commercial</option>
                        <option value="plot">Plot</option>
                        <option value="pg">PG / Co-living</option>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select {...field}>
                        <option value="for_sale">For Sale</option>
                        <option value="for_rent">For Rent</option>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carpet Area (sq.ft)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 1200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mumbai" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locality</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bandra West" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter complete address" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-6 pt-4">
                <FormField
                  control={form.control}
                  name="isFurnished"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={field.value}
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Furnished Property</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parkingAvailable"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={field.value}
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Parking Available</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 space-y-3">
                <Label>Amenities</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. Swimming Pool, Gym" 
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addAmenity()
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={addAmenity}>Add</Button>
                </div>
                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {amenities.map((amenity, idx) => (
                      <div key={idx} className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {amenity}
                        <button type="button" onClick={() => removeAmenity(idx)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Description</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the property, neighborhood, nearby facilities..." 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader images={images} onChange={handleImagesChange} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pb-12">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={createProperty.isPending}>
              {createProperty.isPending ? "Publishing..." : "Publish Listing"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
