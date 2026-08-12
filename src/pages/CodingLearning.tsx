import { useEffect, useState } from 'react';
import { Code, Lightbulb, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/services/api';
import type { CodingConcept } from '@/services/api';
import { cn } from '@/lib/utils';

const categoryColors: Record<string, string> = {
  BASICS: 'bg-green-500/10 text-green-700 border-green-500/20',
  LOGIC: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  DATA: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  ALGORITHMS: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  DESIGN: 'bg-pink-500/10 text-pink-700 border-pink-500/20',
};

const categoryIcons: Record<string, typeof Code> = {
  BASICS: Code,
  LOGIC: Lightbulb,
  DATA: Star,
  ALGORITHMS: Sparkles,
  DESIGN: Code,
};

export function CodingLearning() {
  const [concepts, setConcepts] = useState<CodingConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<CodingConcept | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConcepts();
  }, []);

  const loadConcepts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.coding.listConcepts();
      setConcepts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load concepts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChallenge = async (concept: CodingConcept) => {
    setSelectedConcept(concept);
    console.log('Starting challenge for:', concept.name);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto size-8 animate-pulse text-primary" />
          <p className="mt-4 text-muted-foreground">Loading coding concepts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={loadConcepts} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const categoryGroups = concepts.reduce(
    (acc, concept) => {
      if (!acc[concept.category]) acc[concept.category] = [];
      acc[concept.category].push(concept);
      return acc;
    },
    {} as Record<string, CodingConcept[]>,
  );

  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-6">
      <header>
        <h1 className="font-display text-4xl font-bold">Coding Concepts</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Master 18 essential programming concepts across 5 categories
        </p>
      </header>

      <div className="space-y-8">
        {Object.entries(categoryGroups).map(([category, categoryConcepts]) => {
          const Icon = categoryIcons[category] || Code;
          const colorClass = categoryColors[category] || categoryColors.BASICS;

          return (
            <section key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn('rounded-lg border p-2', colorClass)}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{category}</h2>
                  <p className="text-sm text-muted-foreground">
                    {categoryConcepts.length} concepts
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryConcepts.map((concept) => (
                  <Card key={concept.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{concept.name}</h3>
                        <div className="flex gap-0.5">
                          {Array.from({ length: concept.difficulty }).map((_, i) => (
                            <Star
                              key={i}
                              className="size-3 fill-yellow-500 text-yellow-500"
                            />
                          ))}
                        </div>
                      </div>

                      {concept.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {concept.description}
                        </p>
                      )}

                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleStartChallenge(concept)}
                        >
                          <Code className="mr-2 size-4" />
                          Challenge
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selectedConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-2xl font-bold">{selectedConcept.name}</h2>
            <p className="mt-2 text-muted-foreground">
              Coding challenges coming soon...
            </p>
            <Button className="mt-4" onClick={() => setSelectedConcept(null)}>
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
