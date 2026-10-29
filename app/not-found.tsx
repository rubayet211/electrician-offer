import React from "react";
import { AlertCircle, ArrowRight, Home, Wrench } from "lucide-react";
import { parsedClientConfig } from "@/config/client.config";
import { Section, Container, Button } from "@/components/ui";

export default function NotFound() {
  const { business } = parsedClientConfig;

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col justify-between">
      <Section
        tone="dark"
        blueprint={true}
        className="flex-1 flex items-center justify-center py-20"
      >
        <Container size="narrow" className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-charcoal border border-steel-700 flex items-center justify-center mx-auto text-amber">
            <AlertCircle className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-amber font-semibold">
              STATUS 404 · CIRCUIT NOT FOUND
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-paper tracking-tight">
              Page Does Not Exist
            </h1>
            <p className="text-steel-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-sans">
              The pathway or page address you requested is not connected to any active route on this
              contractor website.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="/">
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Return Home</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              href="/services"
              className="text-paper border-white/20 hover:bg-white/10"
            >
              <Wrench className="w-4 h-4" aria-hidden="true" />
              <span>Browse Services</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              href="/contact"
              className="text-paper border-white/20 hover:bg-white/10"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="pt-8 border-t border-white/10 text-xs font-mono text-steel-400">
            Need immediate help? Call {business.name} at{" "}
            <a href={`tel:${business.phone}`} className="text-paper underline">
              {business.phoneDisplay}
            </a>
          </div>
        </Container>
      </Section>
    </div>
  );
}
