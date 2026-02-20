import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import type { CartItemWithProduct } from "@shared/schema";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Please enter a valid email address"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { setCartCount } = useCart();
  const { toast } = useToast();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderName, setOrderName] = useState("");
  const [orderEmail, setOrderEmail] = useState("");

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
    },
  });

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const placeOrder = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      await apiRequest("POST", "/api/orders", data);
    },
    onSuccess: () => {
      setOrderPlaced(true);
      setCartCount(0);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Order placed!", description: "We'll email you a confirmation shortly." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not place order", variant: "destructive" });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    setOrderName(data.customerName);
    setOrderEmail(data.customerEmail);
    placeOrder.mutate(data);
  };

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 mx-auto flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold" data-testid="text-order-success">Order Confirmed!</h1>
          <p className="text-muted-foreground mt-3">
            Thanks, {orderName}! We've sent a confirmation to {orderEmail}. Your tees are on their way.
          </p>
          <Link href="/shop">
            <Button className="mt-8" data-testid="button-continue-shopping-after-order">
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/shop">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-checkout">
          <ArrowLeft className="w-4 h-4 mr-1" /> Continue Shopping
        </Button>
      </Link>

      <h1 className="font-serif text-3xl font-bold mb-8" data-testid="text-checkout-title">Checkout</h1>

      {isLoading ? (
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-48 w-full rounded-md" />
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
            <ShoppingBag className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-medium">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground mt-1">Add some tees before checking out</p>
          <Link href="/shop">
            <Button className="mt-4" data-testid="button-browse-products">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid md:grid-cols-5 gap-8">
              <div className="md:col-span-3 space-y-6">
                <div>
                  <h2 className="font-medium mb-4">Contact Information</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" data-testid="input-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@university.edu" data-testid="input-email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="font-medium mb-4">Order Items</h2>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center" data-testid={`checkout-item-${item.id}`}>
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{item.size} / {item.color} x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <Card className="p-5 sticky top-20">
                  <h3 className="font-medium mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span data-testid="text-checkout-subtotal">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span data-testid="text-checkout-shipping">
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span data-testid="text-checkout-total">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={placeOrder.isPending}
                    data-testid="button-place-order"
                  >
                    {placeOrder.isPending ? "Placing Order..." : "Place Order"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Secure checkout. We never store your payment info.
                  </p>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
