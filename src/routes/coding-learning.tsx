import { createFileRoute } from '@tanstack/react-router';
import { CodingLearning } from '@/pages/CodingLearning';

export const Route = createFileRoute('/coding-learning')({
  head: () => ({
    meta: [
      { title: 'Coding Concepts — USAM for Kids' },
      {
        name: 'description',
        content: 'Master 18 essential programming concepts across 5 categories: BASICS, LOGIC, DATA, ALGORITHMS, and DESIGN.',
      },
      { property: 'og:title', content: 'Coding Concepts — USAM for Kids' },
    ],
  }),
  component: CodingLearning,
});
