import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500); // UI slides in
    const t2 = setTimeout(() => setPhase(2), 1500); // Lines highlight
    const t3 = setTimeout(() => setPhase(3), 3500); // Exit drift
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex items-center justify-center p-12"
      initial={{ opacity: 0, x: '10%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-5%', filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex w-full max-w-6xl h-[70vh] gap-8">
        <motion.div 
          className="w-1/3 flex flex-col justify-center gap-6"
          initial={{ opacity: 0, x: -20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-primary text-sm font-mono tracking-widest uppercase">Curriculum</div>
          <h2 className="text-[3vw] font-bold leading-tight">Structured<br/>Learning</h2>
          <p className="text-muted-foreground">From basic propositions to Gödel's theorems. Learn interactively.</p>
        </motion.div>

        <motion.div 
          className="flex-1 bg-secondary/50 rounded-2xl border border-border p-8 relative overflow-hidden backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="space-y-4 relative z-10">
            {[
              { w: 'Week 1', title: 'Reasoning & Logical Form', icon: '⊢' },
              { w: 'Week 2', title: 'Propositional Logic', icon: '∧' },
              { w: 'Week 3', title: 'Predicate Logic', icon: '∀' },
              { w: 'Week 4', title: 'Metalogic & Beyond', icon: '□' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                className="bg-background border border-border rounded-xl p-4 flex items-center gap-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.6 + (i * 0.1) }}
                whileHover={phase >= 2 && i === 1 ? { scale: 1.02, borderColor: '#EAB308' } : {}}
                style={phase >= 2 && i === 1 ? { borderColor: '#EAB308', backgroundColor: 'rgba(234, 179, 8, 0.05)' } : {}}
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-primary font-mono text-xl">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.w}</div>
                  <div className="text-lg font-medium">{item.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Decorative background glow inside the card */}
          <motion.div 
            className="absolute top-1/2 right-0 w-64 h-64 bg-primary/10 blur-[60px] rounded-full"
            animate={{ y: ['-20%', '20%', '-20%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}