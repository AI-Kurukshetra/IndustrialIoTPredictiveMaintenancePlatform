import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Metrics } from "@/components/landing/metrics";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="bg-slate-50">
      <Navbar />
      <div className="animate-fade-up">
        <Hero />
      </div>
      <div className="animate-fade-up animate-delay-1">
        <Features />
      </div>
      <div className="animate-fade-up animate-delay-1">
        <HowItWorks />
      </div>
      <div className="animate-fade-up animate-delay-2">
        <DashboardPreview />
      </div>
      <div className="animate-fade-up animate-delay-2">
        <Metrics />
      </div>
      <div className="animate-fade-up animate-delay-2">
        <Testimonials />
      </div>
      <div className="animate-fade-up animate-delay-2">
        <Pricing />
      </div>

      <section id="final-cta" className="animate-fade-up animate-delay-2 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-r from-cyan-700 to-blue-700 p-8 text-white lg:p-12">
          <h2 className="text-3xl font-bold">Ready to Eliminate Unplanned Downtime?</h2>
          <p className="mt-3 max-w-2xl text-cyan-100">
            Start with real-time equipment visibility and build a predictive maintenance operation across every facility.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/signup" variant="secondary" size="lg">
              Start Monitoring Your Equipment
            </Button>
            <Button href="#pricing" variant="ghost" size="lg" className="text-white hover:bg-white/10">
              Book Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
