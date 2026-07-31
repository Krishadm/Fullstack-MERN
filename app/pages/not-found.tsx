'use client';
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-serif font-bold text-primary">404</h1>
        <h2 className="text-2xl font-medium text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button size="lg">Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
