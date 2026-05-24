import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-surface',
  elevated: 'bg-surface shadow-md',
  outlined: 'bg-surface border border-border',
  ghost: 'bg-transparent',
};

export function Card({ children, variant = 'default', onPress, className }: CardProps) {
  const classes = `rounded-card p-4 ${variantClasses[variant]} ${className ?? ''}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${classes} active:opacity-80`}>
        {children}
      </Pressable>
    );
  }

  return <View className={classes}>{children}</View>;
}

export default Card;
