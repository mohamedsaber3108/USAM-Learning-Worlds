# Accessibility Testing Guide

## 🎯 Purpose

This guide provides step-by-step instructions for testing the accessibility of USAM Learning Worlds.

---

## 📋 Testing Checklist

### 1. Keyboard Navigation

**Test all interactive elements:**

- [ ] Tab through the entire page
- [ ] All buttons, links, inputs reachable with Tab
- [ ] Tab order is logical (follows visual order)
- [ ] Shift+Tab moves backward
- [ ] No keyboard traps
- [ ] Skip links appear and work (press Tab on page load)
- [ ] Enter/Space activates buttons
- [ ] Arrow keys work in lists and grids
- [ ] Escape closes modals and menus
- [ ] Focus indicators are visible on all elements

**Keyboard shortcuts:**
- [ ] `/` opens search
- [ ] `h` goes to home (if implemented)
- [ ] `?` shows keyboard shortcuts help
- [ ] `Escape` closes modals

### 2. Screen Reader Testing

**Windows (NVDA - free):**

1. Download NVDA: https://www.nvaccess.org/download/
2. Install and start NVDA (Ctrl+Alt+N)
3. Navigate with:
   - Tab: Move through interactive elements
   - H: Move through headings
   - L: Move through links
   - F: Move through form fields
   - Ctrl: Stop reading

**Test checklist:**
- [ ] Page title is announced
- [ ] Headings are announced with level
- [ ] All images have alt text
- [ ] All buttons have accessible names
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Success messages are announced
- [ ] ARIA landmarks are announced (main, navigation, etc.)
- [ ] Live regions announce dynamic updates

### 3. Color Contrast Testing

**Tools:**
- Chrome DevTools: Lighthouse audit
- Browser extension: axe DevTools
- Online tool: https://webaim.org/resources/contrastchecker/

**Test:**
- [ ] Normal text: 4.5:1 minimum
- [ ] Large text (18px+): 3:1 minimum
- [ ] Buttons and interactive elements: 3:1 minimum
- [ ] Focus indicators: 3:1 minimum

**Expected results:**
- All text passes WCAG AA
- Interactive elements have sufficient contrast
- Focus indicators are visible against all backgrounds

### 4. RTL (Arabic) Testing

**Switch to Arabic:**
1. Click language switcher
2. Select "العربية"
3. Verify layout flips

**Test checklist:**
- [ ] All layouts flip correctly (menus on left, etc.)
- [ ] Text aligns to the right
- [ ] Icons flip appropriately (arrows, chevrons)
- [ ] Logos and symbols don't flip
- [ ] Forms work correctly
- [ ] Navigation flows right-to-left
- [ ] Reading order is correct
- [ ] No overlapping text
- [ ] Numbers display correctly
- [ ] Dates format correctly

### 5. Touch Target Testing

**Tool:** Browser DevTools (responsive mode)

**Test on mobile viewport:**
- [ ] All buttons at least 44x44px
- [ ] Adequate spacing between touch targets (8px minimum)
- [ ] No accidental taps
- [ ] Easy to tap with finger
- [ ] Works in portrait and landscape

### 6. Reduced Motion Testing

**Enable reduced motion:**
- **Windows:** Settings > Accessibility > Visual effects > Animation effects (Off)
- **Mac:** System Preferences > Accessibility > Display > Reduce motion

**Test:**
- [ ] No animations play
- [ ] Page still functional
- [ ] Loading indicators still visible
- [ ] Transitions are instant
- [ ] No motion sickness triggers

### 7. Voice Alternatives Testing

**Test all voice features:**
- [ ] Every voice activity has visual transcript
- [ ] Can type instead of speaking
- [ ] Audio has captions
- [ ] Audio has full transcript available
- [ ] Text-to-speech has visual text
- [ ] Can pause/stop audio
- [ ] Speed controls available

### 8. Age-Appropriate Testing

**8-9 years:**
- [ ] Text size is 16px minimum
- [ ] Simple language in labels
- [ ] Visual feedback for all interactions
- [ ] Large touch targets (48px)
- [ ] Fewer keyboard shortcuts

**10-11 years:**
- [ ] Text size is 14px minimum
- [ ] Standard features available
- [ ] Touch targets 44px

**12-14 years:**
- [ ] All features available
- [ ] Can customize preferences
- [ ] Advanced keyboard shortcuts

---

## 🛠️ Testing Tools

### Browser Extensions

**Chrome:**
- **axe DevTools** - https://chrome.google.com/webstore/detail/axe-devtools-web-accessibility-testing/lhdoppojpmngadmnindnejefpokejbdd
- **WAVE** - https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh
- **Lighthouse** - Built into Chrome DevTools

**Firefox:**
- **axe DevTools** - https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/
- **WAVE** - https://addons.mozilla.org/en-US/firefox/addon/wave-accessibility-tool/

### Screen Readers

- **NVDA** (Windows, free) - https://www.nvaccess.org/
- **JAWS** (Windows, paid) - https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver** (Mac/iOS, built-in) - Cmd+F5 to enable
- **TalkBack** (Android, built-in) - Settings > Accessibility

