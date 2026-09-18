# Salma El Gohary — portfolio

Built from the design canvas export `Salma Portfolio - Final designs.dc.html`.
Plain static HTML/CSS/JS with no runtime dependencies. `node build.js` writes
the finished site to `dist/`, which is the folder that gets deployed.

## Layout

| Path | What it is |
| --- | --- |
| `build.js` | Turns the canvas export into the pages in `dist/` |
| `copy-fixes.js` | Wording corrections applied over the canvas copy |
| `styles.css`, `script.js` | Hand-maintained; copied into `dist/` as-is |
| `media/` | Staged images, videos and the resume that pages reference |
| `assets/` | Original exports per project, before staging |
| `case-studies/` | The case-study markdown, the source of truth for copy |
| `tools/` | Local preview server, layout audit, GIF-to-MP4 converter |
| `dist/` | Build output. Don't edit by hand; it is wiped on every build |

## Run it

```bash
node build.js
node tools/serve.js
```

Then open http://localhost:4173.

## Pages

Built into `dist/`:

| File | Artboard |
| --- | --- |
| `index.html` | 11A home |
| `play.html` | 11C play |
| `about.html` | 12B about |
| `trax.html` | 12D project |
| `wondermakr.html` | 13A wonderMakr case |
| `sleepwell.html` | 13B SleepWell case |
| `go-smart.html` | 13C GO Smart case |
| `u4ria.html` | 13D U4RIA case |
| `amd.html` | 13E AMD Install Manager case |

`styles.css` — the canvas stylesheet verbatim, then the rules that turn a fixed
1440px artboard into a responsive page. Every band of a page sits on one shared
`--gutter` (56 / 40 / 28 / 20px by width) rather than the several different
paddings the artboard used, so the nav and footer land on the same margin on
every page. The about page's body keeps its own wider 120px measure at full
width, which is deliberate. Grids collapse by their `data-cols` count.

A case study's reading measure is `--measure` (768px) in `styles.css` — the one
place that width is set. It governs the body column and, because the images run
the full width of that column, their size too.

The contents column stays beside the body through tablet, narrowing from 250px
to 176px below 1240 while the body takes what is left. It pins 40px from the top rather than the 96
it was given as clearance for the nav bar: the bar is gone by the time the
column pins, and at the top of the page, where the bar is back, the column is in
flow again. It is re-asserted inside
the 900px block, because the body's own layout grid carries `data-cols="2"` like
every content grid inside it and is otherwise collapsed by the same selectors —
which drops the sticky contents column into the body's column, where it pins
itself over the text as the page scrolls. Entries darken to the active colour
on hover; `paint()` writes the resting colour inline on every scroll, so the
hover rule carries `!important` to outrank it, and it is fenced behind
`(hover: hover)` so a touch browser cannot leave one stranded looking active.
Only the phone
breakpoint (620px) drops it: there the column folds away, the body centres, and
the back link is replaced by `.backtop`, a second copy that sits above the
title. The two are never visible at once. Both take the same darker shade as
the contents list on hover, but without the `(hover: hover)` fence: a touch
browser that leaves `:hover` stuck on a single link is harmless, whereas
falling through to the canvas's `a:hover` would leave it gold. The canvas
labels them "← Back to work"; they ship as "← Back", since the work listing is
one click behind a case study and the link does not need to say so. The canvas
wording is still what `linkChrome` and `mobileBackLink` match on, so a
re-export keeps working. Grids inside a case-study body go
single-column below 900 rather than 620, because that body is narrower than the
page once the contents column sits next to it.

Below 620px the nav links hand over to a burger menu (`menuHtml` in build.js,
section 4 of `styles.css`, `mobileMenu()` in script.js). The nav bar sits above
the panel, so the logo and the burger keep their place and the burger animates
into the close control — the bars slide together, then cross. The panel and its
scroll lock are scoped to the same media query, so growing past the breakpoint
releases them even if no resize event reaches the script. Without JavaScript the
burger never appears and the plain links stay.

The about page's "Outside design, you can find me..." row behaves two ways.

Above 900px it is four across: hovering a photo lifts and tilts it, dims the
other three, and slides its caption out from behind the image. The caption sits
in a clipped, absolutely positioned box at the bottom edge of the photo, so it
starts hidden behind it and never moves the grid. On a touch device at that
width the same thing happens on tap (`outsidePhotos()` in script.js); the hover
rules are fenced behind `(hover: hover)` because a touch browser can leave
`:hover` stuck on the last element tapped.

