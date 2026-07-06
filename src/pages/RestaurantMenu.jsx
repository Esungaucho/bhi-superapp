import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Star, ShoppingBag, ChevronLeft, Plus, CheckCircle2, Globe, UtensilsCrossed, Phone, MapPin, CalendarClock, Bird } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartDrawer from '@/components/food/CartDrawer';
import { addMinutes, format } from 'date-fns';

// Commission tiers: pickup 12%, delivery 15%, dine_in 18%
const COMMISSION_RATES = { pickup: 0.12, delivery: 0.15, dine_in: 0.18 };

function generateRef() {
  return 'BHI-F-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

export default function RestaurantMenu() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [cart, setCart] = useState([]);
  const [fulfillmentType, setFulfillmentType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const { data: restaurants = [], isLoading: loadingRestaurant } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => base44.entities.Restaurant.list(),
  });

  const { data: menuItems = [], isLoading: loadingMenu } = useQuery({
    queryKey: ['menuItems', restaurantId],
    queryFn: () => base44.entities.MenuItem.filter({ restaurant_id: restaurantId }),
    enabled: !!restaurantId,
  });

  const restaurant = restaurants.find(r => r.id === restaurantId);

  const categories = useMemo(() => {
    return [...new Set(menuItems.map(i => i.category).filter(Boolean))];
  }, [menuItems]);

  const displayCategory = activeCategory || categories[0];

  const filteredItems = useMemo(() => {
    if (!displayCategory) return menuItems.filter(i => i.is_available !== false);
    return menuItems.filter(i => i.category === displayCategory && i.is_available !== false);
  }, [menuItems, displayCategory]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = fulfillmentType === 'delivery' ? (restaurant?.delivery_fee || 3) : 0;
  const total = subtotal + deliveryFee;
  const commissionRate = COMMISSION_RATES[fulfillmentType] || 0.15;
  const commission = Math.round(total * commissionRate * 100) / 100;

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.menu_item_id === item.id);
      if (existing) return prev.map(c => c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateCart = (menuItemId, quantity) => {
    if (quantity <= 0) setCart(prev => prev.filter(c => c.menu_item_id !== menuItemId));
    else setCart(prev => prev.map(c => c.menu_item_id === menuItemId ? { ...c, quantity } : c));
  };

  const orderMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('place-food-order', {
        restaurant_id: restaurantId,
        cart: cart.map(c => ({ menu_item_id: c.menu_item_id, quantity: c.quantity })),
        fulfillment_type: fulfillmentType,
        delivery_address: deliveryAddress,
        special_instructions: specialInstructions,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setConfirmed(data);
      setCart([]);
      setShowCart(false);
      queryClient.invalidateQueries({ queryKey: ['myFoodOrders'] });
    },
    onError: (error) => {
      setOrderError(error?.response?.data?.error || error?.message || 'Order failed');
    },
  });

  const isLoading = loadingRestaurant || loadingMenu;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;

  if (!restaurant) return (
    <div className="px-4 py-12 text-center text-muted-foreground">
      <p className="text-4xl mb-2">🍽️</p>
      <p className="font-medium">Restaurant not found</p>
      <Link to="/food" className="text-accent text-sm font-semibold mt-3 inline-block hover:underline">← Back to Food</Link>
    </div>
  );

  if (confirmed) {
    return (
      <div className="px-4 py-8">
        <div className="bg-card rounded-2xl border p-6 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold">Order Placed! 🎉</h2>
          <div className="bg-secondary rounded-xl p-4 space-y-1 text-sm text-muted-foreground">
            <p className="font-bold text-foreground">{restaurant.name}</p>
            <p className="capitalize">{confirmed.fulfillment_type.replace('_', '-')} order</p>
            <p>{confirmed.items_count} item{confirmed.items_count > 1 ? 's' : ''} · ${confirmed.total_price.toFixed(2)}</p>
            {confirmed.estimated_ready_time && (
              <p className="font-semibold text-foreground">
                {confirmed.fulfillment_type === 'delivery' ? '🛵 Delivery by' : '⏱️ Ready by'}{' '}
                {format(new Date(confirmed.estimated_ready_time), 'h:mm a')}
              </p>
            )}
            <p className="text-[11px] font-mono mt-1">{confirmed.order_ref}</p>
          </div>
          <Link to="/food/my-orders" className="block text-accent font-semibold text-sm hover:underline">Track My Orders →</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative h-44 bg-muted overflow-hidden">
        <img src={restaurant.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'}
          alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-3 left-3 bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="absolute bottom-3 left-4 text-white">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`w-2 h-2 rounded-full ${restaurant.is_open ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span className="text-xs">{restaurant.is_open ? 'Open' : 'Closed'} · {restaurant.hours}</span>
          </div>
          <h2 className="text-xl font-bold">{restaurant.name}</h2>
          <p className="text-xs text-white/70">{restaurant.cuisine}{restaurant.location ? ` · ${restaurant.location}` : ''}</p>
        </div>
        {restaurant.rating && (
          <div className="absolute bottom-3 right-4 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-white">{restaurant.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 grid grid-cols-3 gap-2 border-b border-border">
        {restaurant.website_url && (
          <ActionBtn icon={Globe} label="Website" href={restaurant.website_url} />
        )}
        {restaurant.menu_url && (
          <ActionBtn icon={UtensilsCrossed} label="Menu" href={restaurant.menu_url} />
        )}
        {restaurant.phone && (
          <ActionBtn icon={Phone} label="Call" href={`tel:${restaurant.phone}`} />
        )}
        {restaurant.address && (
          <ActionBtn icon={MapPin} label="Directions" href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} />
        )}
        {restaurant.reservation_url && (
          <ActionBtn icon={CalendarClock} label="Reserve" href={restaurant.reservation_url} />
        )}
        <Link to="/birdie/new" className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-accent/10 text-accent hover:bg-accent/15 transition-colors">
          <Bird className="w-4 h-4" />
          <span className="text-[10px] font-semibold leading-tight text-center">Book Birdie</span>
        </Link>
      </div>

      {/* Price + description */}
      {(restaurant.price_range || restaurant.description) && (
        <div className="px-4 py-3 border-b border-border">
          {restaurant.price_range && (
            <span className="inline-block text-xs font-bold text-foreground bg-sand px-2 py-0.5 rounded-full mb-2">{restaurant.price_range}</span>
          )}
          {restaurant.description && <p className="text-sm text-muted-foreground leading-relaxed">{restaurant.description}</p>}
        </div>
      )}

      {/* Photo gallery */}
      {restaurant.gallery?.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {restaurant.gallery.map((url, idx) => (
              <img key={idx} src={url} alt={`${restaurant.name} ${idx + 1}`} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
            ))}
          </div>
        </div>
      )}

      {/* Attributes */}
      {(
        restaurant.is_waterfront || restaurant.has_outdoor_seating || restaurant.has_indoor_seating ||
        restaurant.is_kid_friendly || restaurant.is_dog_friendly ||
        restaurant.has_vegan_options || restaurant.has_gluten_free_options || restaurant.has_vegetarian_options ||
        restaurant.offers_takeout || restaurant.offers_delivery || restaurant.offers_catering || restaurant.supports_private_events ||
        restaurant.dress_code ||
        restaurant.is_featured_partner || restaurant.is_birdie_trusted_partner || restaurant.is_concierge_recommended
      ) && (
        <div className="px-4 py-2.5 flex flex-wrap gap-1.5 border-b border-border">
          {restaurant.is_waterfront && <AttrBadge label="Waterfront" />}
          {restaurant.has_outdoor_seating && <AttrBadge label="Outdoor Seating" />}
          {restaurant.has_indoor_seating && <AttrBadge label="Indoor Seating" />}
          {restaurant.is_kid_friendly && <AttrBadge label="Kid-Friendly" />}
          {restaurant.is_dog_friendly && <AttrBadge label="Dog-Friendly" />}
          {restaurant.has_vegan_options && <AttrBadge label="Vegan Options" />}
          {restaurant.has_gluten_free_options && <AttrBadge label="Gluten-Free" />}
          {restaurant.has_vegetarian_options && <AttrBadge label="Vegetarian" />}
          {restaurant.offers_takeout && <AttrBadge label="Takeout" />}
          {restaurant.offers_delivery && <AttrBadge label="Delivery" />}
          {restaurant.offers_catering && <AttrBadge label="Catering" />}
          {restaurant.supports_private_events && <AttrBadge label="Private Events" />}
          {restaurant.dress_code && <AttrBadge label={`Dress: ${restaurant.dress_code}`} />}
          {restaurant.is_birdie_trusted_partner && <AttrBadge label="Birdie Trusted" icon={Bird} featured />}
          {restaurant.is_concierge_recommended && <AttrBadge label="Concierge Recommended" featured />}
          {restaurant.is_featured_partner && <AttrBadge label="Featured Partner" featured />}
        </div>
      )}

      {/* Fulfillment picker */}
      {restaurant.fulfillment_types?.length > 0 && (
        <div className="px-4 py-3 flex gap-2">
          {restaurant.fulfillment_types.map(type => (
            <button key={type} onClick={() => setFulfillmentType(type)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
                fulfillmentType === type
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-card text-muted-foreground border-border'
              }`}>
              {type === 'pickup' ? '🥡' : type === 'delivery' ? '🛵' : '🪑'} {type.replace('_', ' ')}
              <span className="ml-1 text-[10px] opacity-70">({(COMMISSION_RATES[type] * 100).toFixed(0)}%)</span>
            </button>
          ))}
        </div>
      )}

      {/* Delivery address */}
      {fulfillmentType === 'delivery' && (
        <div className="px-4 pb-2">
          <input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
            placeholder="🏠 Delivery address on BHI…"
            className="w-full px-3 py-2.5 rounded-xl bg-card border text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>
      )}

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-b">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                displayCategory === cat
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>{cat}</button>
          ))}
        </div>
      )}

      {/* Menu items */}
      <div className="px-4 py-3 space-y-2 pb-28">
        {filteredItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No items in this category</p>
        ) : filteredItems.map(item => {
          const inCart = cart.find(c => c.menu_item_id === item.id);
          return (
            <div key={item.id} className="bg-card rounded-xl border p-3 flex items-center gap-3">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{item.name}
                      {item.is_popular && <span className="ml-1.5 text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold">POPULAR</span>}
                    </p>
                    {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                    {item.calories && <p className="text-[10px] text-muted-foreground mt-0.5">{item.calories} cal</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-sm font-bold">${item.price.toFixed(2)}</span>
                  {inCart ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateCart(item.id, inCart.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">−</button>
                      <span className="text-xs font-bold w-4 text-center">{inCart.quantity}</span>
                      <button onClick={() => updateCart(item.id, inCart.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)}
                      className="w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:opacity-90">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[390px] z-40">
          <button onClick={() => setShowCart(true)}
            className="w-full bg-accent text-accent-foreground rounded-2xl py-3.5 flex items-center justify-between px-5 shadow-xl">
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
            <span className="font-semibold">View Cart</span>
            <span className="font-bold">${total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Cart sheet */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowCart(false)}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background rounded-t-2xl p-5 max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Your Cart
              </h3>
              <button onClick={() => setShowCart(false)} className="text-muted-foreground text-xl leading-none">×</button>
            </div>
            <div className="mb-3">
              <input value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
                placeholder="Special instructions (optional)…"
                className="w-full px-3 py-2 rounded-xl bg-secondary text-sm border-0 focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <CartDrawer
              cart={cart}
              onUpdate={updateCart}
              onRemove={(id) => setCart(prev => prev.filter(c => c.menu_item_id !== id))}
              onClose={() => setShowCart(false)}
              onCheckout={() => orderMutation.mutate()}
              fulfillmentType={fulfillmentType}
              deliveryFee={deliveryFee}
              subtotal={subtotal}
              total={total}
            />
            {orderMutation.isPending && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-t-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon: Icon, label, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-card border border-border hover:border-accent/40 hover:bg-sand/30 transition-colors">
      <Icon className="w-4 h-4 text-foreground/70" />
      <span className="text-[10px] font-semibold leading-tight text-center text-foreground">{label}</span>
    </a>
  );
}

function AttrBadge({ label, featured, icon: Icon }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-1 rounded-full ${featured ? 'bg-accent/15 text-accent' : 'bg-sand text-muted-foreground'}`}>
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}