import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  safe?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  edges?: Edge[];
  className?: string;
}

export function Screen({
  children,
  scroll = false,
  safe = true,
  header,
  footer,
  edges,
  className,
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView className={className ?? 'flex-1 bg-bg'} contentContainerClassName="px-4 py-4">
      {children}
    </ScrollView>
  ) : (
    <View className={className ?? 'flex-1 bg-bg px-4 py-4'}>{children}</View>
  );

  const wrapped = safe ? (
    <SafeAreaView className="flex-1 bg-bg" edges={edges}>
      {header}
      {body}
      {footer}
    </SafeAreaView>
  ) : (
    <View className="flex-1 bg-bg">
      {header}
      {body}
      {footer}
    </View>
  );

  return wrapped;
}

export default Screen;
