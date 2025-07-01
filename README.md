make a recipe site that we can add markdown pages, and that parses them to a fixed site as a github action, when new recipes have been pushed. It will have like 500 top recipes eventually, but start with top 10 for now, make them simple, es6 html css, the entire recipe list, filterable, and the js on the client-side can auto-pull in the html file that matches and replace the content by parsing it (I think github pages will allow for that as cors are same domain), it will be hosted via github pages.

The entire point is to just have the recipe, no bullshit, full viewport and a couple of related links might be provided in the markdown. Minimal library usage, use some thin styling to make it look nice. It has to digest well for SEO, but absolutely NO WAFFLE. 

Quick pointers so you can ship pain‑free:

* **Initial setup**

  1. `npm ci` → `npm run build` once locally to be sure it all compiles.
  2. Commit everything (including `package-lock.json`) and push to **main**.
  3. The workflow auto‑creates / updates the `gh-pages` branch and publishes it.

* **GitHub Pages settings**

  * In the repo’s *Settings → Pages*, pick “Deploy from a GitHub Actions workflow.”
  * (Optional) Add a `CNAME` file in `/docs` or use the UI for a custom domain.

* **Adding recipes**

  * Drop a new `something.md` in `/recipes/` with:

    ```md
    ---
    title: Nice Title
    tags: [breakfast, keto]
    description: Optional one‑liner for SEO
    ---

    # Nice Title

    ## Ingredients
    …
    ```

  * Push → Action runs → site updates. No manual steps.

* **Front‑matter keys you can use**

  | key           | purpose                                                                                     |
  | ------------- | ------------------------------------------------------------------------------------------- |
  | `title`       | `<title>` tag & list label                                                                  |
  | `tags`        | array of strings, used by filter / future facets                                            |
  | `description` | if present, will be injected as `<meta name="description">` (add in bulk later if you like) |

* **Scaling to 500 recipes**

  * The JSON list is \~ 1 kB per 10 recipes; even at 500 it’s small (< 50 kB).
  * If needed, chunk or lazy‑load later—list rendering is isolated in `app.js`.

* **Extending build logic**

  * SEO tweaks: generate `sitemap.xml`, `robots.txt`, or OpenGraph tags—just edit `scripts/build.js`.
  * Styling: everything is plain CSS; swap in a CSS reset or utility class lib if you prefer.

* **Runtime notes**

  * JS fetches `/recipes/{slug}.html`; same‑origin so CORS is a non‑issue on Pages.
  * Works when navigating directly to `index.html` (the list) but not to a deep recipe URL—add a 404.html redirect shim if you care about those links.

* **Node version**

  * Workflow uses Node 20—keep your local version close to avoid mismatched package‑lock diffs.

That’s it—commit, push, publish.
