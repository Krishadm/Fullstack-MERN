'use client';
import * as React from "react"
import Link from "next/link"
import { Building2, Mail, Phone, MapPin } from "lucide-react"
import { useHealthCheck } from "@/lib/api-client"

export function Footer() {
  const { data: health } = useHealthCheck()

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-serif text-xl font-bold text-white">
                Estate<span className="text-primary">Edge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              India's premium property marketplace. Find your next home, office, or investment with confidence.
            </p>
            {health?.status === 'ok' && (
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-green-400 font-medium">All Systems Operational</span>
              </div>
            )}
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Apartments", href: "/properties?type=apartment" },
                { label: "Villas",     href: "/properties?type=villa" },
                { label: "Houses",     href: "/properties?type=house" },
                { label: "Commercial", href: "/properties?type=commercial" },
                { label: "Plots",      href: "/properties?type=plot" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Top Cities</h4>
            <ul className="space-y-2.5">
              {["Mumbai", "Bangalore", "Delhi", "Pune", "Hyderabad", "Chennai"].map(city => (
                <li key={city}>
                  <Link href={`/properties?city=${city}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                123 Business Park, Bangalore, Karnataka 560001
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
                hello@housefind.in
              </li>
            </ul>
            <div className="mt-5 space-y-2">
              <Link href="#" className="block text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="block text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} EstateEdge Real Estate. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built with ❤️ for India's property seekers
          </p>
        </div>
      </div>
    </footer>
  )
}
