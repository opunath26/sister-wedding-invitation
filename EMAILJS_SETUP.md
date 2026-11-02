# RSVP notification setup

RSVPs are saved before notification is attempted. Missing settings or provider failures leave `email_sent = false`; the guest still receives the saved confirmation. A successful EmailJS HTTP response means accepted by EmailJS, not proof of inbox delivery.

## EmailJS account
1. Connect your sending email service in EmailJS and copy its service ID.
2. Create a notification template. Set **To Email** to the wedding organizer's actual email as a fixed value, not a guest-controlled template variable.
3. Include these variables in the template: `{{guest_name}}`, `{{phone}}`, `{{attendance}}`, `{{guest_count}}`, `{{message}}`, `{{submitted_at}}`. Optional: `{{submission_id}}` for identifying duplicates. Use escaped double-brace variables, not unescaped triple braces.
4. Copy the template ID and public key (Account page).
5. In **Account → Security**, enable private-key authorization and server/non-browser API access if that option is present in your account. Copy the private key. Keep private authorization required; browser domain allowlisting alone does not protect a server endpoint.
6. Save these four settings in Lovable's project secrets, without a `VITE_` prefix:
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_PUBLIC_KEY`
   - `EMAILJS_PRIVATE_KEY`
7. Submit a real RSVP and check EmailJS history plus the organizer inbox. Publish the app to deploy updated secrets to the published site.

The former `VITE_EMAILJS_*` browser settings are no longer used by RSVP. Do not place the private key in them.

## Limits and recovery
EmailJS documents a one-request-per-second limit; bursts can fail and leave a saved RSVP awaiting retry. The existing guest retry requires the original token and is valid for one hour. Tokens are held only in the submitting page; reloading loses the retry capability. No scheduled queue is implemented.

The existing token column is claimed atomically while sending, preventing concurrent sends without altering the table. If the process dies mid-send, or EmailJS accepts the email but the final database update fails, the claim remains to prevent automatic duplicate email. Inspect EmailJS history before any manual recovery. Ambiguous network timeouts cannot guarantee exactly-once email delivery; match `submission_id` in the provider history before retrying. RSVP persistence remains independent of delivery.

Official references: https://www.emailjs.com/docs/rest-api/send/ and https://www.emailjs.com/docs/sdk/options/