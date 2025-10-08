Aigen7 — Chaos Garden

Overview

This exercise page is an interactive demo built with a canvas background (gooey blobs), glassmorphism cards, a custom cursor, confetti, and an analysis card with accessibility and export features. CSS and JS are split into `../css/aigen7.css` and `../js/aigen7.js`.

Quick usage

- Open `exercises/aigen7.html` in a browser (double-click or serve the folder with a static server).
- Controls are in the top-right:
  - Reduce motion (checkbox) — throttles animations and clears particles.
  - Hide UI — dim/hide control elements.
  - Read Aloud / Stop — uses the browser SpeechSynthesis API to read the analysis. While speaking, focus is briefly trapped in the analysis region for accessibility.
  - Print / Download Text / Download PDF — export the analysis. PDF export uses html2canvas + jsPDF and supports multi-page content.

Keyboard shortcuts

- R — toggle Reduce motion
- H — toggle UI visibility
- P — Print

Citations

The analysis includes placeholder Kurzgesagt video links. To update them, edit `exercises/aigen7.html` and replace the example URLs and timestamps under the "Citations" section.

Notes

- PDF export attempts to render the analysis to an image and then add it to pages. For very large analysis content, results will be split across multiple PDF pages.
- Text-to-speech depends on the browser. If unavailable, the Read Aloud button will show an alert.
- If you want me to update the citations with exact Kurzgesagt video URLs and timestamps, paste them here and I'll update the links.
