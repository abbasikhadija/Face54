# Cube Solver — Product Specification & Progressive Codex Master Prompt

## ROLE

Act as a senior software engineer, frontend architect, interactive 3D engineer, TypeScript specialist, and rigorous testing engineer.

You are working with a solo computer science student to build a publicly accessible 3×3 Rubik's Cube solver.

The goal is a small, elegant, technically correct product.

It must demonstrate credible software engineering through:

- Correct mathematical state modeling
- Reliable handling of user input
- Physical cube-state validation
- Existing solver integration
- Deterministic state transformations
- Background computation
- Accurate synchronization with a 3D renderer
- Thoughtful error recovery
- Automated tests
- Verified production deployment

The product should not resemble a generic AI-generated dashboard.

**Correctness is mandatory. Simplicity is intentional. Technical credibility must come from working engineering, not architectural decoration.**

---

## 1. PRODUCT DEFINITION

Working name: **Cube Solver**

One-sentence description:

"A browser-based tool that guides complete beginners through entering and solving their real 3×3 Rubik's Cube."

Target user:

Someone holding a scrambled 3×3 cube who has little or no prior cubing knowledge.

Deployment:

A public website hosted using GitHub Pages.

Architecture:

All cube computations happen in the user's browser. There is no server-side solving service.

### Product owner decisions — FINAL

1. Dark, immersive, graphite-themed visual design.
2. Beginner-first interaction.
3. Guided entry, one cube face at a time.
4. Color palette with smart selection of the next empty sticker.
5. 3D orientation guide shown when entering a new face, with an option to reopen it.
6. Users may navigate away from an incomplete face.
7. Live sticker counts and full physical-state validation.
8. Manual step-by-step solving by default.
9. User performs a physical move and confirms it before advancing.
10. One ready-to-solve demo.
11. Unfinished cube input persists locally.
12. Browser CPU-based solving with Web Workers.
13. Static GitHub Pages deployment.
14. No backend, database, AI, or user accounts.

Do not override these decisions without asking the product owner.

---

## 2. HARD SCOPE LIMIT

### Include

- Welcome experience
- Guided cube orientation
- Six-face sticker editor
- Sticker color palette
- Smart active-sticker selection
- Fixed center stickers
- Live color counts
- Local draft persistence
- Compact cube review
- Physical-state validation
- Local solver integration
- Worker-based computation
- Interactive 3D cube
- Guided manual move progression
- One built-in demo
- Completion screen
- Automated correctness tests
- GitHub Pages deployment

### Exclude

- Camera scanning
- Computer vision
- AI and LLM integrations
- User accounts
- Backend services
- Databases
- Cloud persistence
- Other cube sizes
- Bluetooth cubes
- Leaderboards
- Gamification
- Statistics dashboards
- Achievements
- Multiple solving methods
- Automatic full-solution playback
- Voice instructions
- Custom Kociemba implementation
- Analytics and tracking
- Unnecessary animation frameworks

Do not add optional features merely because they are easy to implement.

The MVP should remain a focused application, not become a general-purpose cubing platform.

---

## 3. USER JOURNEY

The application should implement these states:

WELCOME
→ PREPARE
→ INPUT
→ REVIEW
→ VALIDATE
→ SOLVE
→ GUIDED PLAYBACK
→ COMPLETE

### Welcome

Display:

- Product name
- One short description
- Prominent 3D cube
- "Solve my cube"
- "Try demo"

No complex navigation, feature grid, or marketing dashboard.

The demo must use a known legal scrambled cube and execute the real solving pipeline.

### Prepare

Explain:

- Center colors identify faces.
- The white center belongs on top.
- The green center faces the user.
- Users should rotate the whole cube to inspect different faces.
- They should not turn individual layers during entry.

Show a simple animated orientation reference.

Avoid advanced cube terminology.

### Guided input

For each face:

- Show the face name and center color.
- Show a 3D orientation animation when the face is first entered.
- Allow the user to reopen the reference.
- Show an editable 3×3 grid.
- Show the color palette.
- Highlight the active sticker.
- Show face progress.
- Allow Previous and Next navigation.
- Preserve incomplete entries.

After the orientation animation, remove or minimize the reference to reduce visual noise.

### Review

Show:

- Compact unfolded cube net
- Total completion count
- Color counts
- Missing stickers
- A way to edit each face
- One primary action: "Check cube"

### Validation

If valid, continue to solving.

If invalid:

