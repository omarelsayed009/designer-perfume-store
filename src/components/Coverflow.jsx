import { useRef } from 'react';
import { ProductFigure } from './ui.jsx';

function wrapIndex(value, length) {
  return ((value % length) + length) % length;
}

function shortestDistance(index, center, length) {
  let diff = index - center;
  while (diff > length / 2) diff -= length;
  while (diff < -length / 2) diff += length;
  return diff;
}

export function Coverflow({ products, activeIndex, onSelect, onOpen }) {
  const startX = useRef(0);
  const latestX = useRef(0);
  const isPointerDown = useRef(false);

  if (!products.length) {
    return (
      <section className="showcase">
        <div className="carousel-wrap">
          <div className="carousel" />
        </div>
      </section>
    );
  }

  const handlePointerDown = (event) => {
    isPointerDown.current = true;
    startX.current = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
    latestX.current = startX.current;
  };

  const handlePointerMove = (event) => {
    if (!isPointerDown.current) return;
    latestX.current = event.clientX ?? event.touches?.[0]?.clientX ?? latestX.current;
  };

  const handlePointerUp = () => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    const delta = latestX.current - startX.current;
    if (Math.abs(delta) < 50) return;
    onSelect(delta > 0 ? wrapIndex(activeIndex - 1, products.length) : wrapIndex(activeIndex + 1, products.length));
  };

  return (
    <section
      className="showcase"
      tabIndex={0}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onWheel={(event) => {
        event.preventDefault();
        onSelect(event.deltaY > 0 ? wrapIndex(activeIndex + 1, products.length) : wrapIndex(activeIndex - 1, products.length));
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') onSelect(wrapIndex(activeIndex - 1, products.length));
        if (event.key === 'ArrowRight') onSelect(wrapIndex(activeIndex + 1, products.length));
        if (event.key === 'Enter') onOpen(products[activeIndex]);
      }}
    >
      <button className="arrow left" type="button" aria-label="Previous perfume" onClick={() => onSelect(wrapIndex(activeIndex - 1, products.length))}>
        Prev
      </button>
      <div className="carousel-wrap">
        <div className="carousel">
          {products.map((product, index) => {
            const distance = shortestDistance(index, activeIndex, products.length);
            const absDistance = Math.abs(distance);
            const compact = typeof window !== 'undefined' && window.innerWidth < 780;
            const cardGap = compact ? 142 : 188;
            const cardLift = compact ? 58 : 84;
            const cardDrop = compact ? 14 : 18;
            const clampedDistance = Math.min(absDistance, 3);
            const translateX = distance * cardGap;
            const translateY = clampedDistance * cardDrop;
            const translateZ = Math.max(0, cardLift - clampedDistance * 26);
            const rotateY = distance * -18;
            const scale = Math.max(0.72, 1 - clampedDistance * 0.12);
            const opacity = absDistance > 3.2 ? 0 : Math.max(0.18, 1 - clampedDistance * 0.22);

            return (
              <article
                key={product.id}
                className={`product-card ${index === activeIndex ? 'active' : ''}`}
                style={{
                  transform: `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex: Math.round(100 - clampedDistance * 10),
                  pointerEvents: absDistance > 3.2 ? 'none' : 'auto'
                }}
                onClick={() => (index === activeIndex ? onOpen(product) : onSelect(index))}
              >
                <div className="floor-shadow" />
                <ProductFigure product={product} variant="carousel" />
              </article>
            );
          })}
        </div>
      </div>
      <button className="arrow right" type="button" aria-label="Next perfume" onClick={() => onSelect(wrapIndex(activeIndex + 1, products.length))}>
        Next
      </button>
    </section>
  );
}
