/**
 * Research Skills World - Main Page
 *
 * Landing page for research skills learning
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research Skills | USAM Learning Worlds",
  description: "Learn information literacy, research methods, and source evaluation",
};

export default function ResearchWorldPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Research Skills Lab</h1>
          <p className="text-lg text-muted-foreground">
            Learn to find, evaluate, and use information like a real researcher
          </p>
        </div>

        {/* World Map Placeholder */}
        <div className="bg-card rounded-lg border p-8 mb-8">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Research Lab Map Coming Soon</p>
          </div>
        </div>

        {/* Learning Regions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold mb-2">❓ Question Quarter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn to ask great research questions
            </p>
            <div className="text-sm">
              <span className="text-primary">Ages 8-14</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold mb-2">📚 Library District</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Find information from books, websites, and experts
            </p>
            <div className="text-sm">
              <span className="text-primary">Ages 8-14</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold mb-2">🔍 Evaluation Center</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check if sources are reliable and trustworthy
            </p>
            <div className="text-sm">
              <span className="text-primary">Ages 10-14</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold mb-2">✍️ Synthesis Studio</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Organize notes and write your findings
            </p>
            <div className="text-sm">
              <span className="text-primary">Ages 10-14</span>
            </div>
          </div>
        </div>

        {/* Research Skills */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Research Skills</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">Questioning</h4>
              <p className="text-xs text-muted-foreground">Ask great questions</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">Information Seeking</h4>
              <p className="text-xs text-muted-foreground">Find good sources</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">Source Evaluation</h4>
              <p className="text-xs text-muted-foreground">Check credibility</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">Note-Taking</h4>
              <p className="text-xs text-muted-foreground">Capture key ideas</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">Analysis</h4>
              <p className="text-xs text-muted-foreground">Find patterns</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">Citation</h4>
              <p className="text-xs text-muted-foreground">Give credit</p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4">Start Researching</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Ask Good Questions</h4>
                <p className="text-sm text-muted-foreground">Question formulation</p>
              </div>
              <span className="text-sm text-primary">10 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Is This Source Reliable?</h4>
                <p className="text-sm text-muted-foreground">Source evaluation</p>
              </div>
              <span className="text-sm text-primary">15 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Give Credit Game</h4>
                <p className="text-sm text-muted-foreground">Citation practice</p>
              </div>
              <span className="text-sm text-primary">20 min</span>
            </div>
          </div>
        </div>

        {/* Character Introduction */}
        <div className="mt-8 bg-primary/5 rounded-lg border border-primary/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              👨‍🔬
            </div>
            <div>
              <h3 className="font-semibold mb-1">Meet Omar, Your Research Guide</h3>
              <p className="text-sm text-muted-foreground">
                Omar is a curious researcher who loves finding answers to big questions.
                He'll teach you how to find reliable information and think critically!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