- Explain the problem plainly.
- Preserve all entries.
- Highlight affected positions when they can be reliably identified.
- Offer a correction path.

Do not automatically repair physical cube states.

### Solving

Show a brief loading state only when necessary.

Calculate a solution locally.

Verify the returned solution before presenting it.

### Guided playback

Display:

- Large 3D cube
- Current move notation
- Plain-English direction
- Visual preview of the turn
- Current step number
- "Done — next move"
- Previous/undo action
- Reset View

The user must remain in control.

Do not automatically advance the physical solving sequence.

A preview must not falsely record a move as completed.

When moving backward, explain that the corresponding physical move must be undone.

The software cannot detect whether the user has actually turned their cube.

### Completion

Show:

- Solved cube
- Short confirmation
- Number of moves
- "Solve another cube"

Avoid confetti, unnecessary statistics, or exaggerated messaging.

---

## 4. VISUAL DESIGN CONTRACT

### Desired personality

A precise technical instrument with premium-quality 3D presentation.

Not a dashboard.

Not a game launcher.

Not an AI chatbot interface.

### Color system

Suggested tokens:

- Background: #10151C
- Surface: #1B222C
- Subtle surface: #252E39
- Border: #35404D
- Primary text: #F1F3F6
- Secondary text: #A5B0BD
- Accent: #D9B47D

Physical cube stickers use recognizable white, yellow, green, blue, red, and orange colors.

Sticker colors must be treated as domain data, not as arbitrary decoration.

### Typography

Use one readable sans-serif family and, if useful, a restrained monospaced treatment for moves such as R, U', and F2.

Avoid oversized marketing typography throughout the task flow.

### Layout principles

- One clear primary action per screen.
- Minimize simultaneous panels.
- No persistent sidebar.
- No unnecessary statistic cards.
- No full-screen decorative animations.
- No glassmorphism or glowing purple gradients.
- No excessive shadows.
- Consistent spacing.
- Short, practical instructional text.
- 3D cube shown only when it contributes to the task.

### Responsive design

Desktop:

Use a balanced layout that gives the active control and 3D reference adequate room.

Mobile:

Use a single-column layout with large touch targets and no horizontal scrolling.

### Motion

Use animation for:

- Whole-cube orientation changes
- Face turn demonstrations
- Small, meaningful interaction feedback

Respect prefers-reduced-motion.

Do not animate merely because a component can move.

### Accessibility

Ensure:

- Keyboard-operable input
- Visible focus states
- Labeled color options
- Non-color-only instructions
- Readable contrast
- Accessible error messages
- Adequate touch targets
- Reduced-motion support

---

## 5. CUBE ORIENTATION — CRITICAL REQUIREMENT

Use the standard Western 3×3 color scheme.

- U = White
- R = Red
- F = Green
- D = Yellow
- L = Orange
- B = Blue

Home orientation:

White on top, green in front.

Do not assume that screen directions remain fixed when the physical cube is rotated.

The interface must distinguish:

1. Rotating the entire cube to inspect a face.
2. Turning one layer during the solving process.

Use a verified coordinate system.

Suggested entry sequence:

1. Green / Front
2. Red / Right
3. Blue / Back
4. Orange / Left
5. White / Up
6. Yellow / Down

Every sticker must map to the correct canonical facelet position.

Define and test the orientation of each 3×3 input grid.

Proposed face-view landmarks:

| Face | Above | Right |
|---|---|---|
| F / Green | U / White | R / Red |
| R / Red | U / White | B / Blue |
| B / Blue | U / White | L / Orange |
| L / Orange | U / White | F / Green |
| U / White | B / Blue | R / Red |
| D / Yellow | F / Green | R / Red |

These landmarks are a proposed coordinate convention.

Verify them using official cubing conventions, labeled cube geometry, and physical testing.

Do not accept orientation behavior based only on how the 3D animation looks.

If the convention is wrong, correct it and document the decision before building the editor.

---

## 6. STICKER INPUT MODEL

The cube has 54 visible sticker positions.

The six center stickers are fixed.

The remaining 48 stickers are editable.

Initially, editable positions are unfilled.

Use a single canonical cube model.

Keep incomplete input distinct from a valid cube state.

### Palette interaction

1. User selects a color.
2. User paints an editable sticker.
3. Application selects the next empty sticker on the current face.
4. Application does not automatically paint that sticker.
5. Application never changes faces automatically.
6. Users can select previous positions and overwrite incorrect colors.
7. Centers cannot be edited.
8. Clear Face resets only editable positions on that face.

