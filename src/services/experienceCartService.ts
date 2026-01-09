import { SalesforceCartClient, Cart } from "./salesforceCartClient.js";
import { InMemoryContextStore } from "../stores/inMemoryContextStore.js";

export class ExperienceCartService {
  constructor(
    private readonly sfClient: SalesforceCartClient,
    private readonly contextStore: InMemoryContextStore
  ) {}

  getOrCreateCart(sessionId: string): Cart {
    const existingCartId = this.contextStore.get(sessionId);

    if (existingCartId) {
      try {
        return this.sfClient.getCart(existingCartId);
      } catch {
        this.contextStore.delete(sessionId);
      }
    }

    const newCart = this.sfClient.createCart();
    this.contextStore.set(sessionId, newCart.cartId);
    return newCart;
  }

  addItem(
    sessionId: string,
    sku: string,
    quantity: number,
    price: number
  ): Cart {
    const cart = this.getOrCreateCart(sessionId);
    return this.sfClient.addItem(cart.cartId, sku, quantity, price);
  }
}
