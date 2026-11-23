# Mageywallet website

The public website for Mageywallet, a spending tracker for the Maldives that reads BML and MIB transfer slips and keeps everything on the phone.

Live at <https://shahjaufar.github.io/mageywallet-site/>.

| Page | English | Dhivehi |
|---|---|---|
| Home | `index.html` | `dv/index.html` |
| Privacy policy | `privacy.html` | `dv/privacy.html` |
| Support | `support.html` | `dv/support.html` |

Plain HTML and CSS, served by GitHub Pages from the `main` branch. No build step. The app's source code is not in this repository.

## Editing

- The English privacy policy is the authoritative version. If it changes, update the Dhivehi copy and the effective date in both.
- Screenshots in `assets/screens/` use made-up names and amounts. Never add a real bank slip, name, account number or reference.
- When the app is live on Google Play, replace the "Coming soon on Google Play" text in both home pages with a link to `https://play.google.com/store/apps/details?id=com.salhi.mageywallet`.

## Fonts

- Dhivehi text uses [Open Thaana](https://github.com/siyamex/Open-Thaana-Font), the same font the app bundles, served from `assets/fonts/` under the SIL Open Font License 1.1 (`assets/fonts/OFL-OpenThaana.txt`). It has Thaana letters only, so Latin letters and digits fall through to Manrope. It has one weight; bold headings are synthesised by the browser, and `size-adjust: 115%` makes its letters match Manrope's size.
- Bricolage Grotesque and Manrope load from Google Fonts.
