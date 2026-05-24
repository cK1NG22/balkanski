import { Pressable, View } from 'react-native';

import { Text } from '../primitives/Text';

export type CyrillicLetterState = 'new' | 'learning' | 'known';
export type CyrillicLetterSize = 'sm' | 'md' | 'lg' | 'xl';

export interface CyrillicLetterProps {
  letter: string;
  romanization?: string;
  ipa?: string;
  audioSrc?: string | number;
  showRoman?: boolean;
  size?: CyrillicLetterSize;
  onPress?: () => void;
  state?: CyrillicLetterState;
}

const sizeClasses: Record<CyrillicLetterSize, { box: string; letter: 'h3' | 'h2' | 'h1' | 'display' }> = {
  sm: { box: 'w-12 h-12', letter: 'h3' },
  md: { box: 'w-16 h-16', letter: 'h2' },
  lg: { box: 'w-24 h-24', letter: 'h1' },
  xl: { box: 'w-32 h-32', letter: 'display' },
};

const stateClasses: Record<CyrillicLetterState, string> = {
  new: 'bg-surface border-border',
  learning: 'bg-warning/10 border-warning',
  known: 'bg-success/10 border-success',
};

export function CyrillicLetter({
  letter,
  romanization,
  ipa,
  showRoman = true,
  size = 'md',
  onPress,
  state = 'new',
}: CyrillicLetterProps) {
  const sz = sizeClasses[size];

  const inner = (
    <View
      className={`${sz.box} rounded-card border items-center justify-center font-cyrillic ${stateClasses[state]}`}
    >
      <Text variant={sz.letter} className="font-cyrillic">
        {letter}
      </Text>
      {showRoman && romanization ? (
        <Text variant="caption" color="muted">
          {romanization}
        </Text>
      ) : null}
      {ipa ? (
        <Text variant="caption" color="muted" className="font-mono">{`/${ipa}/`}</Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {inner}
      </Pressable>
    );
  }
  return inner;
}

export default CyrillicLetter;
