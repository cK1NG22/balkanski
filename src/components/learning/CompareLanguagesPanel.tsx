import { View } from 'react-native';

import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';
import type { Language, Variant } from '@/data/schemas/variant';

export interface CompareLanguagesPanelProps {
  conceptEnglish: string;
  variants: Variant[];
  currentLanguage: Language;
}

const languageName: Record<Language, string> = {
  hr: 'Croatian',
  sr: 'Serbian',
  bs: 'Bosnian',
};

export function CompareLanguagesPanel({
  conceptEnglish,
  variants,
  currentLanguage,
}: CompareLanguagesPanelProps) {
  return (
    <Card variant="outlined">
      <Text variant="label" color="muted">
        Compare across languages
      </Text>
      <Text variant="h3" className="mt-1 mb-3">
        {conceptEnglish}
      </Text>

      <View className="gap-2">
        {variants.map((v) => {
          const isCurrent = v.language === currentLanguage && v.regionalTag === null;
          const tone = isCurrent ? 'bg-brand-50 border-brand-500' : 'bg-bg border-border';
          const label = v.regionalTag
            ? `${languageName[v.language]} (${v.regionalTag})`
            : languageName[v.language];
          return (
            <View key={v.id} className={`rounded-card border p-3 ${tone}`}>
              <Text variant="caption" color="muted">
                {label}
              </Text>
              <Text variant="body" weight="semibold" className="mt-1">
                {v.latinSpelling}
              </Text>
              {v.cyrillicSpelling ? (
                <Text variant="body" className="font-cyrillic mt-1">
                  {v.cyrillicSpelling}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </Card>
  );
}

export default CompareLanguagesPanel;
