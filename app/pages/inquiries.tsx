'use client';
import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useListSentInquiries } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2, Calendar, MessageSquare } from "lucide-react"

export default function InquiriesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const { data: sentInquiries, isLoading } = useListSentInquiries(!!user)

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) return <div className="p-20 text-center">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4 -ml-4" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl font-serif font-bold text-foreground">Sent Inquiries</h1>
        <p className="text-muted-foreground mt-2">Track the properties you've shown interest in.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>)}
        </div>
      ) : sentInquiries && sentInquiries.length > 0 ? (
        <div className="space-y-4">
          {sentInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row border-b">
                  <div className="p-5 flex-1 bg-muted/20">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      Sent on {new Date(inquiry.createdAt).toLocaleDateString()}
                    </div>
                    <Link href={`/properties/${inquiry.propertyId}`}>
                      <h3 className="text-lg font-semibold text-primary hover:underline flex items-center mb-1">
                        <Building2 className="w-4 h-4 mr-2" />
                        {inquiry.propertyTitle}
                      </h3>
                    </Link>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex gap-3">
                    <MessageSquare className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Your Message:</p>
                      <p className="text-foreground/90 italic bg-muted/30 p-3 rounded-md">"{inquiry.message}"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No inquiries sent</h3>
            <p className="text-muted-foreground mb-6 max-w-md">You haven't contacted any property owners yet. Browse properties and send an inquiry to get started.</p>
            <Link href="/properties"><Button>Browse Properties</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
