# DabbaTrack App (Expo + Apollo)

Front-end prototype for the DabbaTrack attendance + billing experience.  
Built with Expo (React Native), Apollo Client (SchemaLink) and dummy GraphQL data.

## Structure

- `App.tsx` – bootstraps Apollo, context, navigation + splash
- `src/apollo` – SchemaLink + executable schema backed by mock data
- `src/screens` – customer and admin flows (Today, Calendar, Billing, Profile, Dashboard, Customers, Settings)
- `src/components` – reusable UI primitives (Screen, Card, Stat cards)
- `src/theme` – colors + layout scale

## Screens & flows

- **Customer**: animated splash → OTP mock login → Today snapshot with quick skip/pause, calendar heatmap, billing history with progress, profile + plan usage.
- **Admin**: dashboard with live stats + plan mix + leaderboards, customer directory with filters, billing console with month recap, settings toggles.
- **GraphQL**: Apollo SchemaLink simulating backend (monthly recap, plan breakdown, leaderboards) so UI stays functional offline.

## Getting started

```bash
npm install
npm start           # press i / a / w to open iOS, Android, or web
```

Login screen is mocked: tap **Login as Customer** or **Login as Admin** to explore either role.  
Skip/Pause/Mark Paid buttons mutate local GraphQL state (no backend required yet).

## Next steps

- Wire SchemaLink to real Apollo Server endpoint when backend is ready
- Replace mock splash illustration under `assets/` with final branding
- Add secure auth + deep linking for payment reminders
