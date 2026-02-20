import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Product } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/product/${product.id}`}>
        <Card className="group overflow-visible border-0 bg-transparent cursor-pointer" data-testid={`card-product-${product.id}`}>
          <div className="relative overflow-hidden rounded-md bg-muted aspect-square">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.badge && (
                <Badge variant="default" className="text-xs" data-testid={`badge-product-${product.id}`}>
                  {product.badge}
                </Badge>
              )}
              {discount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  -{discount}%
                </Badge>
              )}
            </div>
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">Sold Out</span>
              </div>
            )}
          </div>

          <div className="pt-3 space-y-1">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              <span className="text-xs text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
            <h3 className="text-sm font-medium leading-tight line-clamp-1" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" data-testid={`text-product-price-${product.id}`}>
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