At 900px and below it is a 2x2 whose captions are always visible in flow under
each photo, with no hover, tap, lift or dim at all — the script stops attaching
handlers, and the row drops the 56px the canvas reserved for a caption that now
takes real space.

Caption wording lives in `OUT_CAPTIONS` in build.js.

The hero's role / team / timeline / skills row is a four-up like every grid
inside a case study and carries the same `data-cols="4"`, but it sits above the
body rather than inside its narrow column, so it steps down on its own
schedule: `tagHeroMeta` in build.js marks it `data-meta`, and the rules at the
end of section 3 of `styles.css` keep its row through tablet and stack it only
on a phone. The canvas set it at `gap: 0` with every cell inset 24px on both
sides, which pushed the first label in off the margin the hero band above and
the body below both sit on, and ran labels and values together the moment the
row stacked. The inset is a gutter between the columns instead — so the row
starts and ends flush with the rest of the page at every width, and tightens as
the columns do — and the stack gets a real row gap.

Case-study assets live in `assets/<project>/` and are staged into `media/` by
hand with `sips -Z 2400` (retina for the widest column, ratio untouched).

One asset is cropped on the way in. `assets/sleepwell/Sleepwell system.png` is
exported with a soft alpha vignette about 35px wide at 2400, which reads as a
faded edge against the page rather than a clean photograph. It is cropped past
the feather first, which also tightens the composition a little:

```bash
sips -c 1962 5433 --cropOffset 173 173 "assets/sleepwell/Sleepwell system.png" --out /tmp/c.png
sips -Z 2400 /tmp/c.png --out media/sw-system.png
```

Re-staging it without the crop brings the faded edge back. The
Trax page maps them in `SLOT_ASSETS` in build.js; each renders at its own file
ratio rather than being cropped into the fixed-height box the artboard gave it,
which is what the `:has()` rules in section 8 of `styles.css` undo.

`traxMedia` in build.js builds that page's three custom blocks: two before/after
cross-fades with their own pause control, and the prototype recording in a
rebuilt browser frame. The pause control is chrome sitting on the artwork, so
it stays hidden until you point at that figure, tab to the button, or pause —
a paused comparison is just a still, and the button is the only thing on screen
that says why. The reveal is fenced behind `(hover: hover)`; where there is no
pointer the button stays visible, since nothing would reveal it. The frame's proportions were measured off the canvas's
own still export of that shot (`assets/trax/final.png`) — title bar 2.45% of the
frame width, dots 1.09% at 2.45/4.27/6.09%, frame 64% of the stage — so the gif
plays inside the framing that was designed for it.

`wondermakrMedia` and `goSmartMedia` do the same for those two pages.

wonderMakr: the wireframe exploration was laid out on one board, not three
separate shots, so the three-up row in "Exploring the interaction model"
collapses into a single full-width image. The final walkthrough gets the browser
frame in its own proportions — `.browser--wm` in section 8 of `styles.css`,
measured off `assets/wondermakr/final demo.png`: title bar 2.99% of the window
width, dots 1.44% across and 0.91% apart set 2.24% in, corners a 21px radius on
a 1876px window.

Its Solution section shows the three flows the onboarding experience is built
from. Each is a self-contained SVG animation with its own clock, written to
`media/wm-f-*.html` and embedded in an iframe rather than inlined, so three of
them on one page cannot collide over element ids or globals. `.loop` in section
9 of `styles.css` carries the 421 x 280 ratio they were composed at and paints
the same #F2F2F2 as `.stage`, so the band is there before the document inside it
loads. They are demonstrations, not controls: the iframe takes no pointer events
and no tab stop, and each animation sits out `prefers-reduced-motion` on its own.
`WM_FLOWS` in build.js maps them to their slots.

GO Smart: its Solution section was four text-only features in two rows. Three of
them have a shot, so it becomes three image-and-text rows laid out like the Trax
solution, and "High-visibility notifications" — which has none — comes out. The
copy blocks are lifted out of the canvas's own grids rather than retyped, so
`copy-fixes.js` still governs the wording.

Both pages' portrait shots and recordings sit on `.stage`, the flat #F2F2F2 band
the design exports them on (`assets/go smart/final design.png`). Those export
bands are much wider than the reading column — mapped 1:1 the way the Trax frame
is, a phone would land 130px across the 768px measure — so the band is rebuilt
rather than copied. `--stage-w` is the artwork's share of it, 30% here; the
file's own ratio gives the rest, so nothing is cropped or stretched. The same
reasoning widens the wonderMakr window from its export's 24.8%.

