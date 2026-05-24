import type { ReactNode } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'caption'
  | 'label'
  | 'mono';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'default' | 'muted' | 'accent' | 'danger' | 'inverse';
export type TextAlign = 'left' | 'center' | 'right';

export interface TextProps extends Omit<RNTextProps, 'children' | 'style'> {
  children: ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  align?: TextAlign;
  numberOfLines?: number;
  className?: string;
}

const variantClasses: Record<TextVariant, string> = {
  display: 'text-5xl font-display',
  h1: 'text-4xl font-display',
  h2: 'text-3xl',
  h3: 'text-2xl',
  body: 'text-base',
  caption: 'text-sm',
  label: 'text-xs uppercase tracking-wide',
  mono: 'text-sm font-mono',
};

const weightClasses: Record<TextWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorClasses: Record<TextColor, string> = {
  default: 'text-ink',
  muted: 'text-muted',
  accent: 'text-accent-500',
  danger: 'text-danger',
  inverse: 'text-white',
};

const alignClasses: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function Text({
  children,
  variant = 'body',
  weight = 'regular',
  color = 'default',
  align = 'left',
  className,
  ...rest
}: TextProps) {
  return (
    <RNText
      {...rest}
      className={[
        variantClasses[variant],
        weightClasses[weight],
        colorClasses[color],
        alignClasses[align],
        className ?? '',
      ].join(' ')}
    >
      {children}
    </RNText>
  );
}

export default Text;
