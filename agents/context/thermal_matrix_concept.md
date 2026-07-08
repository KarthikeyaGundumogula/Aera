# 1D Thermal Matrix Concept

*Note: This is a concept saved for future refinement of the Resonance Signature visual identity.*

If the goal is a heat map, a traditional 2D grid won't work because it requires querying thousands of individual data points, which breaks the $O(1)$ performance requirement.

To achieve a true heat map aesthetic using only the three pre-calculated variables, we can implement a **1D Thermal Matrix** (a horizontal heat strip).

Instead of plotting individual users, we render a single horizontal block where the CSS gradient acts as a thermal signature. It calculates the color temperature, density, and distribution strictly from the aggregate table.

---

### Concept: The Thermal Matrix

The UI displays a fixed-width horizontal bar. The gradient inside this bar shifts dynamically based on the three metrics, creating a literal "heat" signature of the film's reception.

#### 1. Average Surge Density = Total Thermal Mass (Illumination)

* **The Mechanic:** ASD determines how much of the bar is "hot" (illuminated) versus "cold" (black/empty).
* **Technical Execution:** If ASD is 80%, 80% of the gradient stops are populated with color. If ASD is 30%, the majority of the bar is black space, with only narrow bands of heat.

#### 2. Surge Spread = Heat Distribution (Gradient Stops)

* **The Mechanic:** Spread dictates *where* the heat is located on the strip.
* **Technical Execution:**
  * **Universal (< 0.3):** The heat is tightly packed into a massive, solid, unbroken core in the center of the bar.
  * **Distinct (0.3 – 0.6):** The heat is distributed into smaller, distinct clusters across the bar, separated by thin cold (black) gaps.
  * **Polarizing (> 0.6):** A bimodal distribution. The center of the bar is completely black (cold), with extreme heat clusters pushed entirely to the far left and far right edges.

#### 3. Peak Magnitude = Core Temperature (Color Hex)

* **The Mechanic:** Peak Magnitude defines the maximum color temperature of the hottest spots in the matrix.
* **Technical Execution:**
  * **Low Peak (e.g., < 1500):** The hottest point only reaches dark orange (`#D97706`).
  * **Medium Peak (e.g., 2000 - 4000):** The hottest point reaches bright amber (`#F5A623`).
  * **Massive Peak (e.g., 8000+):** The amber burns out into a blinding white-hot center (`#FFFFFF`), indicating extreme individual resonance.

---

### How it Reads to the User

When a user opens the film page, they don't see a jagged graph; they see a thermal strip that instantly communicates the data.

* **The Crowd-Pleaser (High Density, Universal Spread):**
  `[████████████████████████████████░░░░]`
  A solid, thick, unbroken block of deep amber in the center. Very little black space.
* **The Niche Cult Film (Low Density, Distinct Spread, Massive Peak):**
  `[░░░░░░█░░░░░░░░░░███(White-Hot)░░░░░░░░░░]`
  Mostly black space (cold), but with one or two incredibly thin, blindingly white-hot vertical slivers. It means very few people liked it, but those who did experienced a massive peak.
* **The Polarizing Release (Medium Density, Polarizing Spread):**
  `[█████████░░░░░░░░░░░░░░░░░░░█████████]`
  Bright orange on the extreme left and extreme right, with a completely black void in the middle. The audience is split in half.

### Technical Implementation

This is completely $O(1)$. You fetch the 3 integers and generate a CSS `linear-gradient` directly inline.

```javascript
// Example logic for a Polarizing film
const generateThermalMatrix = (peak, density, spread) => {
  let peakColor = peak > 5000 ? '#FFFFFF' : '#F5A623'; // Core temp based on Peak Magnitude
  
  // Spread logic determines the CSS gradient stops
  if (spread === 'POLARIZING') {
    return `linear-gradient(90deg, 
      ${peakColor} 0%, 
      #E8A838 20%, 
      #000000 40%, 
      #000000 60%, 
      #E8A838 80%, 
      ${peakColor} 100%)`;
  }
  
  // Add other conditionals for 'DISTINCT' and 'UNIVERSAL'
}
```

```css
.thermal-matrix-container {
  width: 100%;
  height: 60px; /* Or whatever fits your layout */
  background: var(--generated-gradient);
  border-radius: 4px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
}
```

This provides a visually striking, data-rich heat map that requires zero complex DOM rendering, no heavy point queries, and perfectly fits a clinical, high-performance UI.
