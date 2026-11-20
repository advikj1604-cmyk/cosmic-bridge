# Cosmic Bridge website

Free stargazing sessions for children in Indore. Plain HTML, CSS and JavaScript, no build step.

## Files

- `index.html`: the page
- `css/style.css`: all styles
- `js/main.js`: starfield, Deep Space mode, scroll reveal, mobile menu, contact form
- `assets/`: logo, favicon and share image

## Before you publish

1. In `index.html`, replace `YOUR_EMAIL@example.com` and `[Your phone / WhatsApp]`.
2. Make a free form at https://formspree.io, copy its ID and replace `YOUR_FORM_ID` in `index.html`.
3. Add your photo as `assets/advik.jpg` and swap the placeholder in the About section (there's a comment showing the line to use).

## Put it online with GitHub Pages

1. Create a new repository on GitHub, for example `cosmic-bridge`.
2. Upload all the files in this folder (keep the folders as they are).
3. Go to Settings > Pages, set Source to "Deploy from a branch", pick `main` and `/ (root)`, then Save.
4. After a minute the site is live at `https://<your-username>.github.io/cosmic-bridge/`.

To test locally, open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.
