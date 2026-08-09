/**
 * Phase 20: Creation Tools
 *
 * Game, Art, Animation, and Presentation creation tools
 */

import type { ID, ISODate, AgeBand } from "@/types/domain";

/* ================================ GAME CREATION ================================ */

export interface GameProject {
  id: ID;
  title: string;
  genre: GameGenre;
  template?: GameTemplate;
  assets: GameAsset[];
  scenes: GameScene[];
  scripts: GameScript[];
  settings: GameSettings;
  published: boolean;
}

export type GameGenre =
  | "platformer"
  | "puzzle"
  | "adventure"
  | "educational"
  | "story"
  | "rhythm"
  | "quiz";

export interface GameTemplate {
  id: ID;
  name: string;
  genre: GameGenre;
  description: string;
  thumbnail: string;
  defaultScenes: Partial<GameScene>[];
  ageBands: AgeBand[];
}

export interface GameAsset {
  id: ID;
  type: "sprite" | "background" | "sound" | "music";
  name: string;
  url: string;
  metadata: Record<string, unknown>;
}

export interface GameScene {
  id: ID;
  name: string;
  order: number;
  background?: ID; // Asset ID
  objects: GameObject[];
  scripts: ID[]; // Script IDs
}

export interface GameObject {
  id: ID;
  type: "sprite" | "text" | "button" | "trigger";
  name: string;
  spriteId?: ID;
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, unknown>;
  behaviors: GameBehavior[];
}

export interface GameBehavior {
  id: ID;
  type: "movement" | "collision" | "animation" | "sound" | "score";
  trigger: "always" | "on-click" | "on-collision" | "on-key";
  action: string;
  parameters: Record<string, unknown>;
}

export interface GameScript {
  id: ID;
  name: string;
  language: "blocks" | "javascript";
  code: string;
  events: GameEvent[];
}

export interface GameEvent {
  id: ID;
  trigger: string;
  actions: string[];
}

export interface GameSettings {
  width: number;
  height: number;
  fps: number;
  physics: boolean;
  gravity?: number;
}

/* ================================ ART CREATION ================================ */

export interface ArtProject {
  id: ID;
  title: string;
  type: ArtType;
  canvas: ArtCanvas;
  layers: ArtLayer[];
  history: ArtAction[];
  published: boolean;
}

export type ArtType = "drawing" | "painting" | "pixel-art" | "digital-art" | "collage";

export interface ArtCanvas {
  width: number;
  height: number;
  background: string; // color or pattern
}

export interface ArtLayer {
  id: ID;
  name: string;
  order: number;
  visible: boolean;
  opacity: number; // 0-1
  blendMode: "normal" | "multiply" | "screen" | "overlay";
  content: string; // data URL or path
}

export interface ArtAction {
  id: ID;
  tool: ArtTool;
  timestamp: ISODate;
  data: Record<string, unknown>;
}

export type ArtTool =
  | "brush"
  | "pencil"
  | "eraser"
  | "fill"
  | "line"
  | "shape"
  | "text"
  | "selection"
  | "eyedropper";

export interface ArtToolSettings {
  tool: ArtTool;
  color: string;
  size: number;
  opacity: number;
  smoothing?: number;
}

/* ================================ ANIMATION CREATION ================================ */

export interface AnimationProject {
  id: ID;
  title: string;
  type: AnimationType;
  fps: number;
  duration: number; // seconds
  frames: AnimationFrame[];
  timeline: Timeline;
  assets: AnimationAsset[];
  published: boolean;
}

export type AnimationType = "frame-by-frame" | "tweened" | "sprite-animation" | "stop-motion";

export interface AnimationFrame {
  id: ID;
  order: number;
  duration: number; // ms
  layers: AnimationLayer[];
}

export interface AnimationLayer {
  id: ID;
  name: string;
  type: "sprite" | "shape" | "text";
  visible: boolean;
  keyframes: Keyframe[];
}

export interface Keyframe {
  id: ID;
  frame: number;
  properties: {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    opacity: number;
  };
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

export interface Timeline {
  currentFrame: number;
  totalFrames: number;
  playing: boolean;
  loop: boolean;
  markers: TimelineMarker[];
}

export interface TimelineMarker {
  id: ID;
  frame: number;
  label: string;
  color: string;
}

export interface AnimationAsset {
  id: ID;
  type: "sprite" | "sound" | "background";
  name: string;
  url: string;
}

/* ================================ PRESENTATION CREATION ================================ */

export interface PresentationProject {
  id: ID;
  title: string;
  theme: PresentationTheme;
  slides: PresentationSlide[];
  notes: SpeakerNotes;
  settings: PresentationSettings;
  published: boolean;
}

export interface PresentationTheme {
  id: ID;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  template: string;
}

export interface PresentationSlide {
  id: ID;
  order: number;
  layout: SlideLayout;
  elements: SlideElement[];
  transition?: SlideTransition;
  notes?: string;
}

export type SlideLayout =
  | "title"
  | "title-content"
  | "two-column"
  | "image-text"
  | "full-image"
  | "blank";

export interface SlideElement {
  id: ID;
  type: "text" | "image" | "video" | "shape" | "chart" | "code";
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, unknown>;
  animation?: ElementAnimation;
}

export interface ElementAnimation {
  entrance?: "fade" | "slide" | "zoom" | "flip";
  emphasis?: "pulse" | "bounce" | "shake";
  exit?: "fade" | "slide" | "zoom" | "flip";
  delay: number; // ms
  duration: number; // ms
}

export interface SlideTransition {
  type: "none" | "fade" | "slide" | "wipe" | "zoom";
  duration: number; // ms
}

export interface SpeakerNotes {
  [slideId: string]: string;
}

export interface PresentationSettings {
  autoAdvance: boolean;
  autoAdvanceDelay?: number; // seconds
  showNotes: boolean;
  showTimer: boolean;
  duration?: number; // estimated minutes
}

/* ================================ SERVICE INTERFACES ================================ */

export interface GameCreationService {
  createGame(title: string, genre: GameGenre, template?: ID): Promise<GameProject>;
  getGame(id: ID): Promise<GameProject | null>;
  listTemplates(genre?: GameGenre): Promise<GameTemplate[]>;

