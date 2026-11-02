<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All wedding details (names, events, venue, gallery, music) live in src/data/wedding.ts; components read only from it so placeholders are edited in one place.
- Guest wishes and RSVPs are written only through server functions using the admin client, so validation, honeypot and rate limits can't be bypassed; tables have no anon access.
- Admin access = Lovable Cloud sign-in plus an 'admin' row in user_roles, checked via has_role in each admin server function.
- Visitor identity uses Cloudflare's cf-connecting-ip (never X-Forwarded-For); rate limits go through the consume_rate_limit DB function (service-role only) so they are atomic.
- RSVP logic lives in dedicated rsvp modules; save before notifying, use saved values for EmailJS, and claim the existing email token atomically to prevent concurrent sends without changing table structure.
- EmailJS configuration uses unprefixed server environment variables and a fixed organizer recipient in the provider template; the browser cannot send notifications or mark delivery.