`u4riaMedia` fills that page. Everything from the splash screens on is motion,
delivered as a folder of clips per content type, and each becomes a row of tiles
laid out the way that category's own still board is — four portrait splash
screens, three square audio covers, three portrait short-form videos — so the
page shows the set rather than one example. Order within a row follows the board,
not the filenames, which are content-hashed and sort arbitrarily. The clips are
decoration, not a player: muted, looping, no controls (`.reel` in section 8 of
`styles.css`).

They are also by far the heaviest thing on the site — about 29MB across ten
files — so they ship as `preload="none"` and `reels()` in script.js only starts
a row once it comes near the viewport, pausing it again when it leaves. A
visitor who never reaches U4RIA's final content downloads none of it. Under
`prefers-reduced-motion` a row that scrolls into view loads one frame and stays
still.

The clips are staged like the images, not copied: `avconvert` re-encodes the
splash screens at `Preset960x540` and the short-form videos at `Preset640x480`,
which halves them. The three audio clips are already smaller than anything
avconvert produces, so those are copied as they are. Re-encoding is worth
checking per file rather than assuming — several of these came out *larger*.

```bash
avconvert -p Preset960x540 -s "assets/u4ria/splash screens/<hash>.mp4" -o media/u-splash-1.mp4 --replace
```

`sleepwellMedia` fills that page the same way. Each of its three design
decisions is a before/after pair, so each becomes a cross-fade on the same loop
and pause control the Trax flows use — the two states of one control read more
clearly swapping in place than side by side. Those exports carry their own
Before / After pill, so the figures need no label of their own.

wonderMakr's client logos are one row spanning the column at every width
(`.logos`). The exports are cropped to their marks and each logo's flex-grow is
its aspect ratio, so all five share a height and the row shrinks rather than
wraps.

Hero timelines read "8 weeks (Oct – Dec 2025)": the build rewrites the canvas's
"8 weeks · Oct – Dec 2025" on every page.

The nav bar rides away with the page rather than staying pinned, and it stays
gone until the page is back at the top (`inkNav` in script.js, `[data-hidden]`
in the stylesheet). Which way you are scrolling does not enter into it — only
where you are — so the bar never slides in over what you are reading. The two
thresholds differ on purpose: it leaves at 40px and returns at 2, so once it is
gone it stays gone the whole way back up. It is held visible while the mobile
menu is open, since the close control lives in it.

When hidden, the bar's bottom edge lands exactly on y=0, so its 1px bottom
shadow would otherwise draw as a hairline across the top of the viewport. The
hidden rule clears it, and carries a `.page` prefix purely to outrank
`[data-stuck]`, which sets the same property at equal specificity.

The animation depends on the nav carrying no inline `transition` — an inline
transition shorthand replaces the stylesheet's outright, which drops `transform`
and makes the bar snap instead of slide. `navHtml` in build.js leaves it out for
that reason.

The page colour is one token: `--surface` on `:root` in `styles.css`. The body,
the page, the sticky nav's scrolled state, the footer band and the mobile menu
panel all read it, so recolouring the site is a one-line change. The canvas
hardcodes its own colour into the markup, so `tokeniseSurface` in build.js
rewrites those to the token on every build — it runs last, because the earlier
transforms match on the canvas's literal hex.

The about hero's text column and portrait carry a `clamp(24px, 4vw, 56px)` gap
(section 7 of `styles.css`). The canvas separated them with
`justify-content: space-between` alone, which leaves nothing between the two
once the text column reaches its max-width — they touched from roughly 900 to
1150px. The gap is a floor, so the full-width layout is unchanged.

Type runs on a seven-step scale — 56 / 32 / 21 / 16 / 15 / 13 / 12 — defined as
`TYPE` in build.js. The canvas used eighteen sizes topping out at 76px, which is
what made the site read as oversized; `normaliseTypeScale` maps every inline
font-size in the artboard markup onto the nearest step on each build, so a
re-export cannot reintroduce the sprawl. Body copy is led at 1.55 (`BODY_LEADING`),
down from the canvas's 1.70–1.75 — the leading did as much of the damage as the
sizes.

Two responsive steps sit outside that scale: h1 scales fluidly down to a 28px
floor, and h2 drops to 24px below 620px so it stays under the h1 floor.

