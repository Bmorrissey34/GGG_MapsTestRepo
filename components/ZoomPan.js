'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function ZoomPan({
  children,
  className = '',
  minScale = 0.5,
  maxScale = 4,
  initialScale = 1,
  wheelStep = 0.15,
  dblClickStep = 0.5,
  disableDoubleClickZoom = false // Prop to enable/disable double-click zoom functionality
}) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(initialScale);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Utility function to clamp a value between a minimum and maximum range
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // Function to adjust the scale at a specific point (cx, cy) while keeping the cursor anchored
  const setScaleAt = useCallback(
    (next, cx, cy) => {
      const vp = viewportRef.current;
      if (!vp) return;
      const rect = vp.getBoundingClientRect();
      const px = cx - rect.left;
      const py = cy - rect.top;

      const prev = scale;
      next = clamp(next, minScale, maxScale);

      // Calculate the positional adjustments to keep the cursor anchored
      const dx = px / prev - px / next;
      const dy = py / prev - py / next;
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
      setScale(next);
    },
    [scale, minScale, maxScale]
  );

  // ----- Pointer drag pan -----
  const drag = useRef({ active: false, id: null, startX: 0, startY: 0, origX: 0, origY: 0 });

  // Start dragging when the pointer is pressed down
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

  // Update position while dragging
  const onPointerMove = (e) => {
    if (!drag.current.active || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setPos({ x: drag.current.origX + dx / scale, y: drag.current.origY + dy / scale });
  };

  // Stop dragging when the pointer is released
  const onPointerUp = (e) => {
    if (drag.current.id === e.pointerId) drag.current.active = false;
  };

  // ----- Non-passive wheel + touchmove listeners -----
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e) => {
      // Prevent default behavior to stop page scroll while zooming
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      setScaleAt(scale * (1 + wheelStep * dir), e.clientX, e.clientY);
    };

    // Prevent page scroll during pinch gestures on some mobile browsers
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

  // ----- Double click zoom -----
  const onDoubleClick = (e) => {
    if (disableDoubleClickZoom) return; // Skip zooming if double-click zoom is disabled
    e.preventDefault();
    setScaleAt(scale * (1 + dblClickStep), e.clientX, e.clientY);
  };

  // ----- Keyboard helpers -----
  useEffect(() => {
    const onKey = (e) => {
      // Ignore key events if the focus is on an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      // Zoom in/out or reset scale using keyboard shortcuts
      if (e.key === '+' || e.key === '=') setScaleAt(scale * (1 + wheelStep), innerWidth / 2, innerHeight / 2);
      if (e.key === '-' || e.key === '_') setScaleAt(scale * (1 - wheelStep), innerWidth / 2, innerHeight / 2);
      if (e.key === '0') {
        setScale(1);
        setPos({ x: 0, y: 0 });
      }

      // Pan the viewport using arrow keys
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
        overscrollBehavior: 'contain', // Prevent page scroll/refresh bounce during wheel/pinch
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
