# TODO

## 🚨 Critical Issues

### Build System
- ✅ **Fixed Build Script**: Template literal syntax error in `scripts/build.js` line 25
  - Issue: Invalid escape sequences in template literals
  - Status: **RESOLVED** - Build now works correctly

## 🔧 Immediate Fixes Needed

### Recipe Content
- **Fix Recipe Parser**: Recipes have inconsistent markdown indentation, allow that, so our recipes don't have to be strict.
  - `banana-bread.md`: Ingredients and instructions are over-indented
  - `chocolate-chip-cookies.md`: Similar indentation issues
  - `classic-pancakes.md`: Instructions formatting
  - `spaghetti-bolognese.md`: Content structure
  - `tomato-soup.md`: Formatting inconsistencies

### Frontend Functionality
- **Add Loading States**: Show loading indicators when fetching recipes
- **Error Handling**: Graceful handling of failed recipe loads
- **URL State Management**: Browser back/forward button support
- **Deep Linking**: Direct links to specific recipes

## 🚀 Enhancement Opportunities

### Recipe Management
- **Recipe Metadata**: Add cooking time, difficulty, servings
- **Recipe Images**: Optional image support in frontmatter (might just not use images, you know what it looks like if you googled it and ended up here, if not, you can click a link on our page to someone's garbage ad filled hellsite)
- **Recipe Categories**: Better tag organization and filtering
- **Recipe Search**: Full-text search across ingredients and instructions
- **Recipe Ratings**: User ratings and reviews system

### User Experience
- **Print Styles**: CSS for recipe printing
- **Recipe Scaling**: Adjust ingredient quantities **GOOD**
- **Unit Conversion**: Metric/imperial toggle
- **Recipe Sharing**: Social media sharing buttons

### Technical Improvements
- **Performance**: Lazy loading for large recipe lists
- **Caching**: Service worker for offline access
- **Analytics**: Basic usage tracking
- **SEO**: Generate sitemap.xml and robots.txt
- **Open Graph**: Social media preview tags

### Content Expansion
- **Recipe Count**: Scale from 10 to 500 recipes
- **Recipe Sources**: Attribution and links to original sources
- **Recipe Variations**: Alternative versions of recipes
- **Seasonal Content**: Holiday and seasonal recipe collections
- **Dietary Filters**: Vegetarian, vegan, gluten-free, etc.

## 📋 Development Tasks

### Phase 1: Fix Critical Issues
1. ✅ Fix build script template literal syntax
2. Correct recipe markdown formatting
3. ✅ Test build and deployment pipeline
4. Verify GitHub Pages deployment

### Phase 2: Core Improvements
1. Add error handling and loading states
2. Implement URL state management
3. Add print-friendly CSS
4. Improve mobile navigation

### Phase 3: Content & Features
1. Add more recipe metadata fields
2. Implement advanced filtering
3. Add recipe images support
4. Create recipe submission workflow

### Phase 4: Scale & Optimize
1. Implement lazy loading
2. Add service worker for offline access
3. Generate SEO files (sitemap, robots.txt)
4. Add analytics and monitoring

## 🎯 Long-term Goals

### Content Strategy
- **500 Recipe Target**: Systematic recipe addition process
- **Quality Control**: Recipe review and testing workflow
- **Content Curation**: Featured and seasonal recipe collections
- **Ingredients search**: Use tags/meta to setup ingredients filters (and maybe other advanced)
- Links to good recipes elsewhere
- **Monetization**: Affiliate links?