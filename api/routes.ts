import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const addToCartSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).default(1),
  size: z.string().min(1),
  color: z.string().min(1),
});

const updateCartSchema = z.object({
  quantity: z.number().min(1),
});

const placeOrderSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/products", async (req, res) => {
    try {
      const { category, limit, badge, has_sale } = req.query;
      const products = await storage.getProducts({
        category: category as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        badge: badge as string | undefined,
        hasSale: has_sale === "true",
      });
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID || "anonymous";
      const items = await storage.getCartItems(sessionId);
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID || "anonymous";
      const parsed = addToCartSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }
      const item = await storage.addCartItem({
        sessionId,
        productId: parsed.data.productId,
        quantity: parsed.data.quantity,
        size: parsed.data.size,
        color: parsed.data.color,
      });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid cart item ID" });
      }
      const parsed = updateCartSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }
      const item = await storage.updateCartItemQuantity(id, parsed.data.quantity);
      if (!item) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid cart item ID" });
      }
      await storage.removeCartItem(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const sessionId = req.sessionID || "anonymous";
      const parsed = placeOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }

      const cartItems = await storage.getCartItems(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const order = await storage.createOrder({
        sessionId,
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        totalAmount,
        status: "pending",
      });

      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          priceAtPurchase: item.product.price,
        });
      }

      await storage.clearCart(sessionId);
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Failed to place order" });
    }
  });

  return httpServer;
}
