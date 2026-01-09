export type CartItem = {
  sku: string;
  quantity: number;
  price: number;
};

export type Cart = {
  cartId: string;
  items: CartItem[];
  total: number;
};

type InternalCart = {
  cart: Cart;
  expiresAt: number;
};

export class SalesforceCartClient {
  private carts = new Map<string, InternalCart>();
  private ttlMs = 60_000;

  createCart(): Cart {
    const cartId = `sf-${Math.random().toString(36).slice(2)}`;
    const cart: Cart = { cartId, items: [], total: 0 };

    this.carts.set(cartId, {
      cart,
      expiresAt: Date.now() + this.ttlMs,
    });

    return cart;
  }

  getCart(cartId: string): Cart {
    const entry = this.carts.get(cartId);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new Error("CART_EXPIRED");
    }
    return entry.cart;
  }

  addItem(
    cartId: string,
    sku: string,
    quantity: number,
    price: number
  ): Cart {
    const cart = this.getCart(cartId);
    cart.items.push({ sku, quantity, price });
    cart.total += quantity * price;
    return cart;
  }
}
