"use client";

type MuteButtonProps = {
  muted: boolean;
  onToggle: () => void;
};

export function MuteButton({ muted, onToggle }: MuteButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={muted ? "빗소리 켜기" : "빗소리 끄기"}
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 50,
        width: 44,
        height: 44,
        background: "transparent",
        border: "1.5px solid var(--ink-dim)",
        borderRadius: "50%",
        cursor: "pointer",
        color: "var(--ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s ease, transform 0.1s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        {muted ? (
          <>
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        ) : (
          <>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        )}
      </svg>
    </button>
  );
}
