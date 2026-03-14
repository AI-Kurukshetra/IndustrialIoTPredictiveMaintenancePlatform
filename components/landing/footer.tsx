export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-slate-900">PulseForge</p>
          <p className="mt-2 text-sm text-slate-600">Predictive maintenance for modern industrial operations.</p>
        </div>

        <nav aria-label="Footer links" className="space-y-2 text-sm text-slate-600">
          <a href="#features" className="block hover:text-slate-900">
            Features
          </a>
          <a href="#how-it-works" className="block hover:text-slate-900">
            How it works
          </a>
          <a href="#pricing" className="block hover:text-slate-900">
            Pricing
          </a>
        </nav>

        <div className="space-y-2 text-sm text-slate-600">
          <p>Contact: sales@pulseforge.ai</p>
          <p>Phone: +1 (800) 555-0148</p>
          <p>Support: 24/7 global coverage</p>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <a href="#" className="block hover:text-slate-900">
            LinkedIn
          </a>
          <a href="#" className="block hover:text-slate-900">
            X
          </a>
          <a href="#" className="block hover:text-slate-900">
            YouTube
          </a>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-7xl text-xs text-slate-500">© 2026 PulseForge Industrial IoT. All rights reserved.</p>
    </footer>
  );
}
