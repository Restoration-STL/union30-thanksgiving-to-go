# Thanksgiving To-Go 2026 — order page

The ordering page for **Thanksgiving To-Go at Union 30, inside Hotel Saint Louis**. One page that
sells one Thanksgiving package to one household and hands the order to Square for payment.

---

## What the customer does

Two things: **pick a size**, then **pick a pie**. Then they go to Square to pay.
No cart, no quantity field, no account.

The order record is **Square's payment confirmation** — not anything this page sends. The page
captures nothing and stores nothing. If someone abandons halfway, no order exists.

### The order flow

```
① Choose your size    → four size cards
                      → "Feeding more than 10?" line
                      → gold-outlined box: everything every package includes
② Choose your dessert → two pie buttons
   Your order         → revealed once BOTH choices are made
```

Both steps are on the page from the start — the menu sits between them, so hiding step 2 would
hide the menu too. **The order summary is the only thing that reveals**, and it appears once
there is a whole order to show, in whichever order the two choices were made. The checkout button
never exists without a complete order behind it.

---

## Checkout

Each size-and-pie combination has its own Square payment link — eight in all. They live in one
map, `PAYMENT_LINKS`, at the bottom of `index.html`, keyed `size|dessert`. That map is the only
thing on this page that should ever need editing.

The checkout button has three states:

| Condition | Button |
|---|---|
| Size and/or dessert not chosen | Disabled · `Choose a package and dessert` |
| Both chosen, but that combination's link is blank | Disabled · `Checkout link not set yet` |
| Both chosen and a link exists | Enabled · `Continue to checkout →` |

Blanking a link disables that one combination rather than producing a dead URL.

⚠️ **If a link ever has to be rebuilt, rebuild it as a Square "Take a payment" link — never
"Sell an item."** "Sell an item" renders an item page with an uncapped quantity stepper, which
silently breaks the one-package-per-checkout rule this whole design exists to enforce.

⚠️ **After changing any link, check it by eye.** Pick that exact size and pie on the page, click
through, and confirm the Square page shows the same package and the same pie. A mis-pasted link
still goes to a real, working checkout — just for the wrong order — and nothing on the page can
catch that.

---

## Files

```
index.html                        the whole page — HTML, CSS and JS in one file
README.md                         this file
.gitattributes                    pins the SVGs to LF line endings
.gitignore
assets/
  img/
    hero-glazed-ham.jpg           hero — the honey bourbon baked ham
    union30-dining-room.jpg       hero background texture + the "pick up here" band
    og-share-card.jpg             link-preview card (og:image), 1200 × 630 — not shown on the page
  logo/
    union30-wordmark-white.svg    header + footer lockup
    union30-wordmark-navy.svg     spare, for light backgrounds
    union30-wordmark-gold.svg     spare
    union30-round-white.svg       footer badge
    union30-round-navy.svg        receipt badge + favicon
    union30-round-gold.svg        hero watermark
```

A single static page: no build step, no dependencies, no framework. The only external requests
are two Google Fonts, Anton and Poppins.

### Local preview

Serve the folder with any static file server and open the page it prints. For example:

```bash
python -m http.server 4173
```

```bash
npx serve .
```

---

## Brand

| Role | Hex |
|---|---|
| Navy (primary) | `#1E355E` |
| Gold (accent) | `#DAAB28` |
| Cream (background) | `#FBF6EB` |
| Cream, darker (bands) | `#EFE8D4` |
| Bronze (rules, small caps) | `#86764E` |
| Ink (body copy) | `#2D2A26` |
| Warm grey (secondary copy) | `#686158` |

**Type — `Anton` (display) + `Poppins` (body).** Both are SIL Open Font License, safe to ship.
⚠️ **Do not substitute Industry or Museo** — they are not licensed for use on this page.

**Logos.** The header and footer use the Union 30 **wordmark**. The round badge is fine line art
that turns to mush below about 70 px, so it appears only where it is large enough to read: the
footer, the receipt header, and as a big low-opacity watermark in the hero. It also already
contains the words "UNION 30", so it should never sit beside a separate "UNION 30" text lockup.
The colour variants in `assets/logo/` were made from the brand masters by changing the fill only —
the geometry is untouched.

---

## Photography

**Every image on this page is a real, unretouched photograph from Union 30** — no stock, no
generated images. Each was chosen so that nothing on the page implies a dish that is not on this
menu:

| Image | What it is, and why it's honest |
|---|---|
| Hero | A scored, glazed, bone-in ham from the Union 30 kitchen. **Honey bourbon baked ham is on this menu** and is in every package |
| Room band + hero texture | The Union 30 dining room, which is where pickup happens |

🚫 **Deliberately not used, and don't add:** a whole roasted turkey, or any plated dish that is
not on this menu. The meal is *sliced* smoked turkey breast and ham. If an image slot needs
filling and no honest photo exists, leave it empty.

---

## What this page deliberately does NOT do

Each of these is a decision, not an omission. Don't "improve" them back in.

| | Why |
|---|---|
| **No quantity field, anywhere** | One package per checkout is the whole design. The eight links exist precisely so quantity can't be set |
| **No email or contact form** | Square's payment confirmation is the order record. A page-sent form could fire without a payment and create a phantom order |
| **No cart, account or storage** | No database, no `localStorage`, no cookies |
| **No payment verification** | That needs a backend. The page hands off to Square and stops |
| **No deadline enforcement** | Nothing on the page stops a late order. Closing ordering is a manual step |

---

## Accessibility

The two choosers are real `radiogroup`s: arrow keys move between options, the selection is
exposed as `aria-checked`, and each group is a single tab stop. The order summary is an
`aria-live` region, so the running total is announced as it changes. Focus rings are gold on navy
and meet contrast. `prefers-reduced-motion` turns off the reveals and hover lifts.

---

## Link previews

`og:url` and `og:image` in the `<head>` are **absolute** URLs on the live domain,
`https://thanksgiving.hotelsaintlouis.com/`. Social platforms won't resolve a relative `og:image`,
so a relative path means a link preview with no picture.

`og:image` points at **`assets/img/og-share-card.jpg`** — a dedicated 1200 × 630 share card, sized
for link previews. It is **deliberately a different file from the hero photo** on the page; don't
point it back at `hero-glazed-ham.jpg`.

⚠️ **If the page ever moves to a different address, update both tags.** They won't break visibly —
the page still loads fine — the previews just quietly lose their image.