### Live counts

Display counts per color.

Warn about more than nine stickers of one color.

Do not silently correct counts.

Do not prematurely declare incomplete input physically impossible.

### Persistence

Use localStorage with a versioned schema.

Store only the minimal unfinished input state.

Validate saved data before restoring it.

Handle unavailable storage gracefully.

Provide "Start new cube" with appropriate confirmation when existing work would be lost.

Changing any input after solving must invalidate the old solution.

---

## 7. PHYSICAL VALIDATION

Validation must be independent of rendering.

Implement two levels.

### During input

- Missing sticker detection
- Per-face completion
- Global color counts
- Excess-color warnings

### Complete validation

Verify:

- Exactly 54 assigned sticker positions
- Exactly nine occurrences of each color
- Standard center mapping
- Twelve distinct valid edge pieces
- Eight distinct valid corner pieces
- No impossible piece identities
- Valid edge-orientation parity
- Valid corner-orientation parity
- Matching edge/corner permutation parity

Important:

White and yellow may appear beside each other in a visible grid.

What cannot exist is a physical edge or corner piece containing both opposite center colors.

Do not implement naive adjacent-grid checks.

Use an established verified cube-state representation or validation algorithm as appropriate.

Investigate whether the selected solver library truly rejects every invalid physical state.

Do not treat parsing a facelet string as proof of validity.

### Error UX

Return structured errors.

At minimum distinguish:

- Incomplete input
- Invalid counts
- Invalid piece identities
- Duplicate/missing pieces
- Invalid edge orientation
- Invalid corner orientation
- Invalid permutation parity
- Unsupported cube scheme
- Internal failure

Map technical errors to plain-English guidance.

Do not invent a specific incorrect sticker when the mathematical evidence cannot identify one.

---

## 8. TECHNOLOGY AND ARCHITECTURE

Preferred stack:

- React
- TypeScript
- Vite
- CSS
- cubing.js, subject to verification
- cubejs or an appropriate established solver
- Web Workers
- localStorage
- Vitest
- Playwright
- GitHub Actions
- GitHub Pages

### Architecture principle

Separate these concerns:

- UI state
- Canonical cube-state model
- Input orientation mapping
- Physical validation
- Solver adapter
- Solver worker
- 3D viewer adapter
- Playback controller
- Local draft persistence

Do not introduce elaborate generic frameworks merely to represent these responsibilities.

Use ordinary TypeScript modules and pure functions where possible.

Avoid Redux, dependency injection frameworks, plugin architectures, event buses, or unnecessary class hierarchies.

### Client-side solving

Run expensive initialization and solver computation in a Web Worker.

Use typed messages and request IDs.

Prevent stale responses from updating newer cube states.

Handle failed worker initialization.

If a synchronous solve cannot be interrupted, terminating and recreating the worker is acceptable.

Measure preparation and solution times in development, but do not promise performance that has not been verified.

### Solver correctness

The solver's output is not accepted merely because it returns a move sequence.

Apply the returned moves to the initial cube state using a verified state transition implementation.

Confirm the final state is solved.

Use legal scramble fixtures for testing.

Do not claim the solution is mathematically shortest.

### 3D renderer correctness

The renderer must display the exact state entered by the user.

The solution sequence must start from that state.

Move directions must match the mathematical state transitions.

Use the smallest established library integration that satisfies those requirements.

If the solver and viewer cannot be reconciled, stop.

Do not hide the mismatch behind visual shortcuts.

---

## 9. TESTING REQUIREMENTS

Automated tests should focus on meaningful correctness.

### Canonical model

- Solved cube representation
- Correct facelet ordering
- Center mappings
- Face-entry orientation
- Round-trip state conversions

### Validation

- Incomplete input
- Wrong sticker count
- Invalid edge identity
- Invalid corner identity
- Duplicate piece
- Single flipped edge
- Single twisted corner
- Invalid permutation parity
- Valid scramble remains valid

### Solver integration

- Solved state
- One-move scramble
- Known legal scrambles
- At least 100 deterministic legal scramble states by the final verification stage
- Returned moves correctly solve each state

### Worker

- Initialization
- Successful solve
- Failure response
- Stale-response protection
- Cancellation or termination
- Recovery after failure

### Interface

- Select color
- Paint sticker
- Advance active selection
- Edit previously painted sticker
- Preserve fixed centers
- Navigate between incomplete faces
- Restore saved draft
- Correct invalid input
- Keep playback state synchronized
- Prevent stale solution display

