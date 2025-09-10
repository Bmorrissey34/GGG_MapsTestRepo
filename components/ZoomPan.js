// components/ZoomPan.js
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function ZoomPan({
  children,
  className = '',
  minScale = 0.5,
  maxScale = 4,
  initialScale = 1,
  wheelStep = 0.15,        // ~15% per wheel notch
  dblClickStep = 0.5,      // zoom in by +50% on dblclick
}) {
  const viewportRef = useRef(null);  // scrollable area we interact with
  const stageRef = useRef(null);     // the element we translate/scale
  const [scale, setScale] = useState(initialScale);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Helpers
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const setScaleAt = useCallback((next, cx, cy) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const px = cx - rect.left;  // cursor inside viewport
    const py = cy - rect.top;

    const prev = scale;
    next = clamp(next, minScale, maxScale);

    // keep the point under the cursor stationary by adjusting pan
    const dx = px / prev - px / next;
    const dy = py / prev - py / next;
    setPos(p => ({ x: p.x + dx, y: p.y + dy }));
    setScale(next);
  }, [scale, minScale, maxScale]);

  // Wheel to zoom
  const onWheel = (e) => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1;
    const factor = 1 + (wheelStep * dir);
    setScaleAt(scale * factor, e.clientX, e.clientY);
  };

  // Double-click to zoom in at pointer
  const onDoubleClick = (e) => {
    e.preventDefault();
    setScaleAt(scale * (1 + dblClickStep), e.clientX, e.clientY);
  };

  // Drag to pan (mouse or one-finger touch)
  const drag = useRef({ active: false, id: null, startX: 0, startY: 0, origX: 0, origY: 0 });
  const onPointerDown = (e) => {
    // For multi-touch, let pinch handler take over (handled below)
    if (e.pointerType === 'touch' && pinch.current.ids.size >= 1) return;

    drag.current = {
      active: true,
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (pinch.current.ids.size >= 2) return; // pinch handler active
    if (!drag.current.active || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setPos({ x: drag.current.origX + dx / scale, y: drag.current.origY + dy / scale });
  };
  const onPointerUp = (e) => {
    if (drag.current.id === e.pointerId) drag.current.active = false;
  };

  // Two-finger pinch zoom
  const pinch = useRef({ ids: new Map(), startDist: 0, startScale: initialScale, center: { x: 0, y: 0 } });
  const getDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const getCenter = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  const onPointerDownPinch = (e) => {
    pinch.current.ids.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current.ids.size === 2) {
      const [p1, p2] = [...pinch.current.ids.values()];
      pinch.current.startDist = getDist(p1, p2);
      pinch.current.startScale = scale;
      pinch.current.center = getCenter(p1, p2);
    }
  };
  const onPointerMovePinch = (e) => {
    if (!pinch.current.ids.has(e.pointerId)) return;
    pinch.current.ids.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current.ids.size === 2) {
      const [p1, p2] = [...pinch.current.ids.values()];
      const dist = getDist(p1, p2) || 1;
      const ratio = dist / (pinch.current.startDist || dist);
      const next = clamp(pinch.current.startScale * ratio, minScale, maxScale);
      // zoom around pinch midpoint
      setScaleAt(next, pinch.current.center.x, pinch.current.center.y);
    }
  };
  const onPointerUpPinch = (e) => {
    pinch.current.ids.delete(e.pointerId);
  };

  // Keyboard: + / - / 0 and arrows pan
  useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === '+' || e.key === '=') { setScaleAt(scale * (1 + wheelStep), (window.innerWidth/2), (window.innerHeight/2)); }
      if (e.key === '-' || e.key === '_') { setScaleAt(scale * (1 - wheelStep), (window.innerWidth/2), (window.innerHeight/2)); }
      if (e.key === '0') { setScale(1); setPos({ x: 0, y: 0 }); }
      if (e.key === 'ArrowLeft') setPos(p => ({ ...p, x: p.x + 30 / scale }));
      if (e.key === 'ArrowRight') setPos(p => ({ ...p, x: p.x - 30 / scale }));
      if (e.key === 'ArrowUp') setPos(p => ({ ...p, y: p.y + 30 / scale }));
      if (e.key === 'ArrowDown') setPos(p => ({ ...p, y: p.y - 30 / scale }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scale, setScaleAt, wheelStep]);

  return (
    <div
      ref={viewportRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',    // enable pointer events for touch/pinch
        background: 'white',
      }}
      onWheel={onWheel}
      onDoubleClick={onDoubleClick}
      onPointerDown={(e) => { onPointerDown(e); onPointerDownPinch(e); }}
      onPointerMove={(e) => { onPointerMove(e); onPointerMovePinch(e); }}
      onPointerUp={(e) => { onPointerUp(e); onPointerUpPinch(e); }}
      onPointerCancel={(e) => { onPointerUp(e); onPointerUpPinch(e); }}
    >
      <div
        ref={stageRef}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}
