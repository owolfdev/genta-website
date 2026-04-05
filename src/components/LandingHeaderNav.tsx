"use client";

import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TerminalChatHeaderIcon } from "@/components/icons/TerminalChatHeaderIcon";
import { CHAT_ROUTE } from "@/lib/routes";
import { LEGAL_ROUTES } from "@/lib/legalRoutes";
import { WAITLIST_OVERLAY } from "@/lib/shellConfig";

const iconLinkClass =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#ffcc66] [text-shadow:0_0_8px_rgba(255,204,102,0.25)] transition hover:text-[#ffe08a] hover:[text-shadow:0_0_14px_rgba(255,204,102,0.4)] sm:h-11 sm:w-11";

function ContactMailHeaderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function LandingHeaderNav() {
  return (
    <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={LEGAL_ROUTES.contact}
            aria-label={WAITLIST_OVERLAY.headerContactTooltip}
            className={iconLinkClass}
          >
            <ContactMailHeaderIcon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          {WAITLIST_OVERLAY.headerContactTooltip}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={CHAT_ROUTE}
            aria-label={WAITLIST_OVERLAY.landingChatCtaLabel}
            className={iconLinkClass}
          >
            <TerminalChatHeaderIcon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          {WAITLIST_OVERLAY.landingChatCtaLabel}
        </TooltipContent>
      </Tooltip>
    </nav>
  );
}
