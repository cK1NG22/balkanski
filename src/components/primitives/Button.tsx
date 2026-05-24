import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-500 active:bg-brand-600',
  secondary: 'bg-surface border border-border active:bg-bg',
  ghost: 'bg-transparent active:bg-bg',
  destructive: 'bg-danger active:opacity-80',
};

const variantTextClasses: Record<ButtonVariant, 'inverse' | 'default'> = {
  primary: 'inverse',
  secondary: 'default',
  ghost: 'default',
  destructive: 'inverse',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-5 py-4',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
}: ButtonProps) {
  const isInactive = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      className={[
        'rounded-button flex-row items-center justify-center gap-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        isInactive ? 'opacity-50' : '',
        className ?? '',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <Text weight="semibold" color={variantTextClasses[variant]}>
            {label}
          </Text>
          {rightIcon ? <View>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}

export default Button;
