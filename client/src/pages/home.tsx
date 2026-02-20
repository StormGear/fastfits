import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { ArrowRight, Truck, RefreshCw, Shield, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const categories = [
  { name: "Graphic Tees", slug: "graphic", color: "bg-primary/10 dark:bg-primary/20" },
  { name: "Basics", slug: "basics", color: "bg-chart-3/10 dark:bg-chart-3/20" },
  { name: "Streetwear", slug: "streetwear", color: "bg-chart-2/10 dark:bg-chart-2/20" },
  { name: "Athletic", slug: "athletic", color: "bg-chart-5/10 dark:bg-chart-5/20" },
];

const perks = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
  { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
  { icon: Sparkles, title: "Student Discount", desc: "Extra 10% with .edu" },
];

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-md" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export default function Home() {
  const { data: featuredProducts = [], isLoading: loadingFeatured } = useQuery<Product[]>({
    queryKey: ["/api/products?limit=4&badge=featured"],
  });

  const { data: newArrivals = [], isLoading: loadingNew } = useQuery<Product[]>({
    queryKey: ["/api/products?limit=4&badge=new"],
  });

  const { data: saleProducts = [], isLoading: loadingSale } = useQuery<Product[]>({
    queryKey: ["/api/products?limit=4&has_sale=true"],
  });

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0">
          <img
            src="/images/hero-lifestyle.png"
            alt="College students in trendy t-shirts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <Badge variant="secondary" className="mb-4 bg-white/15 text-white border-white/20 backdrop-blur-sm no-default-hover-elevate no-default-active-elevate">
              New Collection 2026
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Wear What
              <br />
              <span className="text-primary">Speaks You</span>
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-md leading-relaxed">
              Premium tees designed for the college lifestyle. Bold designs, sustainable fabrics, prices that don't break the bank.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/shop">
                <Button size="lg" data-testid="button-shop-now">
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/shop?category=sale">
                <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="button-view-sale">
                  View Sale
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-center gap-3 p-3" data-testid={`perk-${perk.title.toLowerCase().replace(/\s/g, "-")}`}>
              <div className="w-10 h-10 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <perk.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{perk.title}</p>
                <p className="text-xs text-muted-foreground">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" data-testid="section-categories">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold">Shop by Category</h2>
          <Link href="/shop">
            <Button variant="ghost" size="sm" data-testid="button-view-all-categories">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link href={`/shop?category=${cat.slug}`}>
                <Card className={`hover-elevate p-6 flex flex-col items-center justify-center text-center cursor-pointer ${cat.color} border-0`} data-testid={`card-category-${cat.slug}`}>
                  <h3 className="font-medium text-sm">{cat.name}</h3>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" data-testid="section-featured">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold">Featured Picks</h2>
            <p className="text-sm text-muted-foreground mt-1">Curated by our style team</p>
          </div>
          <Link href="/shop">
            <Button variant="ghost" size="sm">
              See All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {loadingFeatured
            ? [1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)
            : featuredProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
        </div>
      </section>

      <section className="bg-card dark:bg-card py-16" data-testid="section-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-primary rounded-md p-8 sm:p-12 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary-foreground">
              Student? Get 10% Off
            </h2>
            <p className="mt-2 text-primary-foreground/80 max-w-md mx-auto">
              Verify with your .edu email and enjoy an extra discount on every order. Because being broke is part of the curriculum.
            </p>
            <div className="mt-6">
              <Link href="/shop">
                <Button variant="secondary" size="lg" data-testid="button-claim-discount">
                  Claim Your Discount
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" data-testid="section-new-arrivals">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold">New Arrivals</h2>
            <p className="text-sm text-muted-foreground mt-1">Fresh drops this week</p>
          </div>
          <Link href="/shop?category=new">
            <Button variant="ghost" size="sm">
              See All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {loadingNew
            ? [1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)
            : newArrivals.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
        </div>
      </section>

      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" data-testid="section-sale">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold">On Sale</h2>
              <p className="text-sm text-muted-foreground mt-1">Great deals, limited time</p>
            </div>
            <Link href="/shop?category=sale">
              <Button variant="ghost" size="sm">
                See All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {loadingSale
              ? [1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)
              : saleProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
          </div>
        </section>
      )}

      <footer className="border-t bg-card dark:bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <span className="font-serif text-xl font-bold">
                fast<span className="text-primary">fits</span>
              </span>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Premium t-shirts for the college lifestyle. Designed to stand out, priced to fit in.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Shop</h4>
              <ul className="space-y-2">
                <li><Link href="/shop" className="text-sm text-muted-foreground">All Products</Link></li>
                <li><Link href="/shop?category=new" className="text-sm text-muted-foreground">New Arrivals</Link></li>
                <li><Link href="/shop?category=sale" className="text-sm text-muted-foreground">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Support</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-foreground">Shipping Info</span></li>
                <li><span className="text-sm text-muted-foreground">Returns</span></li>
                <li><span className="text-sm text-muted-foreground">Size Guide</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Company</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-foreground">About Us</span></li>
                <li><span className="text-sm text-muted-foreground">Contact</span></li>
                <li><span className="text-sm text-muted-foreground">Student Program</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 fastfits. All rights reserved. Made with care for college students everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
