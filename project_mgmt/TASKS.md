# Capsule - Tasks

[Back to Project Board](./BOARD.md)

<br>

- AC MODIFICATION Types
  - [AC-MOD_NOT-POSSIBLE-ALT-SOLUTION]

- REJECTION Types
  - [TECH-NOT-POSSIBLE]
  - [TECH-NOT-BEST-PRACTICE]
  - [AT-CUSTOMER-REQUEST]
  - [NO-LONGER-NEEDED]

<br>

## (COMPLETE) CAP-000 - Deploy app for user testing

### Description:

- cf, fly.io, firebase...

### Acceptance Criteria:

- deployed to cf workers

Verified By cube on: 10/19/26

<br>

## (COMPLETE) CAP-001 - PWA MVP

### Description:

Make `installable` and ready for future offline support.

### Acceptance Criteria:

- Manifest, svc worker (minimal), installable

Verified By cube on: 10/19/26

<br>

## (COMPLETE) CAP-002 - Manual RSS link support

### Description:

In the event the podcast api returns no matching result, I want to be
able to load a podcast from a given rss feed as a backup.

Would be nice to save in local storage for future ease.

### Acceptance Criteria:

- Add ability to allow user to import rss url and load podcast
- BONUS: Save to storage upon success (Or cut to new story)

Verified By cube on: 10/20/26

Notes: For now, saving to localstorage using native api not indexdb. Prefer async using localforage later on.

<br>

## (COMPLETE) CAP-003 - Wire up Audio Controls

### Description:

- similar to og app

### Acceptance Criteria:

Verified By cube on: 10/20/26

<br>

## (COMPLETE) CAP-004 - Add MediaSession info

### Description:

- similar to og app

### Acceptance Criteria:

Verified By cube on: 10/20/26

<br>

## (COMPLETE) CAP-005 - UX Baseline

### Description:

- responsive design
- a11y smoke test
- themeing, transitions, swipe events...

### Acceptance Criteria:

Verified By cube on: 10/23/26

<br>

## CAP-006 - Add to portfolio site

### Description:

### Acceptance Criteria:

Verified By <> on:

<br>

## (COMPLETE) CAP-007 - Audio to Text Attempt

### Description:

Dev notes:

- may require chunking/streaming audio file...
- see: https://huggingface.co/spaces/Xenova/realtime-whisper-webgpu
  - NOTE: heavily minified code, unsure if i can trust fully.
    may need to handle `transformers.js` setup with whisper manually
- see: https://github.com/rn0x/audio2textjs

### Acceptance Criteria:

lgtm, could be better

TODOS:

- Hoist project_mgmt up to root folder
- FIX broken ui test and revert packagae json to run tests before prod build!!!!!!!
- Need to figure out optimal solution for multi-transcription support (switching podcasts intermittently, lang change, etc)
- UI resilience when Speech-to-Text api down, or wss disconnection.
- Refactor and "robustify" stt server. (logs, try catches, unit/e2e tests...)
- STT perf (multi-threading) and container resource limit increases
- Bind volume to STT container
- Determine naming scheme for downloads, transcriptions, videos...
- Svelte api vs STT seperation of concerns!
- Need to share data models between ui and stt
- Possible need/want to cancel transcription.
- UX cleanup and handling of text overflow.
- Cleanup .gitignores AND package.json cleanup script (yuck!)
- Use a better ts-node project setup. literally just guessed at it but the tsconfig setup is hieroglyphics tbh...
- Rework ui-wss flow... may require different messaging format or status...currently a mess and dupe work through spaghetti code ---> K I S S

Verified By cube on: 11/5/26

<br>

## (COMPLETE) CAP-008 - Picture n picture

### Description:

See:

- https://developer.chrome.com/docs/web-platform/document-picture-in-picture
- https://prompthub.gokuscraper.com/tools/js/picture-in-picture-api

### Acceptance Criteria:

Verified By cube on: 10/23/26

<br>

## CAP-009 - Favorites, Comments, & Import/Export

### Description:

### Acceptance Criteria:

TBD

Verified By <> on:

<br>

## CAP-010 - Transcription Cleanup

### Description:

### Acceptance Criteria:

- (DONE) FIX broken ui test and revert package json to run tests before prod build!!!!!!!
- Support for multi-transcription support (switching podcasts intermittently and lang change)
- UI resilience when Speech-to-Text api down, or wss disconnection. Disable buttons, info messages, or similar.
- (DONE) Bind volume to STT container
- Determine naming scheme for downloads, transcriptions, videos...
- UX cleanup and handling of text overflow.
- Rework ui-wss flow... may require different messaging format or status...currently a mess and dupe work through spaghetti code ---> K I S S

Verified By <> on:

<br>

## CAP-011 - API hardening

### Description:

### Acceptance Criteria:

- fix skipped tests and add more api tests
- multi-vendor support or DB download and self-host
- rate limiting
- downloading
- auth??

Verified By <> on:

<br>

## CAP-012 - v1 Review

### Description:

### Acceptance Criteria:

- a11y
- security
- perf
- etc.

Verified By <> on:

<br>

## CAP-013 - tag v1 & v2 Feature Brainstorm

### Description:

### Acceptance Criteria:

Verified By <> on:

<br>
