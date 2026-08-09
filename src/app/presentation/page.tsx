/**
 * Presentation Skills - Main Page
 *
 * Landing page for presentation and public speaking
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presentation Skills | USAM Learning Worlds",
  description: "Learn to create and deliver great presentations",
};

export default function PresentationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Presentation Skills</h1>
          <p className="text-lg text-muted-foreground">
            Learn to create slides, speak confidently, and share your ideas
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Create Slides</h3>
            <p className="text-sm text-muted-foreground">
              Build clear, engaging slides
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6 text-center">
            <div className="text-4xl mb-3">🎤</div>
            <h3 className="font-semibold mb-2">Practice Speaking</h3>
            <p className="text-sm text-muted-foreground">
              Build confidence and clarity
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6 text-center">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-semibold mb-2">Know Your Audience</h3>
            <p className="text-sm text-muted-foreground">
              Adapt to who's listening
            </p>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Presentations</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">My Favorite Animal</h4>
                <p className="text-sm text-muted-foreground">3 slides • 5 min talk</p>
              </div>
              <span className="text-sm text-primary">Continue</span>
            </div>

            <button className="w-full p-3 border-2 border-dashed rounded-lg text-sm text-muted-foreground hover:bg-muted">
              + Create New Presentation
            </button>
          </div>
        </div>

        {/* Practice Tips */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4">Presentation Tips</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="text-primary">✓</div>
              <div>
                <h4 className="font-medium">Start Strong</h4>
                <p className="text-sm text-muted-foreground">
                  Grab attention with an interesting fact or question
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-primary">✓</div>
              <div>
                <h4 className="font-medium">Keep It Simple</h4>
                <p className="text-sm text-muted-foreground">
                  One main idea per slide, short sentences
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-primary">✓</div>
              <div>
                <h4 className="font-medium">Practice Out Loud</h4>
                <p className="text-sm text-muted-foreground">
                  Rehearse to build confidence and timing
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-primary">✓</div>
              <div>
                <h4 className="font-medium">Use Your Voice</h4>
                <p className="text-sm text-muted-foreground">
                  Speak clearly, not too fast, show enthusiasm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