### Browser acceptance

- Demo journey
- Manual-input journey
- Desktop viewport
- Mobile viewport
- Keyboard interaction
- Production worker loading
- GitHub Pages base-path loading
- Renderer initialization

### Manual physical acceptance

Before the product is considered finished:

1. Use a real standard 3×3 cube.
2. Scramble it using a recorded legal move sequence.
3. Enter all six faces through the UI.
4. Confirm that the displayed virtual cube matches the real cube.
5. Follow the generated moves physically.
6. Confirm that the physical cube is solved.

Repeat with more than one scramble.

Never substitute a virtual-only demonstration for this physical acceptance test.

---

## 10. ENGINEERING DOCUMENTATION

Maintain five concise documents:

**README.md**

Product description, setup, usage, tests, deployment, architecture, limitations, screenshots.

**PROJECT_SPEC.md**

This specification and approved product decisions.

**AGENTS.md**

Short, durable instructions for Codex.

**context.md**

Current milestone, completed work, verified tests, unresolved issues, next action.

**docs/DECISIONS.md**

A lightweight engineering decision journal.

For significant decisions, record:

- What problem existed
- What was chosen
- What alternative was considered
- Why the chosen approach was appropriate
- What trade-off was accepted
- How the decision was verified

Do not turn these documents into hundreds of pages.

---

## 11. PROGRESSIVE DEVELOPMENT PROTOCOL

Work on only one milestone per Codex execution.

At the start of each milestone:

1. Read PROJECT_SPEC.md.
2. Read AGENTS.md.
3. Read context.md.
4. Check repository status.
5. Inspect the relevant implementation.
6. State the milestone acceptance criteria.

During implementation:

- Make the smallest cohesive changes.
- Preserve existing verified behavior.
- Use real tests rather than unsupported claims.
- Document meaningful deviations.

At the end:

1. Run the required verification.
2. Fix failures related to the milestone.
3. Report any remaining blockers honestly.
4. Update context.md.
5. Update DECISIONS.md if necessary.
6. Summarize changed files.
7. Suggest a commit message.
8. STOP.

Do not proceed to the next milestone automatically.

Do not commit, push, or deploy without explicit user authorization.

If a milestone's acceptance criteria are not met, mark it blocked or incomplete rather than declaring success.

---

# DEVELOPMENT MILESTONES

## M0 — Technical Feasibility

**Objective:** Prove the solver and 3D renderer can work together correctly.

Implement only a minimal technical proof.

Requirements:

- Initialize a React/Vite/TypeScript project.
- Evaluate suitable solver and renderer libraries.
- Verify browser compatibility and licensing.
- Create a known legal scrambled state.
- Generate a solution.
- Independently verify that applying the solution solves the original state.
- Render the exact starting state in 3D.
- Animate or seek through the same move sequence.
- Confirm mathematical and visual final states agree.
- Test the production build's browser compatibility.
- Record observed initialization and solve timings.
- Identify whether experimental renderer APIs are required.

Acceptance:

- Working solver/renderer proof of concept.
- A reproducible correctness test.
- Documented dependency choices and risks.
- No unresolved state-mapping ambiguity.

If compatibility fails, document the blocker and alternatives.

Do not continue to the polished UI.

**STOP after M0.**

## M1 — Minimal Design Foundation

**Objective:** Establish a polished, restrained visual foundation.

Build:

- Dark graphite design tokens
- Responsive application shell
- Welcome screen
- Prominent interactive 3D cube
- Working demo entry point using the verified M0 fixture
- Basic screen navigation
- Accessible controls

Do not create the full input system yet.

Acceptance:

- Visually coherent desktop and mobile layouts
- No unnecessary dashboard features
- Meaningful working actions
- No major accessibility blockers
- Browser smoke test
- Build and relevant tests pass

**STOP after M1.**

## M2 — Cube Input and Orientation

**Objective:** Reliably capture the colors of a physical cube.

Build:

- Canonical 54-facelet model
- Verified orientation mappings
- Six-face guided entry
- Animated whole-cube orientation guide
- Reopen-orientation control
- Fixed centers
- Color palette
- Smart next-sticker selection
- Partial-face navigation
- Live color counts
- Local persistence

Acceptance:

- Every UI sticker maps correctly to a canonical facelet.
- Orientation tests pass for all six faces.
- Draft survives refresh.
- All input corrections are preserved.
- No accidental layer turns during orientation guidance.
- Input interaction works with mouse, touch, and keyboard.

