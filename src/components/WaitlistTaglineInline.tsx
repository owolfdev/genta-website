import Link from "next/link";
import { WAITLIST_OVERLAY } from "@/lib/shellConfig";

const waitlistWordClass =
  "text-inherit underline decoration-[#4a6b58] underline-offset-[0.2em] transition hover:text-[#ffcc66] hover:decoration-[#7aab8a] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8892e]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080602]";

/** Same wording as {@link WAITLIST_OVERLAY.tagline}; links “waitlist” to the landing `#waitlist` section. */
export function WaitlistTaglineInline() {
  return (
    <>
      {WAITLIST_OVERLAY.taglineLead}
      <Link href="/#waitlist" className={waitlistWordClass}>
        waitlist
      </Link>
      {WAITLIST_OVERLAY.taglineAfterWaitlistWord}
    </>
  );
}