  // Assets
  addAsset(gameId: ID, asset: Omit<GameAsset, "id">): Promise<GameAsset>;
  listAssets(gameId: ID, type?: string): Promise<GameAsset[]>;

  // Scenes
  addScene(gameId: ID, scene: Omit<GameScene, "id">): Promise<GameScene>;
  updateScene(gameId: ID, sceneId: ID, updates: Partial<GameScene>): Promise<void>;

  // Objects
  addObject(gameId: ID, sceneId: ID, object: Omit<GameObject, "id">): Promise<GameObject>;
  updateObject(gameId: ID, sceneId: ID, objectId: ID, updates: Partial<GameObject>): Promise<void>;

  // Test & Publish
  testGame(gameId: ID): Promise<string>; // Returns play URL
  publishGame(gameId: ID): Promise<void>;
}

export interface ArtCreationService {
  createArt(title: string, type: ArtType, dimensions: { width: number; height: number }): Promise<ArtProject>;
  getArt(id: ID): Promise<ArtProject | null>;

  // Layers
  addLayer(artId: ID, name: string): Promise<ArtLayer>;
  updateLayer(artId: ID, layerId: ID, updates: Partial<ArtLayer>): Promise<void>;
  deleteLayer(artId: ID, layerId: ID): Promise<void>;

  // Drawing
  recordAction(artId: ID, action: Omit<ArtAction, "id">): Promise<void>;
  undo(artId: ID): Promise<void>;
  redo(artId: ID): Promise<void>;

  // Export
  exportArt(artId: ID, format: "png" | "jpg" | "svg"): Promise<string>; // Returns URL
  publishArt(artId: ID): Promise<void>;
}

export interface AnimationCreationService {
  createAnimation(title: string, type: AnimationType, fps: number): Promise<AnimationProject>;
  getAnimation(id: ID): Promise<AnimationProject | null>;

  // Frames
  addFrame(animationId: ID, order: number): Promise<AnimationFrame>;
  duplicateFrame(animationId: ID, frameId: ID): Promise<AnimationFrame>;
  deleteFrame(animationId: ID, frameId: ID): Promise<void>;

  // Layers
  addLayer(animationId: ID, name: string, type: string): Promise<AnimationLayer>;
  addKeyframe(animationId: ID, layerId: ID, frame: number, properties: Keyframe["properties"]): Promise<Keyframe>;

  // Playback
  play(animationId: ID): Promise<void>;
  stop(animationId: ID): Promise<void>;
  exportAnimation(animationId: ID, format: "gif" | "mp4" | "webm"): Promise<string>; // Returns URL
  publishAnimation(animationId: ID): Promise<void>;
}

export interface PresentationCreationService {
  createPresentation(title: string, theme: ID): Promise<PresentationProject>;
  getPresentation(id: ID): Promise<PresentationProject | null>;
  listThemes(): Promise<PresentationTheme[]>;

  // Slides
  addSlide(presentationId: ID, layout: SlideLayout, order: number): Promise<PresentationSlide>;
  updateSlide(presentationId: ID, slideId: ID, updates: Partial<PresentationSlide>): Promise<void>;
  deleteSlide(presentationId: ID, slideId: ID): Promise<void>;
  reorderSlides(presentationId: ID, order: ID[]): Promise<void>;

  // Elements
  addElement(presentationId: ID, slideId: ID, element: Omit<SlideElement, "id">): Promise<SlideElement>;
  updateElement(presentationId: ID, slideId: ID, elementId: ID, updates: Partial<SlideElement>): Promise<void>;

  // Speaker notes
  updateNotes(presentationId: ID, slideId: ID, notes: string): Promise<void>;

  // Present & Export
  startPresentation(presentationId: ID): Promise<string>; // Returns present URL
  exportPresentation(presentationId: ID, format: "pdf" | "video"): Promise<string>; // Returns URL
  publishPresentation(presentationId: ID): Promise<void>;
}

/**
 * CRITICAL: Creation Tools Principles
 *
 * ✅ Age-appropriate tools
 * ✅ Safe default assets
 * ✅ Templates for guidance
 * ✅ Undo/redo support
 * ✅ Save progress frequently
 * ✅ Export in multiple formats
 * ✅ Publish with moderation
 * ✅ Parent visibility
 *
 * Empowering creative expression through structured tools.
 */