### Color Contrast Checkers

- **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
- **Contrast Ratio** - https://contrast-ratio.com/
- **Colorable** - https://colorable.jxnblk.com/

### Automated Testing

```bash
# Install dependencies
npm install -D @axe-core/playwright pa11y

# Run tests
npm run test:a11y
```

---

## 🎯 Manual Test Scenarios

### Scenario 1: Complete a Mission (Keyboard Only)

1. Start with keyboard only (hide mouse)
2. Tab to "Missions" link, press Enter
3. Tab to first mission, press Enter
4. Tab through mission briefing
5. Tab to "Start Mission", press Enter
6. Complete activity using only keyboard
7. Tab to "Submit", press Enter
8. Verify success message is announced
9. Tab to "Next Activity" or "Complete Mission"

**Pass criteria:**
- Can complete entire mission without mouse
- Focus indicators always visible
- Logical tab order
- All actions accessible

### Scenario 2: Create Project (Screen Reader)

1. Start screen reader (NVDA/VoiceOver)
2. Navigate to Projects page
3. Find "Create Project" button
4. Activate button
5. Fill out project form
6. Listen for validation errors
7. Submit form
8. Verify success announcement

**Pass criteria:**
- All form fields have labels
- Errors are announced
- Success is announced
- Can navigate entire form with screen reader

### Scenario 3: RTL Navigation (Arabic)

1. Switch to Arabic
2. Navigate through all pages
3. Test all menus and dropdowns
4. Fill out a form
5. Test navigation breadcrumbs

**Pass criteria:**
- Layout flips correctly
- No overlapping text
- All functionality works
- Reading order is correct

### Scenario 4: Parent Dashboard (All Devices)

1. Test on desktop (large screen)
2. Test on tablet (iPad)
3. Test on mobile (iPhone)
4. Test in portrait and landscape

**Pass criteria:**
- Responsive layouts work
- Touch targets adequate
- Text readable on all sizes
- No horizontal scroll

---

## 📊 Expected Results

### WCAG 2.1 Level AA Compliance

**Perceivable:**
- [x] Text alternatives for images
- [x] Captions for audio/video
- [x] Content adaptable (can be presented different ways)
- [x] Distinguishable (color not sole means, contrast sufficient)

**Operable:**
- [x] Keyboard accessible
- [x] No keyboard traps
- [x] Enough time to interact
- [x] No seizure triggers (no flashing)
- [x] Navigable (skip links, descriptive titles, visible focus)

**Understandable:**
- [x] Readable language
- [x] Predictable behavior
- [x] Input assistance (labels, error messages, suggestions)

**Robust:**
- [x] Compatible with assistive technologies
- [x] Valid HTML
- [x] Proper ARIA usage

---

## 🐛 Common Issues and Fixes

### Issue: Focus not visible

**Fix:**
```css
*:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

### Issue: Button has no accessible name

**Fix:**
```tsx
// ❌ Bad
<button><X /></button>

// ✅ Good
<button aria-label="Close"><X aria-hidden /></button>
```

### Issue: Form input not labeled

**Fix:**
```tsx
// ❌ Bad
<input placeholder="Email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" />
```

### Issue: Image missing alt text

**Fix:**
```tsx
// ❌ Bad
<img src="logo.png" />

// ✅ Good - Decorative
<img src="logo.png" alt="" />

// ✅ Good - Informative
<img src="user.jpg" alt="User profile photo" />
```

### Issue: Dynamic content not announced

**Fix:**
```tsx
// ❌ Bad
<div>{message}</div>

// ✅ Good
<div role="status" aria-live="polite">
  {message}
</div>
```

### Issue: RTL layout broken

**Fix:**
```css
/* ❌ Bad - Fixed direction */
.menu {
  float: right;
  margin-left: 1rem;
}

/* ✅ Good - Logical properties */
.menu {
  float: inline-end;
  margin-inline-start: 1rem;
}
```

---

## 📝 Reporting Issues

When you find an accessibility issue:

1. **Document it:**
   - What's the issue?
   - Where is it? (page, component)
   - How to reproduce?
   - What's the expected behavior?

2. **Severity:**
   - **Critical**: Blocks all users of assistive tech
   - **High**: Blocks some users
   - **Medium**: Makes it difficult but not impossible
   - **Low**: Minor inconvenience

3. **Create GitHub issue:**
   - Title: [a11y] Brief description
   - Label: `accessibility`
   - Include screenshots/videos if helpful

---

## ✅ Sign-off Checklist

Before marking Phase 18 complete:

- [ ] All keyboard navigation tests pass
- [ ] All screen reader tests pass
- [ ] All color contrast tests pass
- [ ] RTL (Arabic) works correctly
- [ ] Touch targets adequate on mobile
- [ ] Reduced motion works
- [ ] Voice alternatives provided
- [ ] Age-appropriate patterns implemented
- [ ] Automated tests pass
- [ ] Manual tests pass
- [ ] No critical or high severity issues

---

*Last updated: August 10, 2026*