**STOP after M2.**

## M3 — Review and Physical Validation

**Objective:** Prevent impossible cube states from reaching the solver.

Build:

- Compact unfolded review view
- Complete-state checks
- Edge and corner validation
- Physical solvability checks
- Structured errors
- Plain-English guidance
- Correction navigation

Acceptance:

- All specified impossible fixtures fail.
- Valid legal scrambles pass.
- Errors do not erase user data.
- Specific piece identification is shown only when justified.
- Relevant unit and browser tests pass.

**STOP after M3.**

## M4 — Production Solving Pipeline

**Objective:** Compute and verify solutions without blocking the UI.

Build:

- Worker-based solver initialization
- Typed worker requests/responses
- Stale-result protection
- Cancel/retry behavior
- Real input-to-solver conversion
- Solution verification
- Loading and error states

Acceptance:

- UI remains responsive during expensive solver work.
- Solved inputs are handled correctly.
- Generated solutions solve the original input.
- Worker failures do not corrupt state.
- Deterministic scramble tests pass.
- No server-side computations are required.

**STOP after M4.**

## M5 — Guided Physical Solving

**Objective:** Help a beginner follow the solution using a real cube.

Build:

- Exact initial scrambled 3D state
- One current move at a time
- Plain-English move explanation
- Current-turn preview animation
- "Done — next move"
- Clearly explained undo/previous action
- Progress indication
- Reset View
- Completion state
- Full working demo journey

Do not add automatic full-solution playback.

Acceptance:

- 3D state matches the entered physical cube.
- Every confirmed move advances exactly one step.
- Turn previews do not falsely confirm progress.
- Backtracking is explicit.
- Camera rotation does not redefine notation.
- Final state is correctly solved.
- Real physical-cube trials are performed or marked pending if not yet possible.

**STOP after M5.**

## M6 — Final Quality and GitHub Pages Release

**Objective:** Deliver a public, reliable application.

Finish:

- Responsive refinements
- Input error recovery
- Accessibility checks
- Reduced-motion behavior
- Production performance checks
- Dependency and license review
- README and decision journal
- GitHub Actions workflow
- GitHub Pages configuration
- Production browser verification

Use the correct Vite base path for the actual repository.

If the repository is:

https://github.com/USERNAME/REPOSITORY

the typical project URL will be:

https://USERNAME.github.io/REPOSITORY/

and Vite should be configured for the corresponding repository path.

Use bundler-managed worker and asset URLs.

Avoid routing mechanisms that require unsupported server rewrites.

Acceptance:

- Tests pass.
- Lint and type checking pass.
- Production build passes.
- Workers and 3D assets load from the deployed URL.
- Demo works on the public website.
- Real-cube input and solving work.
- Mobile and desktop journeys are verified.
- Documentation matches actual behavior.
- No invented claims about measured performance.
- No hidden backend dependency.

Do not claim the website is live until its actual public URL has been verified.

**STOP after M6.**

---

## 12. MILESTONE REPORT FORMAT

At the end of each milestone, respond with:

### Milestone
Number, name, and status.

### Implemented
What was actually built.

### Engineering decisions
Important decisions and trade-offs.

### Verification
Commands run and actual test results.

### Files changed
Concise summary.

### What I should understand
Explain one or two important engineering concepts in simple language.

### Issues
Unresolved failures, assumptions, or limitations.

### Next milestone
Describe only; do not start.

### Suggested commit
One conventional Git commit message.

Then STOP.

---

## 13. FINAL ENGINEERING PRINCIPLE

Do not build a visually attractive demonstration that is mathematically unreliable.

Do not build an overengineered architecture that obscures a small product.

Do not claim ownership of an existing solver's algorithm.

The software engineering contribution is the reliable integration of physical cube input, state validation, local computation, 3D visualization, and a carefully designed beginner experience.

Aim for a product that feels simple because the underlying complexity has been handled correctly.

---

## FIRST EXECUTION INSTRUCTION

Read this specification and inspect the repository.

Begin **M0 — Technical Feasibility only**.

Prove compatibility between the proposed solving library and 3D renderer.

Implement one reproducible legal-scramble solving demonstration.

Verify the mathematical result and the visual representation.

Record the technical decisions and measured observations.

Run relevant tests.

Report M0 results.

**Do not proceed to M1, commit, push, or deploy without authorization.**
