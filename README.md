# Burnout Unpacked: Rest Is Not Laziness｜休息不是偷懶：解讀倦怠

An interactive mental health communication website (science communication + digital storytelling) that helps students and working adults understand burnout, distinguish it from ordinary fatigue and depression, and push back on the stigma that "rest equals laziness".

> **Disclaimer:** This website is for health communication and education only. It cannot replace diagnosis, assessment or professional counselling from a doctor or a qualified mental health practitioner. If you are in distress, please reach out to a professional or one of the crisis lines listed on the **Support & Resources** page. If you or someone you know is in immediate danger, call **999**.

---

## Pages

| File | Page | Key interactive features |
| --- | --- | --- |
| `index.html` | Home | Scroll-reveal, jump-to-reflection button, rotating reflective pop-ups |
| `what-is-burnout.html` | What is Burnout | WHO definition, 3 dimensions, expanding example cards, true/false quiz |
| `compare.html` | Fatigue vs Burnout vs Depression | Symptom comparison slider, non-diagnostic reflection checklist, side-by-side cases |
| `story-map.html` | Burnout Story Map | Horizontal timeline, glowing location markers, sliding story panels |
| `toolkit.html` | Recovery Toolkit | Boundary sentence builder, drag-and-drop priority sorting, 5-4-3-2-1 grounding, journal download |
| `resources.html` | Support & Resources | Filterable resources, one-click copy for hotlines, crisis banner |

Shared assets: `styles.css` (design system), `translations.js` (trilingual content), `script.js` (runtime), `assets/favicon.svg`.

## Languages

Trilingual: **English**, **繁體中文 (zh-HK)**, **简体中文 (zh-CN)**.

Switch with the `?lang=` URL parameter, e.g. `?lang=zh-HK`. Resolution order: URL parameter → saved preference (`localStorage`) → browser language → English.

## Accessibility

- Body text ≥ 18px; WCAG AA contrast targets.
- Respects `prefers-reduced-motion` — all decorative animation (orbs, clouds, reveals) turns off automatically.
- Keyboard navigable with visible focus rings, skip link, ARIA live regions, and ≥ 48px touch targets.
- No external CDNs, fonts or trackers — everything is local.

---

## Local preview

This is a static site. Run any local web server from this folder:

```powershell
python -m http.server 8090
```

Then open http://127.0.0.1:8090/.

## Deploy to GitHub Pages (persistent URL)

The site uses only relative paths, so it works directly from a GitHub Pages project URL.

1. Create a new repository under the **Otters-ct** account, named `rest-is-not-laziness` (public).
2. Upload **all** files in this folder to the repository root — drag the folder into GitHub's web uploader; it will expand automatically. Keep the `assets/` folder.
3. Go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Select branch **`main`** and folder **`/ (root)`**, then **Save**.
6. Wait for the build to finish. The site will be available at:

   ```
   https://otters-ct.github.io/rest-is-not-laziness/
   ```

Because the URL is tied to the repository, future content updates keep the **same** link — just re-upload the changed files.

### Deep links

- Language: `.../burnout-unpacked/?lang=zh-HK`
- Home → reflection section: `.../burnout-unpacked/index.html#reflect`

---

## Editing content

All text lives in `translations.js` under `window.BURNOUT_I18N`, split into three language objects (`en`, `zh-HK`, `zh-CN`) and grouped by page namespace (`meta`, `nav`, `footer`, `common`, `home`, `what`, `compare`, `story`, `toolkit`, `resources`). Keep the three languages in sync — they must share identical keys.

## Verification notes

- The crisis hotline numbers (Samaritans 2896 0000, SPS 2382 0000, 18111 Mental Health Support Hotline, etc.) are provided for demonstration and should be **confirmed against current official sources before public launch**.
- Statistical statements are grounded in the AXA Study of Mind Health and Wellbeing 2024 press release included in this folder.
