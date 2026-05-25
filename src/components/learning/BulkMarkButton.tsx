import { Pressable, View } from 'react-native';

import { Text } from '../primitives/Text';

export interface BulkMarkButtonProps {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Small inline action for "I know everything up to here." Sized to live
 * at the right edge of a list row -- ghost-style, chevron-up glyph, no
 * background fill. Separate from `Button` so the row's affordance reads as
 * an in-context shortcut, not a primary action.
 */
export function BulkMarkButton({
  label = 'I know up to here',
  onPress,
  disabled = false,
  className,
}: BulkMarkButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        'flex-row items-center gap-1 rounded-pill px-3 py-1 active:opacity-70',
        disabled ? 'opacity-40' : '',
        className ?? '',
      ].join(' ')}
    >
      <View>
        <Text variant="caption" weight="semibold" color="accent">
          ↥
        </Text>
      </View>
      <Text variant="caption" weight="semibold" color="accent">
        {label}
      </Text>
    </Pressable>
  );
}

export default BulkMarkButton;
