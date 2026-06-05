import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500); // Title type
    const t2 = setTimeout(() => setPhase(2), 2000); // Subtitle
    const t3 = setTimeout(() => setPhase(3), 4000); // Exit
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-abstract.png)` }}
      />
      
      <div className="relative z-10 text-center flex flex-col items-center">
        <motion.div 
          className="w-16 h-16 border-2 border-primary rounded-full flex items-center justify-center text-primary text-2xl font-mono mb-8 bg-background/50 backdrop-blur-md"
          animate={{ rotate: 90 }}
          transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
        >
          ⊢
        </motion.div>
        
        <h1 className="text-[6vw] font-bold tracking-tighter leading-none mb-6">
          <span className="block overflow-hidden">
            <motion.span 
              className="block"
              initial={{ y: "100%", opacity: 0 }}
              animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              FORMAL
            </motion.span>
          </span>
          <span className="block overflow-hidden text-primary">
            <motion.span 
              className="block"
              initial={{ y: "100%", opacity: 0 }}
              animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              LOGIC
            </motion.span>
          </span>
        </h1>
        
        <motion.p 
          className="text-[2vw] text-muted-foreground font-light max-w-2xl"
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={phase >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Master the form of valid reasoning.
        </motion.p>
      </div>
    </motion.div>
  );
}