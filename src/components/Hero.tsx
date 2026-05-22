import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-bakery-ink">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80" 
          alt="Bakery background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bakery-ink/40 via-transparent to-bakery-ink/60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="block text-bakery-gold uppercase tracking-[0.3em] text-xs md:text-sm font-semibold mb-6">
            Artisanal & Handcrafted
          </span>
          <h2 className="text-5xl md:text-8xl font-serif text-white leading-[1.1] mb-10">
            Freshly Baked <br /> 
            <span className="italic font-light">With Passion</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <motion.a 
              href="#products"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-bakery-gold text-white px-10 py-4 uppercase tracking-widest text-xs font-bold rounded-full transition-transform"
            >
              Order Online
            </motion.a>
            <motion.a 
              href="#our-story"
              whileHover={{ color: '#C5A059' }}
              className="text-white border-b border-white/30 pb-1 uppercase tracking-widest text-xs font-semibold"
            >
              Our Philosophy
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Decorative vertical line */}
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: 100 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-0 left-1/2 w-px bg-white/20" 
      />
    </section>
  );
}
