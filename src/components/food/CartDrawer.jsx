import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartDrawer({ cart, onUpdate, onRemove, onClose, onCheckout, fulfillmentType, deliveryFee, subtotal, total }) {
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ShoppingBag className="w-10 h-10 mb-3 opacity-30" />
        <p className="font-medium">Your cart is empty</p>
        <p className="text-sm">Add items to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 py-4">
        {cart.map(item => (
          <div key={item.menu_item_id} className="flex items-center gap-3 bg-secondary rounded-xl p-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">${item.price} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onUpdate(item.menu_item_id, item.quantity - 1)}
                className="w-7 h-7 rounded-full bg-card border flex items-center justify-center">
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
              <button onClick={() => onUpdate(item.menu_item_id, item.quantity + 1)}
                className="w-7 h-7 rounded-full bg-card border flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </button>
              <button onClick={() => onRemove(item.menu_item_id)} className="ml-1 text-red-400 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm font-bold w-12 text-right">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
        </div>
        {fulfillmentType === 'delivery' && deliveryFee > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery fee</span><span>${deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t pt-2">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
        <Button onClick={onCheckout} className="w-full h-11 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold mt-2">
          Place Order — ${total.toFixed(2)}
        </Button>
      </div>
    </div>
  );
}