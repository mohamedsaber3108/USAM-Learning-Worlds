# Performance Optimization Guide

## 🎯 Performance Targets

### Load Time
- **Initial Load**: < 3s on 3G
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Bundle Sizes
- **Initial Bundle**: < 200KB (gzipped)
- **Total JS**: < 500KB (gzipped)
- **Total CSS**: < 50KB (gzipped)
- **Per Route**: < 100KB (gzipped)

### Runtime Performance
- **Frame Rate**: 60fps (16ms per frame)
- **Interaction to Response**: < 100ms
- **Animation**: No jank, GPU-accelerated
- **Memory Usage**: < 100MB on mobile

---

## 📋 Optimization Checklist

### Code Splitting

- [x] Route-based splitting (automatic with TanStack Router)
- [x] Lazy load heavy components
- [x] Dynamic imports for features
- [x] World-specific bundles
- [x] Tool-specific bundles

**Example:**
```typescript
// ✅ Good - Lazy load heavy component
const CodeEditor = lazy(() => import('@/components/coding/CodeEditorShell'));

// ❌ Bad - Load everything upfront
import CodeEditor from '@/components/coding/CodeEditorShell';
```

### Asset Optimization

- [x] Image lazy loading
- [x] Progressive image loading
- [x] Responsive images (srcset)
- [x] Modern formats (WebP/AVIF)
- [ ] Image compression (< 100KB per image)
- [x] Audio lazy loading
- [ ] Font subsetting

**Image optimization:**
```bash
# Convert to WebP
cwebp input.png -q 80 -o output.webp

# Generate multiple sizes
convert input.jpg -resize 400x output-400w.jpg
convert input.jpg -resize 800x output-800w.jpg
convert input.jpg -resize 1200x output-1200w.jpg
```

### Loading States

- [x] Skeleton components for all major features
- [x] Progressive loading (critical first)
- [x] Suspense boundaries
- [x] Error boundaries

**Pattern:**
```typescript
<Suspense fallback={<MissionPageSkeleton />}>
  <MissionPage />
</Suspense>
```

### Responsive Design

- [x] Mobile-first approach
- [x] Breakpoint system
- [x] Responsive typography
- [x] Touch-optimized (44px+ targets)

---

## 🚀 Implementation Guide

### 1. Route-Based Code Splitting

**TanStack Router does this automatically.** Enhance with:

```typescript
// In route file
export const Route = createFileRoute('/coding')({
  component: CodingWorld,
  // Preload on hover
  loader: () => import('@/components/coding/Workbench'),
  // Pending component (skeleton)
  pendingComponent: CodingWorldSkeleton,
  // Error component
  errorComponent: CodingWorldError,
});
```

### 2. Component Lazy Loading

```typescript
// Heavy components
const WorldMapCanvas = lazy(() => import('@/components/curriculum/WorldMapCanvas'));
const CodeEditor = lazy(() => import('@monaco-editor/react'));
const GameCanvas = lazy(() => import('@/components/game/GameCanvas'));

// Use with Suspense
<Suspense fallback={<Skeleton className="h-[400px]" />}>
  <WorldMapCanvas worldId={worldId} />
</Suspense>
```

### 3. Image Optimization

```typescript
// Progressive image
<ProgressiveImage
  src="/images/world.webp"
  placeholder="/images/world-thumb.webp"
  alt="World background"
  aspectRatio="16/9"
/>

// Lazy image
<LazyProgressiveImage
  src="/images/mission.webp"
  alt="Mission background"
  aspectRatio="16/9"
/>
```

### 4. Asset Preloading

```typescript
// Preload critical assets
await preloadAssets({
  images: ['/worlds/coding/bg.webp', '/characters/koda.webp'],
  audio: ['/worlds/coding/ambient.mp3'],
});

// Preload on hover
<Link 
  to="/coding"
  onMouseEnter={() => {
    import('@/components/coding/Workbench');
  }}
>
  Coding World
</Link>
```

### 5. Progressive Loading

```typescript
// Load critical content first
function HomePage() {
  // 1. Load immediately (critical)
  const { data: learner } = useQuery({
    queryKey: queryKeys.learner,
    queryFn: learnerService.getCurrent,
    staleTime: STALE_TIME.FREQUENT,
  });
  
  // 2. Load after critical (high priority)
  const { data: currentMission } = useQuery({
    queryKey: queryKeys.mission(learner?.currentMissionId),
    queryFn: () => missionService.get(learner!.currentMissionId!),
    enabled: !!learner?.currentMissionId,
  });
  
  // 3. Load in background (low priority)
  useIdleLoad(() => {
    preloadImages(['/images/achievement1.webp', '/images/achievement2.webp']);
  });
}
```

### 6. List Optimization

