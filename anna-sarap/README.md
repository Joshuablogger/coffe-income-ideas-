# Anna Sarap — Interior Design website

A single-page, self-contained portfolio site (`index.html`). No build step: open it in a browser or host the folder anywhere (GitHub Pages, Netlify, Vercel).

## Personalising it

1. **Photos** – portfolio images live in `images/` (cropped from @ainteriordesign.ee posts; replace with original full-resolution files for best quality).
   - Projects are listed in the `projects` array near the bottom of `index.html`. Each has an `image`; add `before` to get a before/after toggle.
2. **Contact details** – search for `hello@annasarap.com` (also `CONTACT_EMAIL` in the script), the phone number, Instagram handle and "Your City".
3. **Text** – project titles/descriptions were written from the photos; services and the About text are general. Check them with Anna.

## Contact form

The form opens the visitor's email app with the enquiry pre-filled (no server needed). To receive submissions directly instead, point the form at a service such as Formspree or Netlify Forms.
