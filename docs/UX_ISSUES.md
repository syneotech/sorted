# UX Issues & Improvement Opportunities

This document tracks current UX issues and planned improvements for the Sorted app.

## Critical Issues

### 1. Search Relevance Problem (Priority: HIGH)

**Problem**: Searching for a specific cuisine (e.g., "Chinese") returns generic results including unrelated restaurants (e.g., South Indian restaurants that happen to serve one Chinese dish).

**Impact**: Users cannot reliably find restaurants matching their search intent.

**Current Behavior**:
```
Search: "Chinese"
Results:
  1. Meghana Foods (Andhra, Biryani) ❌ Not Chinese
  2. Empire Restaurant (Biryani, North Indian) ❌ Not Chinese
  3. Chung Wah (Chinese) ✓ Correct
  4. A2B (South Indian) ❌ Not Chinese
  5. Mainland China (Chinese) ✓ Correct
```

**Expected Behavior**:
```
Search: "Chinese"
Results:
  1. Mainland China (Chinese) ✓
  2. Chung Wah (Chinese) ✓
  3. Wok Express (Chinese) ✓
  4. Empire Restaurant (has Chinese items) ⚠️ Lower priority
  5. Meghana Foods (no Chinese) ❌ Should not appear or be last
```

**Solution**: Implement cuisine-aware relevance scoring (Phase 2).

---

### 2. No Filtering Options (Priority: HIGH)

**Problem**: Users cannot filter results by criteria important to them (veg/non-veg, rating, price range).

**Impact**: Users with dietary restrictions or budget constraints cannot efficiently find suitable restaurants.

**Current State**: Only basic tabs (All, Matched, Swiggy Only, Zomato Only).

**Needed Filters**:
- [ ] Cuisine type (multi-select)
- [ ] Veg/Non-veg
- [ ] Price range (₹, ₹₹, ₹₹₹)
- [ ] Rating (4+, 3.5+, 3+)
- [ ] Delivery time (<30 min, <45 min)
- [ ] Available on both platforms

**Solution**: Implement filter system (Phase 3).

---

### 3. No Sorting Options (Priority: HIGH)

**Problem**: Results appear in an undefined order (order returned by APIs).

**Impact**: Users cannot prioritize results by what matters most to them.

**Needed Sort Options**:
- [ ] Relevance (default)
- [ ] Rating (high to low)
- [ ] Price (low to high / high to low)
- [ ] Delivery time (fastest first)
- [ ] Savings potential (biggest savings first)

**Solution**: Implement sorting system (Phase 3).

---

## Moderate Issues

### 4. Loading States (Priority: MEDIUM)

**Problem**: During search, users see a generic loading spinner with no indication of progress.

**Current State**: Simple "Loading..." text.

**Improvement**:
- [ ] Skeleton cards showing expected layout
- [ ] Progress indicator for multi-step loading
- [ ] Platform-specific loading indicators

---

### 5. Error Handling (Priority: MEDIUM)

**Problem**: When one platform fails, error messages are not user-friendly.

**Current State**: Generic error or silent failure.

**Improvement**:
- [ ] Clear error messages explaining what went wrong
- [ ] Partial results shown with disclaimer
- [ ] Retry button for failed requests

---

### 6. Empty State (Priority: MEDIUM)

**Problem**: When no results are found, the page shows minimal feedback.

**Improvement**:
- [ ] Friendly illustration
- [ ] Suggestions (try different query, check location)
- [ ] Popular searches in the area

---

### 7. Mobile Responsiveness (Priority: MEDIUM)

**Problem**: Layout not optimized for mobile devices.

**Issues**:
- Cards too wide on small screens
- Filter tabs overflow horizontally
- Menu comparison table hard to read
- Touch targets too small

**Improvement**:
- [ ] Single column card layout on mobile
- [ ] Bottom sheet for filters
- [ ] Horizontal scroll for menu comparison
- [ ] Larger touch targets

---

## Minor Issues

### 8. Visual Hierarchy (Priority: LOW)

**Problem**: Price comparison information doesn't stand out enough.

**Improvement**:
- [ ] More prominent savings badge
- [ ] Color coding for better/worse prices
- [ ] Visual chart for price differences

---

### 9. Location Picker (Priority: LOW)

**Problem**: Limited city support, no locality-level selection.

**Current Cities**: Bangalore, Mumbai, Delhi, Chennai, Hyderabad, Pune, Kolkata.

**Improvement**:
- [ ] Add more cities
- [ ] Allow locality/area selection
- [ ] Save preferred location

---

### 10. Accessibility (Priority: LOW)

**Problem**: Limited accessibility features.

**Improvement**:
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast improvements

---

## UX Improvement Roadmap

### Phase 2: Relevance (addresses #1)
- Cuisine-aware scoring
- Search intent detection
- Results sorted by relevance

### Phase 3: Filtering & Sorting (addresses #2, #3)
- Comprehensive filter system
- Multiple sort options
- Filter persistence in URL

### Phase 4: UI Redesign (addresses #4, #5, #6, #7, #8)
- Skeleton loading states
- Error state components
- Empty state component
- Mobile-first responsive design
- Improved visual hierarchy

### Phase 5: Polish (addresses #9, #10)
- Extended location support
- Accessibility audit
- Performance optimization

---

## User Feedback Themes

Based on hypothetical user testing:

1. **"I searched for Chinese but got mostly biryani places"** → Relevance issue
2. **"I want to see only veg restaurants"** → Missing filters
3. **"Which restaurant is actually cheaper?"** → Price comparison clarity
4. **"The app is slow on my phone"** → Mobile performance
5. **"I can't tell which platform has the better deal"** → Visual hierarchy

---

## Metrics to Track

Once improvements are implemented, track:

1. **Search Success Rate**: % of searches leading to restaurant clicks
2. **Filter Usage**: Which filters are most used
3. **Sort Usage**: Which sort options are most popular
4. **Bounce Rate**: Users who leave without interaction
5. **Mobile vs Desktop**: Usage patterns by device

---

## Screenshots

Screenshots documenting current UX issues should be placed in `docs/screenshots/`:

- `search-results-irrelevant.png` - Irrelevant search results
- `mobile-layout-issues.png` - Mobile responsiveness problems
- `loading-state-current.png` - Current loading state
- `error-state-current.png` - Current error handling

*(Screenshots to be captured during Phase 1.4)*
