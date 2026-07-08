import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';

export default function PhotoGallery({ images = [], name }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const scrollRef = useRef(null);

  if (!images || images.length === 0) return null;

  const scrollTo = (idx) => {
    setActiveIndex(idx);
    if (scrollRef.current) {
      const child = scrollRef.current.children[idx];
      if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const next = (e) => {
    e.stopPropagation();
    scrollTo((activeIndex + 1) % images.length);
  };
  const prev = (e) => {
    e.stopPropagation();
    scrollTo((activeIndex - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="relative">
        {/* Main image */}
        <div className="relative h-56 bg-muted overflow-hidden rounded-2xl" onClick={() => setLightbox(true)}>
          <img src={images[activeIndex]} alt={`${name} ${activeIndex + 1}`} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors">
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors">
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); scrollTo(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
          <button onClick={() => setLightbox(true)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors">
            <Expand className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div ref={scrollRef} className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
            {images.map((url, i) => (
              <button key={i} onClick={() => scrollTo(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeIndex ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={url} alt={`${name} thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <img src={images[activeIndex]} alt={`${name} large`} className="max-w-full max-h-[85vh] object-contain" />
        </div>
      )}
    </>
  );
}