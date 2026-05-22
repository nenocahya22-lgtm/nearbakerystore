import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-bakery-bg mb-6">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-bakery-ink/0 group-hover:bg-bakery-ink/20 transition-colors" />
        
        {/* Quick add button */}
        <button 
          onClick={() => onAddToCart(product)}
          className="absolute bottom-6 right-6 w-12 h-12 bg-white flex items-center justify-center rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-bakery-gold hover:text-white"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="text-center md:text-left">
        <span className="text-[10px] uppercase tracking-widest text-bakery-clay font-bold mb-2 block">
          {product.category}
        </span>
        <h3 className="text-xl font-serif text-bakery-ink mb-1 group-hover:text-bakery-gold transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-bakery-clay/70 mb-3 line-clamp-2 max-w-[280px]">
          {product.description}
        </p>
        <span className="text-sm font-medium text-bakery-ink">
          Rp {product.price.toLocaleString('id-ID')}
        </span>
      </div>
    </motion.div>
  );
}
