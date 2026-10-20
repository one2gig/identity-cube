# Redzuan Hiew — Glass Identity / Three.js Edition

A premium, mobile-first, front-end-only digital business card. Built with **real Three.js / WebGL**, not a CSS pseudo-3D cube. Includes the provided portrait, forest-green and white design, a dice-style entrance, realistic glass material, interactive four-sided navigation, and working contact actions.

## Get it running

No npm install or build step required. Serve the directory over HTTP:

```sh
cd redzuan-glass-identity-threejs
python -m http.server 8000
```

Visit `http://localhost:8000`.

Or deploy the contents of the folder to Netlify, Cloudflare Pages, Vercel (static site), GitHub Pages, etc. The folder root contains `index.html`.

**Internet connection required for the 3D engine on first load:** `index.html` imports Three.js v0.180.0 from jsDelivr with an import map. If the CDN or WebGL is unavailable, the page shows a still profile image instead of a broken area; all contact/site links still work. For production/offline dependency control, install/bundle `three` locally using Vite and change the import map to local build assets.

## Interaction

- First visit: a simulated thrown glass die tumbles, bounces, and floats into view. `SKIP INTRO` is available.
- Drag across the cube (mouse/touch) to rotate. Let go to snap to the nearest face.
- Tap a visible face to focus it.
- Navigation below the cube focuses **Profile / Company / Contact / 12GIG App**.
- Use keyboard left/right arrow keys with the 3D scene focused to select another face.
- `REPLAY` restarts the throw.
- Respect `prefers-reduced-motion`, which disables the entrance.

## Details encoded

- Redzuan Hiew — Head of Tech, 12Gig Sdn Bhd
- +60 12-397 7896 (`tel:+60123977896`)
- redzuan@12gig.com
- Corporate: https://12gig.my
- Web application: https://12gig.com
- Google Play: https://play.google.com/store/apps/details?id=com.gig12.app
- `Save my contact` downloads a vCard (.vcf) that works with phone contacts.

## Structure

```
index.html              Page content, SEO, Three.js import map
style.css               Responsive forest-green design and fallbacks
main.js                 UI actions + Three.js renderer, cube, input + animation
assets/redzuan-portrait.png    Provided photo
assets/favicon.svg       App icon
```

## Notes

- No backend, database, tracker or login.
- Phone calls / email links trigger the visitor's native applications.
- Fine glass refraction and clearcoat appearance depend on browser/GPU capabilities; pixel ratio is capped for mobile performance.
- The company's mark is typographic `12GIG`, not an invented official logo. Replace it with an actual logo if desired.
