import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StreamingText } from '../StreamingText';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800); // Title
    const t2 = setTimeout(() => setPhase(2), 1500); // Keyboard appears
    const t3 = setTimeout(() => setPhase(3), 2500); // Typing
    const t4 = setTimeout(() => setPhase(4), 4500); // Exit
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const keys = ['P', 'Q', '→', '⊢', '∀', '∃', '≡', '¬'];

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-12 overflow-hidden"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div 
        className="absolute inset-0 opacity-20 mix-blend-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/keyboard-macro.png)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

      <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center gap-12">
        <motion.h2 
          className="text-[4vw] font-bold leading-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
        >
          Symbolic Answers
        </motion.h2>

        <motion.div 
          className="w-full bg-background border border-primary/30 rounded-xl p-8 shadow-2xl shadow-primary/10"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <div className="text-left text-muted-foreground text-sm mb-4">Express Modus Ponens:</div>
          <div className="h-16 flex items-center border-b border-border mb-8 px-4 text-2xl font-mono text-primary bg-secondary/30 rounded-md">
            {phase >= 3 && <StreamingText text="P, P → Q ⊢ Q" delay={0} />}
            {phase >= 2 && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="ml-1 w-3 h-6 bg-primary inline-block" />}
          </div>

          <div className="flex justify-center gap-3">
            {keys.map((k, i) => (
              <motion.div
                key={k}
                className="w-14 h-14 rounded-lg bg-secondary border border-border flex items-center justify-center font-mono text-xl shadow-md"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.5 + (i * 0.05), type: 'spring' }}
                whileHover={{ scale: 1.1, backgroundColor: '#1E293B' }}
              >
                {k}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}