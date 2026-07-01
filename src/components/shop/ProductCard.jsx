import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';
import { getCollection } from '@/lib/islandShopConstants';

export default function ProductCard({ product }) {
  const collection = getCollection(product.collection);

  return (
    <a
      href={product.affiliate_link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group block"
    >
      <div className="relative overflow-hidden rounded-xl bg-sand/30 aspect-[3/4] mb-3">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Tag className="w-8 h-8 text-muted-foreground/30" strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3.5 h-3.5 text-foreground" strokeWidth={1.5} />
        </div>
        {product.is_featured && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm">
            <span className="text-[9px] font-medium tracking-luxe-xs uppercase text-ocean">Featured</span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-medium tracking-luxe-xs uppercase text-muted-foreground/60 mb-1">
        {collection.label}
      </p>
      <h3 className="font-heading text-sm text-foreground leading-snug mb-1">{product.name}</h3>
      {product.retailer_name && (
        <p className="text-[11px] text-muted-foreground mb-1.5">{product.retailer_name}</p>
      )}
      <div className="flex items-center justify-between">
        {product.price_range && (
          <span className="text-xs font-medium text-foreground">{product.price_range}</span>
        )}
      </div>
      {product.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-sand/50 text-muted-foreground">{tag}</span>
          ))}
        </div>
      )}
    </a>
  );
}