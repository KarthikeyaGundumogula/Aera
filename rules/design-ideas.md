# 1.Framehouse — Presence Layer System (v1)

## 🧠 Overview

Presence Layers are a **controlled cinematic theming system** applied to user profiles.

They are:

* Created **only by Originals (studios)**
* Applied by users to express alignment with a release
* Designed to enable **network-wide visual presence shifts**

---

## 🎯 Core Philosophy

* Presence ≠ customization
* Presence = **visible cultural alignment**

The system does NOT decide what is important.

Instead:

> **Adoption = signal**
> **Velocity = momentum**
> **Visibility = dominance**

---

## 🧩 What is a Presence Layer?

A Presence Layer is a **UI configuration object** that defines:

* Visual assets (background, textures)
* Color system
* UI styling rules
* Effects and atmosphere

---

## 📦 Presence Layer Structure

### Example Config

```json
{
  "id": "dune_v1",
  "created_by": "original_dune",

  "assets": {
    "background": "/assets/dune/bg.jpg",
    "overlay_texture": "/assets/dune/dust.png",
    "gradient": "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.9))"
  },

  "colors": {
    "primary": "#E6C089",
    "accent": "#C89B5A",
    "text": "#F5E6C8",
    "muted_text": "#C2A97A"
  },

  "effects": {
    "grain": true,
    "blur": 8,
    "vignette": true
  }
}
```

---

## 🎨 Asset Pack (Uploaded by Original)

### Required Structure

```
/presence-pack/
  ├── bg.jpg
  ├── overlay.png
  ├── config.json
```

### Optional Assets

```
  ├── video.mp4        (future cinematic background)
  ├── noise.webm       (animated grain)
  ├── glow.png         (light effects)
```

---

## ⚙️ Frontend Application

### Step 1: User Selection

```js
user.active_presence_layer_id = "dune_v1"
```

---

### Step 2: Fetch Layer

```
GET /presence-layer/:id
```

---

### Step 3: Apply via CSS Variables

```css
:root {
  --fh-bg: url('/assets/dune/bg.jpg');
  --fh-primary: #E6C089;
  --fh-accent: #C89B5A;
  --fh-text: #F5E6C8;
}
```

---

### Step 4: Background Composition

```css
.profile {
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.9)),
    url('/assets/dune/dust.png'),
    var(--fh-bg);

  background-size: cover;
  background-blend-mode: overlay;
}
```

---

### Step 5: UI Styling

```css
.title {
  color: var(--fh-text);
  letter-spacing: 2px;
}

.stats {
  color: var(--fh-primary);
}
```

---

## 🎬 Design Principles (Critical)

### 1. Art Direction First

* Cinematic consistency > random visuals
* Strong theme identity (e.g. desert, neon, noir)

---

### 2. Layered Depth

* Background + texture + gradient
* Avoid flat visuals

---

### 3. Controlled Theming

Allowed:

* Colors
* Backgrounds
* Effects

Not allowed:

* Layout breaking changes
* DOM manipulation

---

### 4. Readability Safety

* Dark gradients for text zones
* Contrast rules enforced

---

## 🔥 Example: “Dune” Presence Layer

### Visual Traits

* Sand / amber / gold palette
* Dust textures
* Warm cinematic lighting
* Slight desaturation

### Emotional Output

> Feels like stepping into a desert world

---

## 🚀 Original Upload Flow

1. Go to **Create Presence Layer**
2. Upload:

   * Background image
   * Optional overlays
3. System auto-extracts colors (optional)
4. Preview on profile mock
5. Publish

---

## 💡 Smart Features (Recommended)

### 1. Auto Color Extraction

* Detect dominant + accent colors from background

---

### 2. Layer Intensity Control

```json
"intensity_default": 0.85
```

User can adjust:

* 100% → full cinematic
* 60% → balanced
* 30% → subtle

---

### 3. Safe Zones

* Protect text readability
* Prevent UI breakage

---

## 📈 System Outcome

When many users apply the same layer:

* Profiles visually align
* Feed transforms
* Presence becomes **visible at scale**

---

## 🧠 Final Insight

Presence Layers are NOT:

* Themes
* Skins
* Decorations

They are:

> **A standardized, scalable way to express and measure cultural presence across a network**

---

## 🔮 Future Extensions

* Animated layers (video / WebGL)
* Time-based layers (release events)
* Reactive layers (scroll / interaction)
* Remix / fork system (later phase)

---

## 🎯 Conclusion

This system enables:

* Originals → distribute presence
* Users → express alignment
* Platform → measure cultural momentum

> Framehouse becomes a **visual engine of presence propagation**
