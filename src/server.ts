import express from "express";
import { ExperienceCartService } from "./services/experienceCartService.js";
import { SalesforceCartClient } from "./services/salesforceCartClient.js";
import { InMemoryContextStore } from "./stores/inMemoryContextStore.js";
import { createCartRoutes } from "./routes/cart.routes.js";

export function createApp(): express.Application {
  const app = express();

  app.use(express.json());

  // Initialize dependencies
  const sfClient = new SalesforceCartClient();
  const contextStore = new InMemoryContextStore();
  const cartService = new ExperienceCartService(sfClient, contextStore);

  app.use("/api", createCartRoutes(cartService));

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
