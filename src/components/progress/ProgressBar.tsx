import { View } from 'react-native';

import { Text } from '../primitives/Text';

export type ProgressBarVariant = 'linear' | 'segmented';
export type ProgressBarColor = 'primary' | 'success' | 'warning';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value: number;
  variant?: ProgressBarVariant;
  segments?: number;
  showLabel?: boolean;
  color?: ProgressBarColor;
  size?: ProgressBarSize;
}

const heightClasses: Record<ProgressBarSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const fillClasses: Record<ProgressBarColor, string> = {
  primary: 'bg-brand-500',
  success: 'bg-success',
  warning: 'bg-warning',
};

export function ProgressBar({
  value,
  variant = 'linear',
  segments = 5,
  showLabel = false,
  color = 'primary',
  size = 'md',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));

  if (variant === 'segmented') {
    const filledCount = Math.round(clamped * segments);
    return (
      <View className="flex-row gap-1 items-center">
        {Array.from({ length: segments }).map((_, i) => (
          <View
            key={i}
            className={`flex-1 ${heightClasses[size]} rounded-pill ${i < filledCount ? fillClasses[color] : 'bg-border'}`}
          />
        ))}
        {showLabel ? (
          <Text variant="caption" color="muted" className="ml-2">{`${Math.round(clamped * 100)}%`}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-1">
      <View className={`w-full ${heightClasses[size]} rounded-pill bg-border overflow-hidden`}>
        <View
          className={`${heightClasses[size]} rounded-pill ${fillClasses[color]}`}
          style={{ width: `${clamped * 100}%` }}
        />
      </View>
      {showLabel ? (
        <Text variant="caption" color="muted">{`${Math.round(clamped * 100)}%`}</Text>
      ) : null}
    </View>
  );
}

export default ProgressBar;