```typescript
// Use react-window for long lists
import { FixedSizeList } from 'react-window';

function MissionList({ missions }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={missions.length}
      itemSize={120}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <MissionCard mission={missions[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}

// Or progressive loading
function MissionList({ missions }) {
  const visibleMissions = useProgressiveLoad(missions, {
    batchSize: 5,
    delay: 100,
  });
  
  return visibleMissions.map(mission => (
    <MissionCard key={mission.id} mission={mission} />
  ));
}
```

### 7. Animation Performance

```css
/* ✅ Good - GPU accelerated */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
  will-change: transform, opacity;
}

/* ❌ Bad - CPU bound */
.animated {
  left: 100px;
  top: 50px;
}
```

---

## 🧪 Testing

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:5173 --view

# Or use Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Click "Generate report"
```

### Bundle Analysis

```bash
# Install bundle analyzer
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ...
    visualizer({ open: true }),
  ],
});

# Build and analyze
npm run build
```

### Performance Monitoring

```typescript
// Web Vitals
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);  // Cumulative Layout Shift
onFID(console.log);  // First Input Delay
onFCP(console.log);  // First Contentful Paint
onLCP(console.log);  // Largest Contentful Paint
onTTFB(console.log); // Time to First Byte
```

---

## 📊 Monitoring

### Metrics to Track

**Load Metrics:**
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

**Runtime Metrics:**
- Frame rate (should be 60fps)
- Memory usage
- Network requests count
- Cache hit rate

**User Metrics:**
- Bounce rate (users leaving immediately)
- Time on site
- Pages per session
- Error rate

### Tools

**Development:**
- Chrome DevTools Performance tab
- React DevTools Profiler
- Lighthouse
- Bundle analyzer

**Production:**
- Google Analytics (page load times)
- Sentry (error tracking + performance)
- LogRocket (session replay + performance)
- Web Vitals API

---

## 🎯 Common Issues and Fixes

### Issue: Large initial bundle

**Solution:**
```typescript
// Split by route
// TanStack Router does this automatically

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Dynamic imports
const loadFeature = async () => {
  const module = await import('./feature');
  return module.default();
};
```

### Issue: Slow image loading

**Solution:**
```typescript
// Use progressive loading
<ProgressiveImage
  src="/large-image.webp"
  placeholder="/thumbnail.webp"
  alt="..."
/>

// Lazy load images
<LazyProgressiveImage src="..." alt="..." />

// Use responsive images
<img
  srcset="
    image-400w.webp 400w,
    image-800w.webp 800w,
    image-1200w.webp 1200w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  src="image-800w.webp"
  alt="..."
/>
```

### Issue: Janky animations

**Solution:**
```css
/* Use transform and opacity (GPU accelerated) */
.smooth {
  transform: translateX(100px);
  opacity: 0.5;
  will-change: transform, opacity;
}

/* Avoid animating expensive properties */
/* ❌ Bad */
.janky {
  width: 200px;
  height: 200px;
  left: 100px;
}

/* ✅ Good */
.smooth {
  transform: translate(100px, 0) scale(2);
}
```

### Issue: Layout shift (CLS)

**Solution:**
```typescript
// Always set dimensions on images
<img
  src="..."
  alt="..."
  width={800}
  height={600}
  // Or use aspect ratio
  style={{ aspectRatio: '16/9' }}
/>

// Reserve space for dynamic content
<Skeleton className="h-[400px]" />

// Use transform for animations (doesn't affect layout)
// ✅ Good
transform: translateY(10px);

// ❌ Bad
margin-top: 10px;
```

### Issue: Slow API responses

**Solution:**
```typescript
// Parallel requests
const [missions, skills] = await Promise.all([
  missionService.list(),
  skillService.list(),
]);

// Cache with React Query
const { data } = useQuery({
  queryKey: ['missions'],
  queryFn: missionService.list,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});

// Optimistic updates
const mutation = useMutation({
  mutationFn: updateMission,
  onMutate: async (newMission) => {
    // Optimistically update cache
    queryClient.setQueryData(['mission', id], newMission);
  },
});
```

---

## ✅ Performance Checklist

Before deploying:

- [ ] Run Lighthouse audit (score > 90)
- [ ] Check bundle sizes (< targets)
- [ ] Test on slow 3G network
- [ ] Test on low-end device
- [ ] Test all breakpoints
- [ ] Verify lazy loading works
- [ ] Check skeleton states
- [ ] Measure Web Vitals
- [ ] No console errors
- [ ] No memory leaks

---

## 📚 Resources

**Tools:**
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)

**Guides:**
- [Web Vitals](https://web.dev/vitals/)
- [Optimize Images](https://web.dev/fast/#optimize-your-images)
- [Code Splitting](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [Lazy Loading](https://web.dev/lazy-loading/)

---

*Last updated: August 10, 2026*
