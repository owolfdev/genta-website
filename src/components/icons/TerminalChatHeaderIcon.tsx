type Props = { className?: string };

/** Same mark as the landing + chat “open terminal” control (24×24 viewBox). */
export function TerminalChatHeaderIcon({ className }: Props) {
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
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 10 9 12l-2 2" />
      <path d="M11 14h6" />
    </svg>
  );
}
