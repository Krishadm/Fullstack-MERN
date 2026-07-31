'use client';
import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRegisterUser } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Building2, UserPlus } from "lucide-react"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid 10-digit phone number").max(15, "Phone number too long").regex(/^[+\d\s\-()]+$/, "Enter a valid phone number"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { login: setAuth, user, isLoading } = useAuth()
  const { toast } = useToast()
  
  const registerUser = useRegisterUser()

  React.useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  })

  const onSubmit = (data: RegisterFormValues) => {
    registerUser.mutate(data, {
      onSuccess: (res) => {
        setAuth(res.token, res.user)
        router.push("/dashboard")
      },
      onError: (error: any) => {
        toast({ title: "Registration Failed", description: error.message || "Failed to create account.", variant: "destructive" })
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-background">
      {/* Image Side */}
      <div className="hidden md:flex w-1/2 bg-muted relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop" 
            alt="Luxury apartment interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-secondary/80 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 p-12 text-secondary-foreground max-w-lg">
          <Building2 className="w-12 h-12 mb-6" />
          <h2 className="text-4xl font-serif font-bold mb-4 leading-tight">Join HouseFind Today</h2>
          <p className="text-lg opacity-90">List your property, contact owners directly, and find your perfect space in India's top cities.</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground mt-2">Get started with your free HouseFind account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input type="tel" placeholder="+91 9876543210" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full h-12 text-base" disabled={registerUser.isPending}>
                {registerUser.isPending ? "Creating account..." : <><UserPlus className="w-4 h-4 mr-2" /> Register</>}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground pt-6 border-t">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
