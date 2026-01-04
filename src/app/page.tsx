import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pill, Search, ShieldCheck, MapPin, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto border-b border-slate-900">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 p-2 rounded-lg">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">PharmaHub</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Pharmacy Login
          </Link>
          <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6">
            <Link href="/register">Join as Pharmacy</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <Badge className="bg-teal-600/10 text-teal-400 border-teal-500/20 px-4 py-1.5 rounded-full text-sm font-semibold">
              The Future of Pharmacy Management
            </Badge>
            <h1 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tight text-white">
              Compare <span className="text-teal-400">Medicine</span> Prices Instantly.
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
              PharmaHub connects patients with local pharmacies, providing real-time stock availability and transparent pricing data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild className="h-14 px-8 bg-teal-600 hover:bg-teal-700 text-lg font-bold rounded-2xl shadow-xl shadow-teal-500/20 group text-white">
                <Link href="/search" className="flex items-center gap-2">
                  Start Searching <Search className="h-5 w-5 group-hover:scale-110 transition-transform text-white" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 px-8 border-slate-800 bg-slate-900/50 text-lg font-bold rounded-2xl hover:bg-slate-800 text-slate-100">
                <Link href="/register">Pharmacy Registration</Link>
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-slate-900">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Verified Data</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Stock Monitoring</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">Zero</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Hidden Fees</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-teal-500/10 rounded-[3rem] blur-2xl -z-10 animate-pulse"></div>
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
              <div className="text-center p-12 space-y-6">
                <div className="h-24 w-24 bg-teal-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-teal-500/30">
                  <ShieldCheck className="h-12 w-12 text-teal-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">Secure. Reliable. Fast.</h3>
                <p className="text-slate-400">Our platform ensures that both pharmacies and patients have access to the most accurate medicine data available.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-slate-500 text-sm">
        &copy; 2026 PharmaHub SaaS Inc. All rights reserved.
      </footer>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>
      {children}
    </span>
  );
}
