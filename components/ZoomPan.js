'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// ZoomPan component allows for zooming and panning of its children
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

  // Clamp value between min and max
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // Set scale at a specific point
  const setScaleAt = useCallback(
    (next, cx, cy) => {
      const vp = viewportRef.current;
      if (!vp) return;
      const rect = vp.getBoundingClientRect();
      const px = cx - rect.left;
      const py = cy - rect.top;

      const prev = scale;
      next = clamp(next, minScale, maxScale);

      const dx = px / prev - px / next;
      const dy = py / prev - py / next;
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
      setScale(next);
    },
    [scale, minScale, maxScale]
  );

  // ----- Pointer drag pan -----
  const drag = useRef({
    active: false,
    id: null,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    captured: false,
    dragged: false
  });
  const TAP_SLOP = 4; // px before we consider it a drag

  // Handle pointer down event
  const onPointerDown = (e) => {
    drag.current = {
      active: true,
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      captured: false,
      dragged: false
    };
    // Do NOT setPointerCapture yet; wait until the user actually drags
  };

  // Handle pointer move event
  const onPointerMove = (e) => {
    if (!drag.current.active || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    const dist = Math.hypot(dx, dy);

    // Acquire capture only after moving past the threshold
    if (!drag.current.captured && dist > TAP_SLOP) {
      drag.current.captured = true;
      drag.current.dragged = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    if (drag.current.captured) {
      setPos({
        x: drag.current.origX + dx / scale,
        y: drag.current.origY + dy / scale
      });
    }
  };

  // Handle pointer up event
  const onPointerUp = (e) => {
    if (drag.current.id === e.pointerId) {
      if (drag.current.captured) {
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
      }
      // Reset; if not dragged, the native click will go to the SVG target
      drag.current.active = false;
      drag.current.captured = false;
      // If it was a drag, suppress the synthetic click on the container
      drag.current._suppressClickOnce = drag.current.dragged;
      drag.current.dragged = false;
    }
  };

  // Suppress container-level click after a drag so it doesn’t interfere
  const onClickCapture = (e) => {
    if (drag.current._suppressClickOnce) {
      drag.current._suppressClickOnce = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // ----- Non-passive wheel + touchmove listeners -----
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    // Handle wheel event for zooming
    const onWheel = (e) => {
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      setScaleAt(scale * (1 + wheelStep * dir), e.clientX, e.clientY);
    };

    // Prevent default touchmove behavior for multi-touch
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

  // Handle double-click event for zooming
  const onDoubleClick = (e) => {
    if (disableDoubleClickZoom) return;
    e.preventDefault();
    setScaleAt(scale * (1 + dblClickStep), e.clientX, e.clientY);
  };

  // Handle keyboard events for zooming and panning
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
      onClickCapture={onClickCapture}
      style={{
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        overscrollBehavior: 'contain',
        background: 'white',
        cursor: drag.current.captured ? 'grabbing' : 'grab'
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
