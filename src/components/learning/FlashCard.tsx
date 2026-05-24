import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface FlashCardProps {
  front: ReactNode;
  back: ReactNode;
  flipped?: boolean;
  defaultFlipped?: boolean;
  onFlip?: (nowFlipped: boolean) => void;
  onSwipe?: (direction: SwipeDirection) => void;
  className?: string;
}

export function FlashCard({
  front,
  back,
  flipped,
  defaultFlipped = false,
  onFlip,
  className,
}: FlashCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(defaultFlipped);
  const isControlled = flipped !== undefined;
  const currentFlipped = isControlled ? flipped : internalFlipped;

  const handlePress = () => {
    const next = !currentFlipped;
    if (!isControlled) setInternalFlipped(next);
    onFlip?.(next);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`bg-surface rounded-card p-6 min-h-[200] items-center justify-center active:opacity-90 ${className ?? ''}`}
    >
      <View className="w-full items-center">{currentFlipped ? back : front}</View>
    </Pressable>
  );
}

export default FlashCard;
