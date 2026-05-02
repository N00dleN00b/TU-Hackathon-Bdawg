# TruthLens Optimization Roadmap

## Phase 1: MVP Enhancements
### Quick Wins
- [x] **Community Voting System** — User credibility voting with reputation weighting
- [x] **Crisis Mode Detection** — Viral spike detection for trending/breaking news
- [x] **AI Assistant** — Keyword-based + optional Groq LLM mode (upgraded)
- [ ] **Browser Extension Scaffold** — Basic Chrome extension with overlay *(not started)*
- [x] **C2PA/CAI Integration** — Read C2PA manifests for authenticated media

### Why These First?
- **Community Voting**: Multiplies your verification power 10x. Users become validators.
- **Crisis Mode**: Real-time response to viral misinformation (elections, scandals, etc.)
- **AI Assistant**: Gives interactive guidance; now Groq-powered when a key is available
- **Extension**: Forces social media integration (Instagram, X, Reddit)
- **C2PA**: Industry standard—adds legitimacy + real provenance data

---

## Phase 2: Multimodal Detection Engine
### Components
- [x] **GAN Fingerprinting** — `lib/gan-fingerprint.ts` — artifact-based AI image detection
- [x] **Audio Waveform Forensics** — `lib/audio-forensics.ts` — spectral + ZCR + noise floor + pitch analysis
- [x] **Video Frame Analysis** — `lib/video-detection.ts` — frame anomaly timeline, facial swap detection
- [x] **Confidence Tier Labels** — VideoResultCard + AudioResultCard now show tier badges + disclosure text
- [ ] **Metadata Anomalies** — Comprehensive EXIF/forensics analysis (partial in imageAnalysis)
- [ ] **Reverse Image Search** — Integrate TinEye/Google Images API
- [ ] **Heatmap Visualization** — Show manipulated regions on image
- [ ] **Facial Recognition Inconsistencies** — Eye positions, skin tone shifts, face geometry

### Tech Stack
- **Image Analysis**: TensorFlow.js (GAN fingerprint model)
- **Audio Analysis**: Web Audio API + spectral analysis ✅
- **Video**: HTML5 video metadata + heuristic frame simulation ✅
- **Visualization**: Canvas/WebGL for heatmaps *(next up)*
- **External APIs**: TinEye (paid tier), Google Safe Browsing

---

## Phase 3: Video & Media Expansion
### Features
- [x] **Video Upload + Heuristic Analysis** — MP4/WebM/MOV supported, frame timeline UI
- [ ] **Real Frame Extraction** — Replace simulation with FFmpeg.wasm frame sampling
- [ ] **Optical Flow Detection** — Unnatural motion patterns
- [ ] **Audio Sync Check** — Lip-sync analysis (requires combined video+audio decode)
- [ ] **Scene Cut Detection** — Unusual edits/transitions
- [ ] **Temporal Consistency** — Lighting/shadow changes over time

### Tech
- **FFmpeg.wasm** — Client-side video processing *(replaces simulation)*
- **OpenCV.js** — Optical flow & temporal analysis

---

## Phase 4: Advanced Forensics & Timeline
### Features
- [ ] **Digital Forensics Timeline** — Chain of edits from metadata
- [ ] **Pixel History** — If C2PA manifest available, show edit history
- [ ] **Tampering Confidence Score** — Composite signal from all detections
- [ ] **Interactive Timeline UI** — Scrubbable edit history with before/afters

### Data Source
- **C2PA Manifests** — Built-in edit metadata
- **Reverse EXIF** — Modification timestamps, software used
- **Artifact Analysis** — Copy-paste regions, resampling artifacts

---

## Phase 5: Scaling & Infrastructure
### Backend Requirements
- **User Reputation System** — Central DB for vote history + accuracy tracking
- **Viral Detection** — Real-time media trending API
- **Model Hosting** — TensorFlow models served via inference API
- **Community Database** — User credibility scores, flag history

### Tech Stack
- **Backend**: Node.js/Express + PostgreSQL
- **Model Serving**: TensorFlow Serving or TensorFlow.js server
- **Real-time**: WebSockets for crisis alerts
- **Analytics**: Media viral spike detection (Twitter/TikTok API)

---

## Next Up (Recommended Order by Impact)

| Feature | Effort | Impact | Notes |
|---------|--------|--------|-------|
| Browser Extension scaffold | Medium | Very High | Overlay on X/Instagram/Reddit — biggest reach |
| Real FFmpeg.wasm video frames | Medium | High | Replaces simulation with actual frame data |
| Heatmap overlay on images | Medium | High | Visualizes GAN artifact regions |
| Reverse image search (TinEye) | Low | High | One API call, massive credibility signal |
| EXIF deep-dive UI | Low | Medium | Already partially in imageAnalysis, just needs UI |
| Backend reputation DB | High | High | Centralizes community data across users |
| Lip-sync check (video+audio) | High | High | Real deepfake detection when both tracks present |

### Easiest wins right now:
1. **Reverse image search button** — Add a "Search on TinEye / Google Images" link to image results. Zero backend needed.
2. **EXIF metadata panel** — Surface the raw EXIF from `imageAnalysis.ts` in a collapsible card on the image result.
3. **"Copy to Analyzer" in Assistant** — Let users paste a claim in the chat and have a button send it to the Analyzer tab.
4. **Crisis Mode real API** — Swap hardcoded alerts for a GDELT or NewsAPI call so Crisis Mode shows live events.
5. **Extension scaffold** — Even a barebones `manifest.json` + content script that adds a "Check with TruthLens" button on X/Reddit posts would be a huge demo feature.

---

## MVP Architecture (Current State)

```
Fall-2026/
└── src/
    ├── lib/
    │   ├── textAnalysis.ts       ✅ 11-signal text scoring
    │   ├── imageAnalysis.ts      ✅ EXIF + GAN fingerprinting
    │   ├── video-detection.ts    ✅ Frame heuristic + timeline
    │   ├── audio-forensics.ts    ✅ Spectral + ZCR + noise analysis
    │   ├── gan-fingerprint.ts    ✅ Artifact detection
    │   ├── groqClient.ts         ✅ AI enhancement for text
    │   ├── ai-assistant.ts       ✅ Keyword + Groq chat
    │   ├── community.ts          ✅ Voting & reputation
    │   ├── crisis.ts             ✅ Viral alert system
    │   ├── c2pa.ts               ✅ Content authenticity
    │   └── storage.ts            ✅ Local history
    ├── pages/
    │   ├── Analyzer.tsx          ✅ Text / Image / Video / Audio
    │   ├── Dashboard.tsx         ✅ Stats overview
    │   ├── History.tsx           ✅ Past analyses
    │   ├── Learn.tsx             ✅ Media literacy hub
    │   ├── Community.tsx         ✅ Voting UI
    │   ├── CrisisMode.tsx        ✅ Alert dashboard
    │   └── Assistant.tsx         ✅ Chat (keyword + Groq)
    └── components/
        ├── VideoResultCard.tsx   ✅ + confidence tier + disclosure
        └── AudioResultCard.tsx   ✅ + confidence tier + disclosure
```

---

## Questions to Clarify
- Browser extension: priority platform? Instagram > Reddit > X > Other?
- Crisis Mode: use real GDELT/NewsAPI or keep demo alerts?
- GAN model: integrate pretrained TensorFlow.js model or keep heuristic?
- Budget for API calls (TinEye, Google Safe Browsing, NewsAPI)?
- Backend timeline: needed before or after hackathon demo?
