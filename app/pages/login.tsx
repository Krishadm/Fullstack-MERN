'use client';
import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useLoginUser } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Building2, Key } from "lucide-react"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login: setAuth, user, isLoading } = useAuth()
  const { toast } = useToast()
  
  const loginUser = useLoginUser()

  React.useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (data: LoginFormValues) => {
    loginUser.mutate(data, {
      onSuccess: (res) => {
        setAuth(res.token, res.user)
        router.push("/dashboard")
      },
      onError: (error: any) => {
        toast({ title: "Login Failed", description: error.message || "Invalid email or password.", variant: "destructive" })
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Image Side */}
      <div className="hidden md:flex w-1/2 bg-muted relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop" 
            alt="Luxury home" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 p-12 text-primary-foreground max-w-lg">
          <Building2 className="w-12 h-12 mb-6" />
          <h2 className="text-4xl font-serif font-bold mb-4 leading-tight">Welcome back to HouseFind</h2>
          <p className="text-lg opacity-80">Discover India's most premium properties and manage your listings with ease.</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-foreground">Sign In</h1>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-base" disabled={loginUser.isPending}>
                {loginUser.isPending ? "Signing in..." : <><Key className="w-4 h-4 mr-2" /> Sign In</>}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground pt-6 border-t">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
