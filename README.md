# Recipes

A no-bs recipe site. Just the recipe, no waffle, full viewport design. Built for GitHub Pages with automatic deployment via GitHub Actions.

## Adding Recipes

Drop a new `something.md` in `/recipes/` with:

```md
---
title: Recipe Name
tags: [category, type]
---

# Recipe Name

## Ingredients
- ingredient 1
- ingredient 2

## Instructions
1. Step one
2. Step two
```

Push to main → GitHub Action builds and deploys automatically.

## Setup

1. `npm ci` → `npm run build` locally
2. Push to main
3. Configure GitHub Pages to deploy from Actions workflow

# TODO

## 🚀 Enhancement Opportunities

### Recipe Management
- **Recipe Metadata**: Add cooking time, difficulty, servings
- **Recipe Categories**: Better tag organization and filtering
- **Recipe Search**: Full-text search across ingredients and instructions

### User Experience
- **Print Styles**: CSS for recipe printing
- **Recipe Scaling**: Adjust ingredient quantities **GOOD**
- **Unit Conversion**: Metric/imperial toggle
- **Favourite Recipes**: Faves, localstorage

### Content Expansion
- **Seasonal Content**: Holiday and seasonal recipe collections
- **Dietary Filters**: Vegetarian, vegan, gluten-free, etc.

## 📋 Development Tasks

### Phase 3: Content & Features
1. Add more recipe metadata fields
2. Implement advanced filtering
3. Add recipe images support
4. Create recipe submission workflow

### Phase 4: Scale & Optimize
2. Add service worker for offline access
3. Generate SEO files (sitemap, robots.txt)
