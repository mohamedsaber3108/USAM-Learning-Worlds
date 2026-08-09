/**
 * Robotics - Main Page
 *
 * Landing page for robotics learning
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Robotics | USAM Learning Worlds",
  description: "Build, program, and control robots (virtual and physical)",
};

export default function RoboticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Robotics Lab</h1>
          <p className="text-lg text-muted-foreground">
            Build, program, and control robots - virtually or with real kits
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">🖥️</div>
            <h3 className="font-semibold mb-2">Virtual Robots</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Build and program robots in our simulator. No hardware needed!
            </p>
            <div className="text-sm">
              <span className="text-primary">Perfect for beginners</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-semibold mb-2">Physical Robots</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect real robot kits and bring your code to life
            </p>
            <div className="text-sm">
              <span className="text-primary">Hands-on learning</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">What You'll Learn</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">🔧 Building</h4>
              <p className="text-xs text-muted-foreground">Assemble robot components</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">💻 Programming</h4>
              <p className="text-xs text-muted-foreground">Write code to control robots</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">🧪 Testing</h4>
              <p className="text-xs text-muted-foreground">Debug and improve</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">📐 Engineering</h4>
              <p className="text-xs text-muted-foreground">Design solutions</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">🎯 Problem Solving</h4>
              <p className="text-xs text-muted-foreground">Complete challenges</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-1">🔄 Iteration</h4>
              <p className="text-xs text-muted-foreground">Improve through testing</p>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">My First Robot</h4>
                <p className="text-sm text-muted-foreground">Virtual • Move and turn</p>
              </div>
              <span className="text-sm text-primary">Continue</span>
            </div>

            <button className="w-full p-3 border-2 border-dashed rounded-lg text-sm text-muted-foreground hover:bg-muted">
              + New Robot Project
            </button>
          </div>
        </div>

        {/* Challenges */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4">Robot Challenges</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Navigate the Maze</h4>
                <p className="text-sm text-muted-foreground">Use sensors to find the way out</p>
              </div>
              <span className="text-sm">⭐ Easy</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Line Follower</h4>
                <p className="text-sm text-muted-foreground">Make robot follow a path</p>
              </div>
              <span className="text-sm">⭐⭐ Medium</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Obstacle Avoider</h4>
                <p className="text-sm text-muted-foreground">Detect and avoid obstacles</p>
              </div>
              <span className="text-sm">⭐⭐⭐ Hard</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
