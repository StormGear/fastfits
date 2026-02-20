import {
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type CartItemWithProduct,
  products, cartItems, orders, orderItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, desc } from "drizzle-orm";

export interface IStorage {
  getProducts(filters?: { category?: string; limit?: number; badge?: string; hasSale?: boolean }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;

  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(filters?: { category?: string; limit?: number; badge?: string; hasSale?: boolean }): Promise<Product[]> {
    let query = db.select().from(products).$dynamic();
    const conditions = [];

    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }
    if (filters?.badge) {
      if (filters.badge === "featured") {
        conditions.push(eq(products.badge, "Best Seller"));
      } else if (filters.badge === "new") {
        conditions.push(eq(products.badge, "New Arrival"));
      }
    }

    let result: Product[];
    if (conditions.length > 0) {
      result = await db.select().from(products).where(and(...conditions));
    } else {
      result = await db.select().from(products);
    }

    if (filters?.hasSale) {
      result = result.filter((p) => p.originalPrice !== null && p.originalPrice > p.price);
    }

    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }

    return result;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
    const result: CartItemWithProduct[] = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (product) {
        result.push({ ...item, product });
      }
    }
    return result;
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const existing = await db.select().from(cartItems).where(
      and(
        eq(cartItems.sessionId, item.sessionId),
        eq(cartItems.productId, item.productId),
        eq(cartItems.size, item.size),
        eq(cartItems.color, item.color),
      )
    );
    if (existing.length > 0) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing[0].quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(cartItems).values(item).returning();
    return created;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updated] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updated;
  }

  async removeCartItem(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
