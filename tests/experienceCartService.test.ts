import { ExperienceCartService } from "../src/services/experienceCartService";
import { SalesforceCartClient } from "../src/services/salesforceCartClient";
import { InMemoryContextStore } from "../src/stores/inMemoryContextStore";

describe("ExperienceCartService", () => {
  let service: ExperienceCartService;
  let sfClient: SalesforceCartClient;
  let store: InMemoryContextStore;

  beforeEach(() => {
    sfClient = new SalesforceCartClient();
    store = new InMemoryContextStore();
    service = new ExperienceCartService(sfClient, store);
  });

  describe("getOrCreateCart", () => {
    it("creates a new cart for unknown session", () => {
      const cart = service.getOrCreateCart("session-1");
      expect(cart).toBeDefined();
      expect(cart.cartId).toMatch(/^sf-/);
      expect(cart.items).toEqual([]);
      expect(cart.total).toBe(0);
    });

    it("returns existing cart for known session", () => {
      const cart1 = service.getOrCreateCart("session-1");
      const cart2 = service.getOrCreateCart("session-1");
      expect(cart1.cartId).toBe(cart2.cartId);
    });

    it("recreates cart after session context expires", () => {
      const cart1 = service.getOrCreateCart("session-1");
      const cartId1 = cart1.cartId;

      // Mock time to advance past TTL (60 seconds)
      const originalNow = Date.now;
      jest.spyOn(Date, "now").mockReturnValue(originalNow() + 120_000);

      const cart2 = service.getOrCreateCart("session-1");
      const cartId2 = cart2.cartId;

      expect(cartId1).not.toBe(cartId2);
      expect(cart2.items).toEqual([]);

      jest.restoreAllMocks();
    });

    it("handles multiple sessions independently", () => {
      const cart1 = service.getOrCreateCart("session-1");
      const cart2 = service.getOrCreateCart("session-2");

      expect(cart1.cartId).not.toBe(cart2.cartId);
    });
  });

  describe("addItem", () => {
    it("adds item to new cart and calculates total", () => {
      const cart = service.addItem("session-1", "DATA_PACK_10GB", 1, 299);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]).toEqual({
        sku: "DATA_PACK_10GB",
        quantity: 1,
        price: 299,
      });
      expect(cart.total).toBe(299);
    });

    it("adds multiple items to same cart", () => {
      let cart = service.addItem("session-1", "DATA_PACK_10GB", 1, 299);
      cart = service.addItem("session-1", "VOICE_PLAN_100MIN", 2, 199);

      expect(cart.items).toHaveLength(2);
      expect(cart.total).toBe(299 + 2 * 199);
    });

    it("adds multiple quantities of same SKU", () => {
      let cart = service.addItem("session-1", "SMS_PACK_1000", 5, 99);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.total).toBe(5 * 99);
    });

    it("recreates cart and adds item if context expired", () => {
      const cart1 = service.addItem("session-1", "DATA_PACK_10GB", 1, 299);
      const cartId1 = cart1.cartId;

      // Advance time past TTL
      const originalNow = Date.now;
      jest.spyOn(Date, "now").mockReturnValue(originalNow() + 120_000);

      const cart2 = service.addItem("session-1", "VOICE_PLAN_UNLIMITED", 1, 399);

      expect(cart2.cartId).not.toBe(cartId1);
      expect(cart2.items).toHaveLength(1);
      expect(cart2.items[0].sku).toBe("VOICE_PLAN_UNLIMITED");

      jest.restoreAllMocks();
    });
  });

  describe("cart expiry and TTL", () => {
    it("Salesforce cart expires after TTL", () => {
      const cart1 = service.getOrCreateCart("session-1");
      const cartId1 = cart1.cartId;

      // Advance time past TTL
      const originalNow = Date.now;
      jest.spyOn(Date, "now").mockReturnValue(originalNow() + 120_000);

      const cart2 = service.getOrCreateCart("session-1");

      expect(cart1.cartId).not.toBe(cart2.cartId);

      jest.restoreAllMocks();
    });

    it("context store entry expires independently", () => {
      const cart1 = service.getOrCreateCart("session-1");
      expect(store.get("session-1")).toBe(cart1.cartId);

      // Advance time past TTL
      const originalNow = Date.now;
      jest.spyOn(Date, "now").mockReturnValue(originalNow() + 120_000);

      // Context should be expired and return null
      expect(store.get("session-1")).toBeNull();

      jest.restoreAllMocks();
    });
  });

  describe("error handling", () => {
    it("handles invalid cart ID gracefully", () => {
      expect(() => {
        sfClient.getCart("invalid-cart-id");
      }).toThrow("CART_EXPIRED");
    });
  });
});
