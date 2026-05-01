Build a **production-quality typeahead (autocomplete) search component** in React for a film library application.

## 🎯 Goal

Create a search input that:

* Shows live suggestions while typing
* Feels smooth and responsive
* Avoids unnecessary API calls
* Handles race conditions correctly
* Is scalable for future ranking systems (like presence score)

---

## ⚙️ Core Requirements

### 1. Controlled Input

* Use `useState` for input value (`query`)
* Update on every keystroke

---

### 2. Debounced Search (MANDATORY)

* Implement debounce manually using `useEffect` + `setTimeout`
* Delay: **300ms**
* Clear timeout on every re-render

Maintain:

* `query` → immediate input
* `debouncedQuery` → triggers API

---

### 3. API Integration

Call endpoint:

```
GET /search/suggestions?q=<query>
```

Rules:

* Do NOT call API if `debouncedQuery.length < 2`
* Use `AbortController` to cancel previous requests
* Ensure stale responses do NOT override latest results

---

### 4. State Management

Maintain:

* `query`
* `debouncedQuery`
* `results` (grouped: films, artists)
* `loading`
* `error` (optional but recommended)

---

### 5. Race Condition Handling (CRITICAL)

* If user types fast:

  * Cancel previous request before making a new one
* Only update UI from the **latest request**
* Prevent flickering or outdated results

---

### 6. UI Behavior

#### Dropdown

* Show suggestions below input
* Only visible when:

  * `debouncedQuery.length >= 2`
  * AND input is focused

#### Sections

* 🎬 Films
* 🎭 Artists

#### Each item:

* Click → navigates to detail page (stub handler is fine)
* Highlight matching substring from query

---

### 7. UX Enhancements (IMPORTANT)

* Show **loading indicator** while fetching
* Show **"No results found"** when empty
* Add **minimum input length = 2**
* Add **keyboard navigation**:

  * ↑ ↓ to move
  * Enter to select
  * Esc to close dropdown

---

### 8. Performance Considerations

* Avoid unnecessary re-renders
* Use `useMemo` / `useCallback` where appropriate
* Keep component modular:

  * `SearchInput`
  * `SearchDropdown`
  * `SearchItem`

---

### 9. Highlight Matching Text

Example:

* Query: `inte`
* Result: `Interstellar`
* Render: **Inte**rstellar (highlight matched part)

---

### 10. Edge Cases (DO NOT IGNORE)

* Fast typing (race conditions)
* Empty input (clear results)
* API failure (graceful fallback)
* Duplicate results across categories
* Very slow network

---

## 🧱 Expected Output

Provide:

1. Full React component code (functional components with hooks)
2. Clean, readable structure (not overly abstracted)
3. Minimal styling (basic CSS or inline styles is fine)
4. Comments explaining key logic (debounce, cancellation, etc.)

---

## 🚫 Constraints

* Do NOT use external debounce libraries
* Do NOT use heavy state libraries (Redux, etc.)
* Keep it lightweight and idiomatic React
* Assume backend already exists

---

## 🧠 Intent

This component should feel:

* Instant
* Stable
* Predictive (not laggy or glitchy)

Avoid:

* API spam
* UI flicker
* Outdated results showing

Think of it as a **high-quality search experience**, not just a basic input field.
