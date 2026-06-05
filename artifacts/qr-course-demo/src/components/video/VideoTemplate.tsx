import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';

import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS = {
  open: 5000,
  logic: 5000,
  ui: 6000,
  advanced: 7000,
  close: 5000,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (key: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  // Handle preview variations if currentSceneKey has _r1/_r2 suffix
  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  return (
    <div className="w-full h-screen overflow-hidden bg-[#0B0F19] text-[#F8FAFC] font-sans relative">
      <AnimatePresence mode="popLayout">
        {baseSceneKey === 'open' && <Scene1 key={currentSceneKey} />}
        {baseSceneKey === 'logic' && <Scene2 key={currentSceneKey} />}
        {baseSceneKey === 'ui' && <Scene3 key={currentSceneKey} />}
        {baseSceneKey === 'advanced' && <Scene4 key={currentSceneKey} />}
        {baseSceneKey === 'close' && <Scene5 key={currentSceneKey} />}
      </AnimatePresence>
    </div>
  );
}
