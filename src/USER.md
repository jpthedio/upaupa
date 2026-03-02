# Primary User Persona: Tita Cecille

## Profile
- **Name:** Tita Cecille
- **Age:** ~60 years old
- **Gender:** Female
- **Location:** Metro Manila, Philippines (Las Pinas area)
- **Occupation:** Small-scale landlord managing 2-3 apartment buildings

## Tech Profile
- **Device:** Android phone (mid-range), occasionally a tablet
- **Apps she uses daily:** Facebook, TikTok, GCash, Viber
- **Apps she avoids:** Anything that requires account creation or passwords she can't remember
- **Browser:** Chrome (default, never changed)
- **Tech comfort:** Low — can navigate Facebook and GCash confidently, struggles with new interfaces

## How She Manages Rent Today
- Paper notebook or mental tracking
- Follows up via Viber or in-person visits
- Receives payments through GCash, bank transfer, or cash
- Asks a nephew/niece for help with anything "techy"

## Usage Patterns
- Opens UpaUpa 2-4x per month, mostly around due dates (1st-5th of month)
- Primary question: "Sino pa hindi nakabayad?" (Who hasn't paid yet?)
- Secondary actions: Record a payment, check a specific tenant, look at monthly totals
- Rarely adds/removes buildings or tenants (maybe once every few months)

## Design Implications
- **Large tap targets** — fingers, not precise mouse clicks
- **Color-coded status** — red = needs attention, green = all good (universal, no reading needed)
- **No jargon** — "Record Payment" not "Create Transaction", "Tenants" not "Lessees"
- **Peso formatting** — always show ₱ symbol, Philippine locale
- **Card-based layout** — visual hierarchy over dense tables (though table view available for those who want it)
- **Minimal navigation** — 5 tabs max, bottom nav on mobile for thumb reach
- **Forgiving UI** — confirmation dialogs before deletes, edit buttons always visible on hover/tap
- **Fast load** — she'll close the tab if it takes more than 3 seconds
- **Offline-first** — localStorage means it works even with spotty Globe/Smart signal
- **Filipino context** — month names in English (universally understood), date format familiar to PH users
