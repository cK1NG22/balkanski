import { Pressable, View } from 'react-native';

import { Text } from '../primitives/Text';
import { BulkMarkButton } from './BulkMarkButton';

export interface KnownWordRowProps {
  rank: number;
  word: string;
  gloss: string;
  script?: 'latin' | 'cyrillic';
  checked: boolean;
  onToggle: (nextChecked: boolean) => void;
  onMarkUpToHere: () => void;
  className?: string;
}

/**
 * One row in the Known Words editor: rank + word + gloss + checkbox + inline
 * "I know up to here" shortcut. Pure presentation -- the screen owns state.
 *
 * Accessibility: the entire row left of the bulk-mark button is one tap
 * target with role=checkbox. Screen readers announce
 *   "Checkbox, <word>, <gloss>, rank <n>" with state checked / not checked.
 *
 * Authoritative design: docs/decisions/0002-known-words-vs-placement-test.md
 */
export function KnownWordRow({
  rank,
  word,
  gloss,
  script = 'latin',
  checked,
  onToggle,
  onMarkUpToHere,
  className,
}: KnownWordRowProps) {
  const handleToggle = () => onToggle(!checked);

  return (
    <View
      className={[
        'flex-row items-center gap-3 border-b border-border px-4 py-3',
        checked ? 'bg-success/5' : 'bg-surface',
        className ?? '',
      ].join(' ')}
    >
      <Pressable
        onPress={handleToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={`${word}, ${gloss}, rank ${rank}`}
        className="flex-1 flex-row items-center gap-3 active:opacity-70"
      >
        <View
          className={[
            'h-6 w-6 items-center justify-center rounded-sm border',
            checked ? 'border-success bg-success' : 'border-border bg-bg',
          ].join(' ')}
        >
          {checked ? (
            <Text variant="caption" weight="bold" color="inverse">
              ✓
            </Text>
          ) : null}
        </View>
        <View className="flex-1 flex-row items-baseline gap-2">
          <Text variant="caption" color="muted" weight="semibold">
            {rank}.
          </Text>
          <Text
            variant="body"
            weight={script === 'cyrillic' ? 'medium' : 'semibold'}
          >
            {word}
          </Text>
          <Text variant="caption" color="muted">
            · {gloss}
          </Text>
        </View>
      </Pressable>

      <BulkMarkButton onPress={onMarkUpToHere} disabled={checked} label="up to here" />
    </View>
  );
}

export default KnownWordRow;
