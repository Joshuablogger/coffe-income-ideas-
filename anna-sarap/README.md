# Anna Sarap — Interior Design website

A single-page, self-contained portfolio site (`index.html`). No build step: open it in a browser or host the folder anywhere (GitHub Pages, Netlify, Vercel).

## Personalising it

1. **Photos** – create an `images/` folder next to `index.html` and add photos.
   - Portfolio: in the `projects` list near the bottom of `index.html`, add `image: "images/your-photo.jpg"` to each project.
   - Hero / portrait: replace the placeholder `<div class="ph" ...>` blocks with `<div class="ph ..."><img src="images/hero.jpg" alt="..."></div>`.
2. **Contact details** – search for `hello@annasarap.com` (also `CONTACT_EMAIL` in the script), the phone number, Instagram handle and "Your City".
3. **Text** – the About stats (years, projects), services, and project descriptions are placeholders; update them to match Anna's real experience.

## Contact form

The form opens the visitor's email app with the enquiry pre-filled (no server needed). To receive submissions directly instead, point the form at a service such as Formspree or Netlify Forms.
