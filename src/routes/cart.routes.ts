import { Router, Request, Response } from "express";
import { ExperienceCartService } from "../services/experienceCartService.js";
import { getPrice } from "../domain/pricing.js";

export function createCartRoutes(service: ExperienceCartService): Router {
  const router = Router();

  router.get("/cart", (req: Request, res: Response) => {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
      res.status(400).json({ error: "sessionId is required and must be a non-empty string" });
      return;
    }

    try {
      const cart = service.getOrCreateCart(sessionId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: "Failed to get or create cart" });
    }
  });

  router.post("/cart/items", (req: Request, res: Response) => {
    const { sessionId, sku, quantity } = req.body;

    if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
      res.status(400).json({ error: "sessionId is required and must be a non-empty string" });
      return;
    }

    if (!sku || typeof sku !== "string" || !sku.trim()) {
      res.status(400).json({ error: "sku is required and must be a non-empty string" });
      return;
    }

    if (typeof quantity !== "number" || quantity <= 0 || !Number.isInteger(quantity)) {
      res.status(400).json({ error: "quantity must be a positive integer" });
      return;
    }

    const price = getPrice(sku);
    if (price === null) {
      res.status(400).json({ error: `Unknown product SKU: ${sku}` });
      return;
    }

    try {
      const cart = service.addItem(sessionId, sku, quantity, price);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  router.get("/cart/:sessionId", (req: Request, res: Response) => {
    const { sessionId } = req.params;

    if (!sessionId || !sessionId.trim()) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    try {
      const cart = service.getOrCreateCart(sessionId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: "Failed to get cart" });
    }
  });

  return router;
}
