import type { Evidence, EvidenceType } from "@/types/curriculum";
import {
  BookOpen,
  Wrench,
  Palette,
  MessageSquare,
  Brain,
  Lightbulb,
  ArrowRightLeft,
  PenLine
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Phase 12: Evidence types for assessment
 *
 * Multiple evidence types ensure we're measuring learning, not just completion.
 * Each type represents a different way to demonstrate understanding.
 */

const EVIDENCE_META: Record<
  EvidenceType,
  {
    icon: typeof BookOpen;
    label: string;
    color: string;
    description: string;
  }
> = {
  knowledge: {
    icon: BookOpen,
    label: "Knowledge",
    color: "text-blue-600 bg-blue-50",
    description: "Shows you know the concepts and facts"
  },
  application: {
    icon: Wrench,
    label: "Application",
    color: "text-green-600 bg-green-50",
    description: "You used it to solve a real problem"
  },
  creation: {
    icon: Palette,
    label: "Creation",
    color: "text-purple-600 bg-purple-50",
    description: "You made something new with this skill"
  },
  explanation: {
    icon: MessageSquare,
    label: "Explanation",
    color: "text-orange-600 bg-orange-50",
    description: "You explained it clearly to someone else"
  },
  conversation: {
    icon: MessageSquare,
    label: "Conversation",
    color: "text-pink-600 bg-pink-50",
    description: "You talked through it with a mentor"
  },
  "problem-solving": {
    icon: Brain,
    label: "Problem Solving",
    color: "text-indigo-600 bg-indigo-50",
    description: "You figured out a tricky challenge"
  },
  transfer: {
    icon: ArrowRightLeft,
    label: "Transfer",
    color: "text-teal-600 bg-teal-50",
    description: "You used it in a completely new situation"
  },
  reflection: {
    icon: PenLine,
    label: "Reflection",
    color: "text-amber-600 bg-amber-50",
    description: "You thought about what you learned and why"
  },
};

interface EvidenceItemProps {
  evidence: Evidence;
  compact?: boolean;
}

export function EvidenceItem({ evidence, compact = false }: EvidenceItemProps) {
  const meta = EVIDENCE_META[evidence.type];
  const Icon = meta.icon;
  const date = new Date(evidence.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className={cn("rounded-full p-1.5", meta.color)}>
          <Icon className="size-3" aria-hidden />
        </span>
        <span className="text-muted-foreground">{meta.label}</span>
        <span className="text-xs text-muted-foreground">· {date}</span>
      </div>
    );
  }

  return (
    <div className="surface-panel p-4">
      <div className="flex items-start gap-3">
        <span className={cn("rounded-xl p-2.5", meta.color)}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold">{meta.label}</h4>
            <time className="text-xs text-muted-foreground" dateTime={evidence.timestamp}>
              {date}
            </time>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{evidence.description}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">{meta.description}</p>
          {evidence.artifactUrl && (
            <a
              href={evidence.artifactUrl}
              className="mt-2 inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              View your work →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

interface EvidenceListProps {
  evidence: Evidence[];
  title?: string;
  emptyMessage?: string;
}

export function EvidenceList({
  evidence,
  title = "Recent Evidence",
  emptyMessage = "No evidence recorded yet. Keep learning!"
}: EvidenceListProps) {
  if (evidence.length === 0) {
    return (
      <div className="surface-panel p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && <h3 className="font-display text-lg font-semibold">{title}</h3>}
      <div className="space-y-3">
        {evidence.map((item) => (
          <EvidenceItem key={item.id} evidence={item} />
        ))}
      </div>
    </div>
  );
}

/** Evidence type distribution - shows which types of evidence the learner has */
export function EvidenceDistribution({ evidence }: { evidence: Evidence[] }) {
  const distribution = evidence.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<EvidenceType, number>);

  const types = Object.entries(distribution).sort((a, b) => b[1] - a[1]);

  if (types.length === 0) {
    return null;
  }

  return (
    <div className="surface-panel p-5">
      <h3 className="mb-4 font-display text-sm font-semibold">Evidence Types</h3>
      <div className="space-y-2">
        {types.map(([type, count]) => {
          const meta = EVIDENCE_META[type as EvidenceType];
          const Icon = meta.icon;
          return (
            <div key={type} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-lg p-1.5", meta.color)}>
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <span className="text-sm">{meta.label}</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * IMPORTANT: Phase 12 requirement
 *
 * Do not fake scientific precision. These evidence types show what actually
 * happened in learning activities. The backend will eventually determine what
 * counts as evidence - the UI just displays it honestly.
 *
 * We explicitly avoid:
 * - IQ scores
 * - Personality type labels
 * - Pseudo-scientific "learning style" claims
 * - Mental health assessments
 *
 * Evidence is behavioral: what the child did, not who they "are".
 */
