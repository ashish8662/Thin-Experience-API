import request from "supertest";
import { Application } from "express";
import { createApp } from "../src/server";

describe("Cart Routes", () => {
  let app: Application;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /api/cart", () => {
    it("returns 400 if sessionId is missing", async () => {
      const res = await request(app).get("/api/cart");
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/sessionId/i);
    });

    it("returns 400 if sessionId is empty", async () => {
      const res = await request(app).get("/api/cart?sessionId=");
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/sessionId/i);
    });

    it("creates and returns new cart for valid sessionId", async () => {
      const res = await request(app).get("/api/cart?sessionId=test-session-1");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("cartId");
      expect(res.body).toHaveProperty("items");
      expect(res.body).toHaveProperty("total");
      expect(res.body.items).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it("returns same cart for same sessionId", async () => {
      const res1 = await request(app).get("/api/cart?sessionId=test-session-1");
      const cartId1 = res1.body.cartId;

      const res2 = await request(app).get("/api/cart?sessionId=test-session-1");
      const cartId2 = res2.body.cartId;

      expect(cartId1).toBe(cartId2);
    });
  });

  describe("POST /api/cart/items", () => {
    it("returns 400 if sessionId is missing", async () => {
      const res = await request(app).post("/api/cart/items").send({
        sku: "DATA_PACK_10GB",
        quantity: 1,
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/sessionId/i);
    });

    it("returns 400 if sku is missing", async () => {
      const res = await request(app).post("/api/cart/items").send({
        sessionId: "test-session-1",
        quantity: 1,
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/sku/i);
    });

    it("returns 400 if quantity is invalid", async () => {
      const res = await request(app).post("/api/cart/items").send({
        sessionId: "test-session-1",
        sku: "DATA_PACK_10GB",
        quantity: 0,
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/quantity/i);
    });

    it("returns 400 if quantity is not an integer", async () => {
      const res = await request(app).post("/api/cart/items").send({
        sessionId: "test-session-1",
        sku: "DATA_PACK_10GB",
        quantity: 1.5,
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/quantity/i);
    });

    it("returns 400 for unknown SKU", async () => {
      const res = await request(app).post("/api/cart/items").send({
        sessionId: "test-session-1",
        sku: "UNKNOWN_SKU",
        quantity: 1,
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Unknown product SKU/i);
    });

    it("adds item to cart with valid input", async () => {
      const res = await request(app).post("/api/cart/items").send({
        sessionId: "test-session-1",
        sku: "DATA_PACK_10GB",
        quantity: 2,
      });
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]).toEqual({
        sku: "DATA_PACK_10GB",
        quantity: 2,
        price: 299,
      });
      expect(res.body.total).toBe(598);
    });

    it("adds multiple items to same cart", async () => {
      await request(app).post("/api/cart/items").send({
        sessionId: "test-session-1",
        sku: "DATA_PACK_10GB",
        quantity: 1,
      });

      const res = await request(app).post("/api/cart/items").send({
        sessionId: "test-session-1",
        sku: "VOICE_PLAN_100MIN",
        quantity: 1,
      });

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(299 + 199);
    });
  });

  describe("GET /api/cart/:sessionId", () => {
    it("returns 400 if sessionId is empty", async () => {
      const res = await request(app).get("/api/cart/");
      expect(res.status).toBe(400);
    });

    it("creates and returns cart for valid sessionId", async () => {
      const res = await request(app).get("/api/cart/test-session-1");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("cartId");
      expect(res.body.items).toEqual([]);
    });

    it("returns same cart for same sessionId", async () => {
      const res1 = await request(app).get("/api/cart/test-session-1");
      const cartId1 = res1.body.cartId;

      const res2 = await request(app).get("/api/cart/test-session-1");
      const cartId2 = res2.body.cartId;

      expect(cartId1).toBe(cartId2);
    });
  });

  describe("Health Check", () => {
    it("GET /health returns 200", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });
});
