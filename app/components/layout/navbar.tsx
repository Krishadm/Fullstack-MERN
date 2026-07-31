'use client';
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "../ui/button"
import { Building2, Menu, X, ChevronDown, User, LayoutDashboard, LogOut, PlusCircle } from "lucide-react"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  React.useEffect(() => { setMobileOpen(false) }, [pathname])

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" },
    { label: "Specifications", href: "/specifications" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Building2 className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">
              House<span className="text-primary">Find</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-foreground max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", userMenuOpen && "rotate-180")} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-xl shadow-lg py-1 z-50">
                      <div className="px-3 py-2 border-b mb-1">
                        <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard
                      </Link>
                      <Link href="/properties/new" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                        <PlusCircle className="w-4 h-4 text-muted-foreground" /> List Property
                      </Link>
                      <Link href="/inquiries" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                        <User className="w-4 h-4 text-muted-foreground" /> My Inquiries
                      </Link>
                      <div className="border-t mt-1 pt-1">
                        <button onClick={() => { logout(); setUserMenuOpen(false) }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href}
                className={cn("block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t space-y-1">
              {user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/properties/new" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-primary hover:bg-accent">
                    <PlusCircle className="w-4 h-4" /> List Property
                  </Link>
                  <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/5">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">Sign In</Link>
                  <Link href="/auth/register" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-primary bg-accent">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
