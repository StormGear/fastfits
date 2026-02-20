import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  category: text("category").notNull(),
  sizes: text("sizes").array().notNull(),
  colors: text("colors").array().notNull(),
  imageUrl: text("image_url").notNull(),
  badge: text("badge"),
  inStock: boolean("in_stock").notNull().default(true),
  rating: real("rating").notNull().default(4.5),
  reviewCount: integer("review_count").notNull().default(0),
});

export const cartItems = pgTable("cart_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  size: text("size").notNull(),
  color: text("color").notNull(),
});

export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: text("session_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size").notNull(),
  color: text("color").notNull(),
  priceAtPurchase: real("price_at_purchase").notNull(),
});

export const insertProductSchema = createInsertSchema(products);
export const insertCartItemSchema = createInsertSchema(cartItems);
export const insertOrderSchema = createInsertSchema(orders).omit({ createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export type CartItemWithProduct = CartItem & { product: Product };
