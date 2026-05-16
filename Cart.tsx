import { X, Minus, Plus, Trash2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export default function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartProps) {
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const handleCheckout = async () => {
    try {
      // 1. Call Backend API to deduct stock
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: subtotal
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process order on server");
      }

      const result = await response.json();
      console.log("Order processed:", result);

      // 2. Construct WhatsApp message
      const phone = "6281234567890"; // Replaced with actual phone later or input
      let message = `Halo Near Bakery, saya ingin memesan (Order #${result.orderId}):\n\n`;
      
      items.forEach(item => {
        message += `- ${item.name} (${item.quantity}x) = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
      });
      
      message += `\n*TOTAL: Rp ${subtotal.toLocaleString('id-ID')}*\n\n`;
      message += `Mohon info pembayarannya. Terima kasih!`;
      
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
      
      // Optionally clear cart or close
      onClose();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Maaf, terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bakery-ink/40 backdrop-blur-sm z-[60]"
          />
          
          {/* Sidebar */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-bakery-cream z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-bakery-ink/5 flex justify-between items-center bg-white">
              <h2 className="text-xl font-serif font-bold text-bakery-ink uppercase tracking-tight">Your Basket</h2>
              <button onClick={onClose} className="p-2 hover:bg-bakery-cream rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={48} className="text-bakery-clay/20 mb-4" />
                  <p className="text-bakery-clay font-medium italic">Your basket is empty</p>
                  <button onClick={onClose} className="mt-4 text-bakery-gold text-xs uppercase tracking-widest font-bold">Discover products</button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-24 bg-bakery-bg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-serif font-medium text-bakery-ink">{item.name}</h4>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-bakery-clay/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-bakery-clay/70 mb-4">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-bakery-ink/10 rounded-full py-1 px-3">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:text-bakery-gold">
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:text-bakery-gold">
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-bakery-ink">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-bakery-ink/5 bg-white space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-bakery-clay text-sm font-medium uppercase tracking-widest">Subtotal</span>
                  <span className="text-2xl font-serif font-bold text-bakery-ink">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[10px] text-bakery-clay/60 italic text-center">
                  Order will be confirmed via WhatsApp. Pricing excludes shipping.
                </p>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-bakery-gold text-white py-5 rounded-full flex items-center justify-center gap-3 uppercase tracking-widest font-bold text-xs hover:bg-bakery-clay transition-colors shadow-lg active:scale-[0.98]"
                >
                  <Send size={16} />
                  Checkout via WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const ShoppingBag = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)
