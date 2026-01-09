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

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}
