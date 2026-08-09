import {
  Award,
  Backpack,
  BookOpen,
  Code2,
  BrainCircuit,
  Compass,
  FlaskConical,
  Globe2,
  GraduationCap,
  Hammer,
  Home,
  MessagesSquare,
  Network,
  Palette,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FileRouteTypes } from "@/routeTree.gen";

export interface NavItem {
  to: FileRouteTypes["to"];
  label: string;
  icon: LucideIcon;
  /** One-line orientation used by the larger, younger navigation modes. */
  hint?: string;
}

/**
 * World-oriented navigation.
 *
 * These are places in the world, not modules in an LMS. Order matters: it is
 * the mental map of the product, and the youngest mode simply shows fewer of
 * them, larger — never a different structure.
 */
export const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home, hint: "Where you arrive" },
  { to: "/world", label: "Worlds", icon: Globe2, hint: "Regions to travel to" },
  { to: "/missions", label: "Missions", icon: Target, hint: "Work with a story around it" },
  { to: "/create", label: "Create", icon: Hammer, hint: "Nine studios: make something real" },
  { to: "/learn", label: "Skills", icon: GraduationCap, hint: "What you're getting good at" },
  { to: "/portfolio", label: "Portfolio", icon: Backpack, hint: "Things you finished" },
  { to: "/characters", label: "Characters", icon: Sparkles, hint: "The people here" },
  { to: "/achievements", label: "Achievements", icon: Award, hint: "Proof, not points" },
];

/** Everything else lives behind a single "more places" group. */
export const SECONDARY_NAV: NavItem[] = [
  { to: "/curriculum", label: "Skill Graph", icon: Network },
  { to: "/practice", label: "Practice", icon: Repeat2 },
  { to: "/english", label: "English", icon: MessagesSquare },
  { to: "/code", label: "Code Lab", icon: Code2 },
  { to: "/ai", label: "AI Literacy", icon: BrainCircuit },
  { to: "/stories", label: "Stories", icon: BookOpen },
  { to: "/simulations", label: "Simulations", icon: FlaskConical },
  { to: "/challenges", label: "Challenges", icon: Swords },
  { to: "/community", label: "Community", icon: Users },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/onboarding", label: "Enter the world", icon: Wand2 },
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/parents", label: "Parents", icon: Compass },
  { to: "/safety", label: "Safety", icon: ShieldCheck },
  { to: "/design-system", label: "Design System", icon: Palette },
];

export const NAV_ITEMS: NavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV];
