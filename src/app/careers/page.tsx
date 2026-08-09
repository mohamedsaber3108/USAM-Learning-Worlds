/**
 * Career Exploration - Main Page
 *
 * Landing page for career exploration
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Exploration | USAM Learning Worlds",
  description: "Explore careers and plan your future",
};

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Career Exploration</h1>
          <p className="text-lg text-muted-foreground">
            Discover careers, explore pathways, and plan your future
          </p>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">💻</div>
            <h3 className="font-semibold mb-2">Technology</h3>
            <p className="text-sm text-muted-foreground">
              Software, AI, cybersecurity, data
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">🔬</div>
            <h3 className="font-semibold mb-2">Science</h3>
            <p className="text-sm text-muted-foreground">
              Research, medicine, engineering
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="font-semibold mb-2">Arts</h3>
            <p className="text-sm text-muted-foreground">
              Design, animation, music, writing
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">💼</div>
            <h3 className="font-semibold mb-2">Business</h3>
            <p className="text-sm text-muted-foreground">
              Marketing, finance, entrepreneurship
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-semibold mb-2">Education</h3>
            <p className="text-sm text-muted-foreground">
              Teaching, counseling, training
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="font-semibold mb-2">Environment</h3>
            <p className="text-sm text-muted-foreground">
              Conservation, sustainability, ecology
            </p>
          </div>
        </div>

        {/* Featured Careers */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Popular Careers</h2>
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Software Developer</h4>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  High Demand
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Create apps and websites that people use every day
              </p>
              <div className="text-xs text-muted-foreground">
                Skills: Coding • Problem solving • Teamwork
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Game Developer</h4>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  Growing
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Design and build video games people love
              </p>
              <div className="text-xs text-muted-foreground">
                Skills: Coding • 3D design • Creativity
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Environmental Scientist</h4>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  Growing
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Study nature and protect our planet
              </p>
              <div className="text-xs text-muted-foreground">
                Skills: Science • Research • Problem solving
              </div>
            </div>
          </div>
        </div>

        {/* Your Journey */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Career Journey</h2>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div className="w-0.5 h-full bg-primary/20 my-1"></div>
              </div>
              <div className="pb-6">
                <h4 className="font-medium mb-1">Discover Your Interests</h4>
                <p className="text-sm text-muted-foreground">
                  Take quizzes, explore different careers
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div className="w-0.5 h-full bg-primary/20 my-1"></div>
              </div>
              <div className="pb-6">
                <h4 className="font-medium mb-1">Explore Career Profiles</h4>
                <p className="text-sm text-muted-foreground">
                  Learn what people actually do in different jobs
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div className="w-0.5 h-full bg-primary/20 my-1"></div>
              </div>
              <div className="pb-6">
                <h4 className="font-medium mb-1">See the Path</h4>
                <p className="text-sm text-muted-foreground">
                  Understand education and steps to get there
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Try It Out</h4>
                <p className="text-sm text-muted-foreground">
                  Do simulations, projects, and activities
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
