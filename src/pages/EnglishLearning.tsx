import { useEffect, useState } from 'react';
import { BookOpen, MessageSquare, Mic, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/services/api';
import type { EnglishStrand } from '@/services/api';

export function EnglishLearning() {
  const [strands, setStrands] = useState<EnglishStrand[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<EnglishStrand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStrands();
  }, []);

  const loadStrands = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.english.listStrands();
      setStrands(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load strands');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPractice = async (strand: EnglishStrand) => {
    setSelectedStrand(strand);
    // Navigation to conversation practice would happen here
    console.log('Starting practice for:', strand.name);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto size-8 animate-pulse text-primary" />
          <p className="mt-4 text-muted-foreground">Loading English strands...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={loadStrands} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const cefrGroups = strands.reduce(
    (acc, strand) => {
      const level = strand.cefrLevel || 'A1';
      if (!acc[level]) acc[level] = [];
      acc[level].push(strand);
      return acc;
    },
    {} as Record<string, EnglishStrand[]>,
  );

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <h1 className="font-display text-4xl font-bold">English Learning</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Practice your English skills across 14 different strands
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(cefrGroups).map(([level, levelStrands]) => (
          <div key={level} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {level}
              </span>
              <span className="text-sm text-muted-foreground">
                {levelStrands.length} strands
              </span>
            </div>

            {levelStrands.map((strand) => (
              <Card key={strand.id} className="overflow-hidden">
                <div className="p-4">
                  <h3 className="font-semibold">{strand.name}</h3>
                  {strand.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {strand.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStartPractice(strand)}
                    >
                      <MessageSquare className="mr-2 size-4" />
                      Practice
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {selectedStrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-2xl font-bold">{selectedStrand.name}</h2>
            <p className="mt-2 text-muted-foreground">
              Practice options coming soon...
            </p>
            <Button
              className="mt-4"
              onClick={() => setSelectedStrand(null)}
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
