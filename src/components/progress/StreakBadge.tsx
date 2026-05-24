import { Pressable, View } from 'react-native';

import { Text } from '../primitives/Text';

export type StreakBadgeSize = 'sm' | 'md' | 'lg';

export interface StreakBadgeProps {
  days: number;
  active?: boolean;
  size?: StreakBadgeSize;
  onPress?: () => void;
}

const sizeClasses: Record<StreakBadgeSize, { box: string; variant: 'caption' | 'body' | 'h3' }> = {
  sm: { box: 'px-2 py-1', variant: 'caption' },
  md: { box: 'px-3 py-2', variant: 'body' },
  lg: { box: 'px-4 py-3', variant: 'h3' },
};

export function StreakBadge({ days, active = true, size = 'md', onPress }: StreakBadgeProps) {
  const sz = sizeClasses[size];
  const tone = active ? 'bg-warning/15 border-warning' : 'bg-border/30 border-border';
  const flame = active ? '🔥' : '·';

  const content = (
    <View
      className={`flex-row items-center gap-1 rounded-pill border ${sz.box} ${tone}`}
    >
      <Text variant={sz.variant}>{flame}</Text>
      <Text variant={sz.variant} weight="semibold">{`${days}`}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {content}
      </Pressable>
    );
  }
  return content;
}

export default StreakBadge;
