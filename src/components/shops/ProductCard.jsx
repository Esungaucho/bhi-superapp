import React from 'react';

export default function ProductCard({ product, shopName, onAdd }) {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0;

  return (
    <div className="bg-card rounded-2xl border overflow-hidden flex flex-col">
      <div className="h-36 bg-secondary relative overflow-hidden">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🛍️</div>
        }
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">Sold Out</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        {shopName && <p className="text-[10px] text-muted-foreground mb-0.5">{shopName}</p>}
        <p className="text-sm font-semibold leading-tight flex-1">{product.name}</p>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-base font-bold text-foreground">${product.price}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through ml-1">${product.compare_at_price}</span>
            )}
          </div>
          {onAdd && product.is_available && (
            <button onClick={() => onAdd(product)}
              className="w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-lg font-bold hover:bg-accent/80 transition-colors">
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}