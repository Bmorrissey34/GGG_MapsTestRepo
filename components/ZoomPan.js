'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function ZoomPan({
  children,
  className = '',
  minScale = 0.5,
  maxScale = 4,
  initialScale = 1,
  wheelStep = 0.15,
  dblClickStep = 0.5
}) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(initialScale);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const setScaleAt = useCallback(
    (next, cx, cy) => {
      const vp = viewportRef.current;
      if (!vp) return;
      const rect = vp.getBoundingClientRect();
      const px = cx - rect.left;
      const py = cy - rect.top;

      const prev = scale;
      next = clamp(next, minScale, maxScale);

      // keep cursor anchored while zooming
      const dx = px / prev - px / next;
      const dy = py / prev - py / next;
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
      setScale(next);
    },
    [scale, minScale, maxScale]
  );

  // ----- Pointer drag pan -----
  const drag = useRef({ active: false, id: null, startX: 0, startY: 0, origX: 0, origY: 0 });

  const onPointerDown = (e) => {
    drag.current = {
      active: true,
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drag.current.active || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setPos({ x: drag.current.origX + dx / scale, y: drag.current.origY + dy / scale });
  };

  const onPointerUp = (e) => {
    if (drag.current.id === e.pointerId) drag.current.active = false;
  };

  // ----- Non-passive wheel + touchmove listeners -----
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e) => {
      // We **need** preventDefault to stop page scroll while zooming
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      setScaleAt(scale * (1 + wheelStep * dir), e.clientX, e.clientY);
    };

    // Some mobile browsers still deliver pinch as touchmove; block page scroll
    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel, { passive: false });
      el.removeEventListener('touchmove', onTouchMove, { passive: false });
    };
  }, [scale, wheelStep, setScaleAt]);

  // ----- Double click zoom (ok to use React handler) -----
  const onDoubleClick = (e) => {
    e.preventDefault();
    setScaleAt(scale * (1 + dblClickStep), e.clientX, e.clientY);
  };

  // ----- Keyboard helpers -----
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === '+' || e.key === '=') setScaleAt(scale * (1 + wheelStep), innerWidth / 2, innerHeight / 2);
      if (e.key === '-' || e.key === '_') setScaleAt(scale * (1 - wheelStep), innerWidth / 2, innerHeight / 2);
      if (e.key === '0') {
        setScale(1);
        setPos({ x: 0, y: 0 });
      }
      if (e.key === 'ArrowLeft') setPos((p) => ({ ...p, x: p.x + 30 / scale }));
      if (e.key === 'ArrowRight') setPos((p) => ({ ...p, x: p.x - 30 / scale }));
      if (e.key === 'ArrowUp') setPos((p) => ({ ...p, y: p.y + 30 / scale }));
      if (e.key === 'ArrowDown') setPos((p) => ({ ...p, y: p.y - 30 / scale }));
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [scale, setScaleAt, wheelStep]);

  return (
    <div
      ref={viewportRef}
      className={className}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        // Prevent the page from scrolling/refresh bouncing during wheel/pinch.
        overscrollBehavior: 'contain',
        background: 'white'
      }}
    >
      <div
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
}
