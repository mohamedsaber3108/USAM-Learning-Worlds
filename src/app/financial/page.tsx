/**
 * Financial Literacy World - Main Page
 *
 * Landing page for financial literacy learning
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Literacy | USAM Learning Worlds",
  description: "Learn money management, budgeting, saving, and investing",
};

export default function FinancialWorldPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Financial Literacy World</h1>
          <p className="text-lg text-muted-foreground">
            Learn to manage money, budget wisely, save for goals, and build wealth
          </p>
        </div>

        {/* World Map Placeholder */}
        <div className="bg-card rounded-lg border p-8 mb-8">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Financial World Map Coming Soon</p>
          </div>
        </div>

        {/* Learning Regions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold mb-2">💰 Money Basics Town</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn what money is, earning, and spending wisely
            </p>
            <div className="text-sm">
              <span className="text-primary">Ages 8-11</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold mb-2">🏦 Savings City</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Build saving habits and reach your goals
            </p>
            <div className="text-sm">
              <span className="text-primary">Ages 8-14</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold mb-2">📊 Investment District</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discover how money grows through investing
            </p>
            <div className="text-sm">
              <span className="text-primary">Ages 12-14</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold mb-2">🚀 Entrepreneur Plaza</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start your own business and learn how it works
            </p>
            <div className="text-sm">
              <span className="text-primary">Ages 10-14</span>
            </div>
          </div>
        </div>

        {/* Quick Activities */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4">Start Learning</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Save for a Goal</h4>
                <p className="text-sm text-muted-foreground">Savings challenge</p>
              </div>
              <span className="text-sm text-primary">15 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Weekly Budget Challenge</h4>
                <p className="text-sm text-muted-foreground">Budget simulation</p>
              </div>
              <span className="text-sm text-primary">20 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Lemonade Stand</h4>
                <p className="text-sm text-muted-foreground">Business simulation</p>
              </div>
              <span className="text-sm text-primary">30 min</span>
            </div>
          </div>
        </div>

        {/* Character Introduction */}
        <div className="mt-8 bg-primary/5 rounded-lg border border-primary/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              👩‍💼
            </div>
            <div>
              <h3 className="font-semibold mb-1">Meet Zara, Your Money Mentor</h3>
              <p className="text-sm text-muted-foreground">
                Zara teaches smart money habits and helps you make wise financial decisions.
                She believes everyone can learn to manage money well!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
