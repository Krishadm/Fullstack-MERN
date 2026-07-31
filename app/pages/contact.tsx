'use client';
import * as React from "react"
import { MapPin, Phone, Mail, Clock, MessageCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://fullstack-mern-be.onrender.com'

export default function ContactPage() {
  const { toast } = useToast()
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", message: "" })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters."
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address."
    if (form.phone && !/^[\+]?[0-9\s\-]{7,15}$/.test(form.phone)) e.phone = "Enter a valid phone number."
    if (!form.message.trim() || form.message.trim().length < 10) e.message = "Message must be at least 10 characters."
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send')
      setSent(true)
      setForm({ name: "", email: "", phone: "", message: "" })
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send message.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-primary/90 to-slate-800 py-20 text-center">
        <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-3">Get In Touch</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          Have a question or need help finding your dream property? We're here for you.
        </p>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">We'd love to hear from you</h2>
                <p className="text-muted-foreground">Reach out through any of the channels below or fill the form.</p>
              </div>

              {[
                { icon: MapPin, label: "Address",       value: "123 Business Park, Bangalore, Karnataka 560001" },
                { icon: Phone,  label: "Phone",         value: "+91 98765 43210" },
                { icon: Mail,   label: "Email",         value: "hello@housefind.in" },
                { icon: Clock,  label: "Working Hours", value: "Mon – Sat: 9 AM – 7 PM" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-foreground text-sm">{value}</p>
                  </div>
                </div>
              ))}

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-transform hover:scale-105 shadow-md"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white flex-shrink-0">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.469 2.027 7.77L0 32l8.43-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.77-1.853l-.486-.29-5.004 1.192 1.215-4.87-.317-.5A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.87c-.398-.199-2.354-1.162-2.72-1.294-.365-.133-.63-.199-.896.199-.265.398-1.029 1.294-1.261 1.56-.232.265-.465.298-.863.1-.398-.2-1.681-.62-3.202-1.977-1.183-1.056-1.982-2.36-2.214-2.758-.232-.398-.025-.613.174-.811.179-.178.398-.465.597-.697.199-.232.265-.398.398-.664.133-.265.066-.497-.033-.697-.1-.199-.896-2.16-1.228-2.957-.323-.776-.651-.671-.896-.683l-.763-.013c-.265 0-.697.1-1.062.497-.365.398-1.394 1.362-1.394 3.322s1.427 3.853 1.626 4.119c.199.265 2.808 4.287 6.803 6.013.951.41 1.693.655 2.271.839.954.304 1.823.261 2.51.158.766-.114 2.354-.962 2.686-1.891.332-.93.332-1.727.232-1.891-.099-.166-.365-.265-.763-.464z"/>
                </svg>
                Chat with us on WhatsApp
              </a>
            </div>

            {/* Contact Form */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-foreground mb-6">Send a Message</h3>

              {sent ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-foreground mb-2">Message Sent!</h4>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="John Doe" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }} className={errors.name ? 'border-destructive focus-visible:ring-destructive/50' : ''} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Email <span className="text-destructive">*</span></Label>
                  <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(p => ({ ...p, email: '' })) }} className={errors.email ? 'border-destructive focus-visible:ring-destructive/50' : ''} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input type="tel" placeholder="+91 9876543210" value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })) }} className={errors.phone ? 'border-destructive focus-visible:ring-destructive/50' : ''} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Message <span className="text-destructive">*</span></Label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setErrors(p => ({ ...p, message: '' })) }}
                    className={`w-full px-3 py-2 rounded-lg border bg-background text-sm text-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${errors.message ? 'border-destructive focus-visible:ring-destructive/50' : 'border-input'}`}
                  />
                  {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
