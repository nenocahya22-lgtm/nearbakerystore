import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import { Product, CartItem } from './types';
import { motion } from 'motion/react';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'All' | 'bread' | 'pastry' | 'cake'>('All');
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('near-bakery-cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('near-bakery-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen font-sans">
      <Navbar cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />
      
      <Hero />

      {/* Product Catalog */}
      <section id="products" className="py-32 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
          <div>
            <span className="text-bakery-gold uppercase tracking-[0.3em] text-xs font-bold mb-4 block">
              Menu Highlights
            </span>
            <h2 className="text-4xl md:text-6xl font-serif text-bakery-ink">
              Our <span className="italic">Collection</span>
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-8">
            {['All', 'bread', 'pastry', 'cake'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`text-xs uppercase tracking-widest font-bold pb-2 border-b-2 transition-all ${
                  activeCategory === cat ? 'border-bakery-gold text-bakery-ink' : 'border-transparent text-bakery-clay/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 text-left">
          {filteredProducts.map((product) => (
            <div key={product.id}>
              <ProductCard 
                product={product} 
                onAddToCart={addToCart} 
              />
            </div>
          ))}
        </div>
      </section>

      {/* Our Story Section */}
      <section id="our-story" className="bg-bakery-ink py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-tl-[100px]">
              <img 
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&q=80" 
                alt="Baker at work" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-bakery-gold p-10 hidden md:block">
              <span className="text-white font-serif text-5xl italic font-light">Est. 2021</span>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="text-white"
          >
            <span className="text-bakery-gold uppercase tracking-[0.3em] text-xs font-bold mb-6 block">
              Crafting Excellence
            </span>
            <h2 className="text-4xl md:text-6xl font-serif mb-10 leading-tight">
              Honoring the <br /> 
              <span className="italic text-bakery-gold">Tradition</span> of Grain
            </h2>
            <div className="space-y-6 text-white/70 font-light leading-relaxed">
              <p>
                At Near Bakery, we believe that bread is the most basic language of humanity. 
                Founded on the principles of slow-fermentation and local sourcing, we treat 
                every dough as a living masterpiece.
              </p>
              <p>
                Our artisans wake up before the sun to hand-shape each loaf, ensuring that 
                when you take a bite, you experience the culmination of 24 hours of 
                patience and precision.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="locations" className="bg-bakery-cream pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-32">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-4xl font-serif font-bold text-bakery-ink mb-8 uppercase tracking-tighter">Near Bakery</h2>
              <p className="max-w-sm text-bakery-clay/70 font-light leading-relaxed mb-8">
                Premium artisan bakery focused on wild-yeast sourdoughs, refined pastries, and 
                seasonal cakes. Delivering fresh joy daily to your doorstep.
              </p>
              <div className="flex gap-6">
                <a href="#" className="p-3 rounded-full border border-bakery-ink/10 text-bakery-ink hover:bg-bakery-ink hover:text-white transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="p-3 rounded-full border border-bakery-ink/10 text-bakery-ink hover:bg-bakery-ink hover:text-white transition-all">
                  <Facebook size={20} />
                </a>
                <a href="#" className="p-3 rounded-full border border-bakery-ink/10 text-bakery-ink hover:bg-bakery-ink hover:text-white transition-all">
                  <Mail size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-bakery-ink mb-10">Visit Us</h4>
              <ul className="space-y-6 text-sm text-bakery-clay">
                <li className="flex gap-4">
                  <MapPin size={18} className="flex-shrink-0 text-bakery-gold" />
                  <span>Jalan Kemang Raya No. 42,<br />Jakarta Selatan, 12730</span>
                </li>
                <li className="flex gap-4">
                  <Phone size={18} className="flex-shrink-0 text-bakery-gold" />
                  <span>+62 21 555 1234</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-bakery-ink mb-10">Hours</h4>
              <ul className="space-y-4 text-sm text-bakery-clay">
                <li className="flex justify-between">
                  <span>Mon - Fri</span>
                  <span className="font-bold text-bakery-ink">07:00 - 19:00</span>
                </li>
                <li className="flex justify-between border-t border-bakery-ink/5 pt-4">
                  <span>Sat - Sun</span>
                  <span className="font-bold text-bakery-ink">08:00 - 20:00</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-bakery-ink/5 pt-16 flex flex-col md:flex-row justify-between items-center gap-8">
            <span className="text-[10px] uppercase tracking-[0.2em] text-bakery-clay/50 font-bold">
              © 2026 Near Bakery — Artisan Bread Co.
            </span>
            <div className="flex gap-10">
              <a href="#" className="text-[10px] uppercase tracking-widest font-bold text-bakery-clay/40 hover:text-bakery-ink transition-colors">Privacy</a>
              <a href="#" className="text-[10px] uppercase tracking-widest font-bold text-bakery-clay/40 hover:text-bakery-ink transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}
