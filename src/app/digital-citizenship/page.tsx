/**
 * Digital Citizenship - Main Page
 *
 * Landing page for online safety and digital citizenship
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Citizenship | USAM Learning Worlds",
  description: "Learn online safety, privacy, and digital responsibility",
};

export default function DigitalCitizenshipPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Digital Citizenship</h1>
          <p className="text-lg text-muted-foreground">
            Learn to be safe, responsible, and kind online
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="font-semibold mb-2">Online Safety</h3>
            <p className="text-sm text-muted-foreground">
              Protect yourself and your information
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">👣</div>
            <h3 className="font-semibold mb-2">Digital Footprint</h3>
            <p className="text-sm text-muted-foreground">
              Think before you post online
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">🚫</div>
            <h3 className="font-semibold mb-2">Stop Cyberbullying</h3>
            <p className="text-sm text-muted-foreground">
              Stand up to mean behavior online
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2">Privacy Matters</h3>
            <p className="text-sm text-muted-foreground">
              Control what you share
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">🎭</div>
            <h3 className="font-semibold mb-2">Spot Fake News</h3>
            <p className="text-sm text-muted-foreground">
              Tell truth from fiction online
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-semibold mb-2">Digital Etiquette</h3>
            <p className="text-sm text-muted-foreground">
              Be kind and respectful online
            </p>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Start Learning</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Stay Safe Online</h4>
                <p className="text-sm text-muted-foreground">Learn what to share and what to keep private</p>
              </div>
              <span className="text-sm text-primary">15 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Your Digital Footprint</h4>
                <p className="text-sm text-muted-foreground">Everything you do online leaves a trace</p>
              </div>
              <span className="text-sm text-primary">15 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Stand Up to Cyberbullying</h4>
                <p className="text-sm text-muted-foreground">How to handle mean behavior</p>
              </div>
              <span className="text-sm text-primary">20 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Spot Fake News</h4>
                <p className="text-sm text-muted-foreground">Learn to check if information is true</p>
              </div>
              <span className="text-sm text-primary">15 min</span>
            </div>
          </div>
        </div>

        {/* Safety Pledge */}
        <div className="bg-primary/5 rounded-lg border border-primary/20 p-6">
          <h2 className="text-xl font-semibold mb-4">Digital Citizen Pledge</h2>
          <div className="space-y-2 text-sm">
            <p>✓ I will protect my personal information</p>
            <p>✓ I will think before I post</p>
            <p>✓ I will be kind and respectful online</p>
            <p>✓ I will stand up against cyberbullying</p>
            <p>✓ I will check facts before sharing</p>
            <p>✓ I will tell an adult if something feels wrong</p>
          </div>
        </div>
      </div>
    </div>
  );
}
