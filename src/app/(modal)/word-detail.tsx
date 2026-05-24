import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, CompareLanguagesPanel, Screen, Text } from '@/components';
import type { Variant } from '@/data/schemas/variant';

const cases = [
  ['Nominative', 'voda', 'vode'],
  ['Genitive', 'vode', 'voda'],
  ['Dative', 'vodi', 'vodama'],
  ['Accusative', 'vodu', 'vode'],
  ['Vocative', 'vodo', 'vode'],
  ['Instrumental', 'vodom', 'vodama'],
  ['Locative', 'vodi', 'vodama'],
];

const variants: Variant[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    conceptId: '00000000-0000-4000-8000-000000000010',
    language: 'sr',
    regionalTag: null,
    latinSpelling: 'voda',
    cyrillicSpelling: 'вода',
    stressMark: null,
    ipa: null,
    audioUrl: null,
    frequencyRankInLang: 44,
    caseForms: null,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    conceptId: '00000000-0000-4000-8000-000000000010',
    language: 'hr',
    regionalTag: null,
    latinSpelling: 'voda',
    cyrillicSpelling: null,
    stressMark: null,
    ipa: null,
    audioUrl: null,
    frequencyRankInLang: 42,
    caseForms: null,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    conceptId: '00000000-0000-4000-8000-000000000010',
    language: 'bs',
    regionalTag: null,
    latinSpelling: 'voda',
    cyrillicSpelling: null,
    stressMark: null,
    ipa: null,
    audioUrl: null,
    frequencyRankInLang: 39,
    caseForms: null,
  },
];

export default function WordDetail() {
  const { conceptId } = useLocalSearchParams<{ conceptId?: string }>();

  return (
    <Screen scroll footer={<WordDetailFooter />}>
      <View className="gap-6 pb-28">
        <View className="items-center">
          <View className="h-1.5 w-20 rounded-pill bg-border" />
        </View>

        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-2">
            <Text variant="label" className="text-brand-500">
              Serbian flag - noun - feminine
            </Text>
            <Text variant="display">voda</Text>
            <Text variant="h3" color="muted">
              "water"
            </Text>
            {__DEV__ && conceptId ? (
              <Text variant="caption" color="muted">
                concept: {conceptId}
              </Text>
            ) : null}
          </View>
          <Button label="Close" variant="ghost" size="sm" onPress={() => router.back()} />
        </View>

        <View className="gap-4">
          <Text variant="h2" weight="bold">
            Grammatical Declension
          </Text>
          <Card variant="outlined" className="overflow-hidden p-0">
            <View className="flex-row bg-bg p-4">
              <TableCell label="Case" header wide />
              <TableCell label="Singular" header />
              <TableCell label="Plural" header />
            </View>
            {cases.map(([caseName, singular, plural]) => (
              <View key={caseName} className="flex-row border-t border-border p-4">
                <TableCell label={caseName} wide />
                <TableCell label={singular} accent />
                <TableCell label={plural} accent />
              </View>
            ))}
          </Card>
        </View>

        <CompareLanguagesPanel
          conceptEnglish="water"
          variants={variants}
          currentLanguage="sr"
        />
      </View>
    </Screen>
  );
}

function TableCell({
  label,
  header = false,
  accent = false,
  wide = false,
}: {
  label: string;
  header?: boolean;
  accent?: boolean;
  wide?: boolean;
}) {
  return (
    <View className={wide ? 'pr-2' : ''} style={{ flex: wide ? 1.45 : 1 }}>
      <Text
        variant={header ? 'label' : 'body'}
        weight={header || accent ? 'bold' : 'semibold'}
        className={accent ? 'text-brand-500' : ''}
      >
        {label}
      </Text>
    </View>
  );
}

function WordDetailFooter() {
  const [reviewAdded, setReviewAdded] = useState(false);
  const [shared, setShared] = useState(false);

  return (
    <View className="flex-row gap-3 border-t border-border bg-surface px-4 py-4">
      <Button
        label={reviewAdded ? 'Added' : 'Add to Review'}
        onPress={() => setReviewAdded(true)}
        className="flex-1"
      />
      <Button
        label={shared ? 'Shared' : 'Share'}
        variant="secondary"
        onPress={() => setShared(true)}
      />
    </View>
  );
}
