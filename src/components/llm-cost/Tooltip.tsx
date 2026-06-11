'use client';

// Portal-based tooltip. Renders into document.body with fixed coordinates,
// so it can never be clipped by `overflow-hidden` ancestors or lose a
// z-index fight with sibling cards. Keyboard-focusable for accessibility.

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

const TIP_WIDTH = 256;

export default function Tooltip({ content }: { content: string }) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    const r = anchorRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = Math.max(8, Math.min(r.left - TIP_WIDTH / 2, window.innerWidth - TIP_WIDTH - 8));
    setPos({ top: r.top - 8, left });
  };
  const hide = () => setPos(null);

  return (
    <>
      <span
        ref={anchorRef}
        tabIndex={0}
        className="inline-flex outline-none"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <Info className="h-3 w-3 cursor-help text-slate-500 transition-colors hover:text-slate-300" />
      </span>
      {pos &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[9999] -translate-y-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-[11px] leading-relaxed text-slate-200 shadow-xl"
            style={{ top: pos.top, left: pos.left, width: TIP_WIDTH }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