Headlines scale fluidly below 1240px instead of stepping through fixed sizes.
Each h1 publishes its designed pixel size as `--h1` (see `fluidHeadings` in
build.js) and the stylesheet sizes it at `available width / 13`, capped at
`--h1` (now 56 on every page) with a 28px floor. 13 is measured,
not guessed: the home headline holds three lines while width divided by font
size falls between 12.4 and 13.8. Coloured spans inside a headline carry their
own pixel size from the canvas and need `font-size: inherit !important` to
follow it — an inline style beats a selector without it.

The hero's halftone blob is allowed out of its block (section 6 of
`styles.css`). The canvas gives the hero `overflow: hidden`, which sliced the
blob along a straight line at the bottom of the block; letting it through means
it fades out on its own and passes behind the first project card. Footers keep
their clip — there the blob meets the footer's top border and the end of the
page, which are real edges.

`tools/layout-audit.html` — layout audit. With `tools/serve.js` running, open
http://localhost:4173/tools/layout-audit.html and call
`await measure('trax.html', 375)` in the console; it loads a page at that width
and reports gutter consistency, horizontal overflow, squeezed text and image
spill. Used to sweep 9 pages x several breakpoints at once.
`script.js` — the canvas behaviour (sticky nav, scroll-spy contents,
before/after crossfade), rewired from per-artboard scrolling to window
scrolling.

Every page keeps the drifting halftone blob in its footer. The case-study
heroes are stripped of theirs so the writing carries the top of the page.
`copy-fixes.js` — wording corrections applied over the canvas copy. The canvas
had drifted from `case-studies/*.md` (condensed sentences, em-dash joins,
rewritten phrases); the markdown is the source of truth. Each entry must match
exactly once or the build fails, so a re-export that changes the wording is
caught rather than silently ignored.

`media/` — every image the design references, plus `dark-logo.svg` /
`light-logo.svg` and `resume.pdf`. The `slot-*.webp` files are photos the canvas
stored in its image-slot state (`.image-slots.state.json` next to the export),
and `_slots.json` records their crop.

The nav mark and the favicon both come from those two SVGs. The pages are
light-only, so the nav always uses `dark-logo.svg`; `light-logo.svg` is served
as the favicon when the browser reports a dark colour scheme. If a dark theme
is ever added to the site, swap the nav mark the same way.

## Build guards

The build fails rather than shipping something broken:

- an image slot the canvas placed but nothing fills;
- a page pointing at a `media/` file that doesn't exist;
- a copy fix that no longer matches exactly once;
- a quote left inside an inline `style` attribute (see Deploying).

It also warns about files in `media/` that no page uses, and if
`media/resume.pdf` is missing.

## Rebuilding

`build.js` regenerates every page from the canvas file. Re-run it after any
change to the design, the copy, `styles.css`, `script.js` or `media/`.

```bash
node build.js
```

It reads from `~/Downloads/portfolio redesign/` — change `SRC` at the top if the
canvas export moves.

## Deploying

Deploy `dist/` as-is. It holds the nine pages, `styles.css`, `script.js` and
only the media files something references. On Netlify, drag `dist` onto the
drop box in the site's Deploys tab.

Netlify's Pretty URLs rewrites every link to a `.html` page, and in doing so
cuts an inline `style` attribute off at its first quote, which left those links
in the browser's default blue Times. Font names don't need quotes in CSS, so
the build strips them from inline styles (`font-family:DM Sans,…`) and fails if
any quote is left in one.

## Prototype videos

The walkthroughs `sw-demo`, `go-demo` and `amd-demo` were GIFs and ship as MP4s
at a fraction of the weight. `trax-demo` and `wm-demo` stay GIFs: their exports
are heavily dithered, and video compression averages the dither into a colour cast. They play
muted and looping only while on screen (`autoloops` in `script.js`), and stay
on their first frame under reduced motion. The phone GIFs had transparent
corners, so they were flattened onto the stage's `#F2F2F2`. The source GIFs
live in `assets/`; to re-encode after replacing one, the converter uses macOS's
own AVFoundation (no ffmpeg):
`swift tools/gif2mp4.swift in.gif media/out.mp4 <bg hex> <bitrate>`, at 400 kbps
for the phones. AMD's walkthrough
(`amd-demo.mp4`, from `assets/amd/portfolio.gif`) is flattened onto `1A1A1A`
and sits in `.browser--dark`, measured off `assets/amd/final demo placement.png`.
