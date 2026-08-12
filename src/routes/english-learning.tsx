import { createFileRoute } from '@tanstack/react-router';
import { EnglishLearning } from '@/pages/EnglishLearning';

export const Route = createFileRoute('/english-learning')({
  head: () => ({
    meta: [
      { title: 'English Learning — USAM for Kids' },
      {
        name: 'description',
        content: 'Practice English across 14 strands with CEFR-aligned content from A1 to B2.',
      },
      { property: 'og:title', content: 'English Learning — USAM for Kids' },
    ],
  }),
  component: EnglishLearning,
});
