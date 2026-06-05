import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StreamingText } from '../StreamingText';
import { TypingIndicator } from '../TypingIndicator';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500); // UI slide in
    const t2 = setTimeout(() => setPhase(2), 1500); // User message
    const t3 = setTimeout(() => setPhase(3), 2500); // Tutor typing
    const t4 = setTimeout(() => setPhase(4), 3500); // Tutor response streaming
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex justify-center items-center p-12 bg-background"
      initial={{ opacity: 0, y: '5%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex w-full max-w-6xl h-[80vh] bg-secondary/30 rounded-3xl border border-border overflow-hidden backdrop-blur-md">
        
        {/* Left Side: Context */}
        <div className="w-1/3 border-r border-border p-10 flex flex-col justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-[2.5vw] font-bold leading-tight mb-4">Context-Aware AI Tutor</h3>
          <p className="text-muted-foreground">Stuck on a proof? The tutor knows exactly which lecture you're on and guides you without giving away the answer.</p>
        </div>

        {/* Right Side: Chat */}
        <div className="flex-1 p-8 flex flex-col relative bg-background">
          <div className="flex-1 space-y-6 flex flex-col justify-end">
            
            {phase >= 2 && (
              <motion.div 
                className="self-end max-w-[80%] bg-secondary border border-border p-4 rounded-2xl rounded-tr-sm"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                Why doesn't Q → P follow from P → Q? It seems like it should.
              </motion.div>
            )}

            {phase === 3 && (
              <motion.div 
                className="self-start"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tl-sm text-primary">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}

            {phase >= 4 && (
              <motion.div 
                className="self-start max-w-[85%] bg-primary/10 border border-primary/30 p-5 rounded-2xl rounded-tl-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <StreamingText 
                  text="That's a common intuition, but it's the fallacy of affirming the consequent! Think of it this way: 'If it is raining (P), the street is wet (Q)'. Does that mean 'If the street is wet (Q), it is raining (P)'? No—someone could have used a hose. The implication only flows one way."
                />
              </motion.div>
            )}
            
          </div>
          
          <div className="mt-8 h-14 bg-secondary rounded-xl border border-border px-4 flex items-center text-muted-foreground opacity-50">
            Ask a question...
          </div>
        </div>
      </div>
    </motion.div>
  );
}