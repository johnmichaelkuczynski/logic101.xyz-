import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
    >
      <div 
        className="absolute inset-0 opacity-30 mix-blend-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-abstract.png)` }}
      />
      <motion.div 
        className="absolute inset-0 bg-primary/5"
        animate={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-24 h-24 bg-primary text-background rounded-2xl flex items-center justify-center text-4xl font-mono mx-auto mb-8 shadow-2xl shadow-primary/20"
        >
          ∀
        </motion.div>

        <motion.h1 
          className="text-[5vw] font-bold tracking-tight mb-4"
          initial={{ y: 30, opacity: 0 }}
          animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Formal Logic
        </motion.h1>
        
        <motion.p 
          className="text-[1.5vw] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
        >
          Enroll today and master valid reasoning.
        </motion.p>
      </div>
    </motion.div>
  );
}