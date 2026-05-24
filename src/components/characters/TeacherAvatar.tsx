import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';

import { Text } from '../primitives/Text';

export type TeacherAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpeechBubbleTone = 'happy' | 'serious' | 'thinking';

export interface SpeechBubble {
  text: string;
  tone?: SpeechBubbleTone;
}

export interface TeacherAvatarProps {
  teacherId: string;
  name?: string;
  avatarUrl?: string;
  size?: TeacherAvatarSize;
  withName?: boolean;
  withBubble?: SpeechBubble;
  onPress?: () => void;
}

const sizeMap: Record<TeacherAvatarSize, { box: string; px: number }> = {
  xs: { box: 'w-8 h-8', px: 32 },
  sm: { box: 'w-12 h-12', px: 48 },
  md: { box: 'w-16 h-16', px: 64 },
  lg: { box: 'w-24 h-24', px: 96 },
  xl: { box: 'w-32 h-32', px: 128 },
};

const toneClasses: Record<SpeechBubbleTone, string> = {
  happy: 'bg-success/10 border-success',
  serious: 'bg-border/40 border-border',
  thinking: 'bg-accent-500/10 border-accent-500',
};

export function TeacherAvatar({
  name,
  avatarUrl,
  size = 'md',
  withName = false,
  withBubble,
  onPress,
}: TeacherAvatarProps) {
  const sz = sizeMap[size];

  const avatar = (
    <View className={`${sz.box} rounded-pill bg-bg border border-border overflow-hidden items-center justify-center`}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: sz.px, height: sz.px }} contentFit="cover" />
      ) : (
        <Text variant="caption" color="muted">{name?.[0] ?? '?'}</Text>
      )}
    </View>
  );

  const content = (
    <View className="items-center gap-2">
      {avatar}
      {withName && name ? (
        <Text variant="caption" weight="semibold">
          {name}
        </Text>
      ) : null}
      {withBubble ? (
        <View className={`rounded-card border px-3 py-2 ${toneClasses[withBubble.tone ?? 'happy']}`}>
          <Text variant="caption">{withBubble.text}</Text>
        </View>
      ) : null}
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

export default TeacherAvatar;
