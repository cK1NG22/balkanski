import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Card, Screen, Text } from '@/components';
import { loadStarterVocab } from '@/data/loader';
import type { Variant } from '@/data/schemas/variant';
import { groupConceptsAcrossLanguages, type CompareRow } from '@/lib/compare/group';
import { storage, storageKeys } from '@/lib/storage/mmkv';

type ScriptPref = 'latin' | 'cyrillic';

function readScriptPref(): ScriptPref {
  return (storage.getString(storageKeys.serbianScriptPref) ?? 'latin') as ScriptPref;
}

const COMPARE_LIMIT = 60;

export default function CompareScreen() {
  const [scriptPref, setScriptPref] = useState<ScriptPref>(readScriptPref);

  // Tab screens stay mounted; re-read scriptPref on focus so a Settings
  // toggle landing while this screen is off-stack reflects when the user
  // returns. Same pattern as Learn + Review tabs.
  useFocusEffect(
    useCallback(() => {
      setScriptPref(readScriptPref());
    }, []),
  );

  const rows = useMemo<CompareRow[]>(() => {
    const sr = loadStarterVocab('sr');
    const hr = loadStarterVocab('hr');
    const bs = loadStarterVocab('bs');
    return groupConceptsAcrossLanguages([sr, hr, bs], { limit: COMPARE_LIMIT });
  }, []);

  return (
    <Screen>
      <View className="gap-4 pb-2">
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            className="active:opacity-70"
          >
            <Text variant="h3" className="text-brand-500">
              Back
            </Text>
          </Pressable>
          <Text variant="h2" className="text-brand-500" weight="bold">
            Compare
          </Text>
        </View>
        <Text variant="body" color="muted">
          Same meaning, three languages. Ranked by frequency.
        </Text>
        <CompareHeader />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.concept.id}
        renderItem={({ item }) => <CompareRowView row={item} scriptPref={scriptPref} />}
        // FlatList is a PureComponent: without extraData it won't re-render
        // visible rows when scriptPref flips, so a Settings toggle wouldn't
        // refresh the SR cells until the list remounted.
        extraData={scriptPref}
      />
    </Screen>
  );
}

function CompareHeader() {
  return (
    <View className="flex-row gap-2 rounded-button border border-border bg-surface px-3 py-2">
      <Text variant="caption" weight="bold" className="flex-1 text-brand-500">
        English
      </Text>
      <Text variant="caption" weight="bold" className="w-20 text-center text-accent-500">
        SR
      </Text>
      <Text variant="caption" weight="bold" className="w-20 text-center text-accent-500">
        HR
      </Text>
      <Text variant="caption" weight="bold" className="w-20 text-center text-accent-500">
        BS
      </Text>
    </View>
  );
}

function CompareRowView({ row, scriptPref }: { row: CompareRow; scriptPref: ScriptPref }) {
  return (
    <Card variant="outlined" className="mb-2 gap-2 px-3 py-3">
      <View className="flex-row items-baseline gap-2">
        <Text variant="caption" color="muted">
          #{row.minRank}
        </Text>
        <Text variant="body" weight="semibold" className="flex-1">
          {row.concept.englishTranslation}
        </Text>
        <Text variant="caption" color="muted">
          {row.concept.partOfSpeech}
        </Text>
      </View>
      <View className="flex-row items-start gap-2">
        <View className="flex-1" />
        <LangCell variants={row.variants.sr} scriptPref={scriptPref} />
        <LangCell variants={row.variants.hr} scriptPref={scriptPref} />
        <LangCell variants={row.variants.bs} scriptPref={scriptPref} />
      </View>
    </Card>
  );
}

// One language → many variants: a single concept can map to multiple
// surface forms in one language (SR/HR/BS "a" + "ali" both = English "but").
// We render the [0] form (lowest rank → primary) with the rest stacked
// below as small alternates, plus the cyrillic alternate for SR when the
// learner's script pref is Latin (or Latin alternate when pref is Cyrillic).
function LangCell({
  variants,
  scriptPref,
}: {
  variants: Variant[];
  scriptPref: ScriptPref;
}) {
  if (variants.length === 0) {
    return (
      <View className="w-20 items-center">
        <Text variant="body" color="muted">
          —
        </Text>
      </View>
    );
  }
  const primaryVariant = variants[0];
  const cyr = primaryVariant.cyrillicSpelling;
  const primary = scriptPref === 'cyrillic' && cyr ? cyr : primaryVariant.latinSpelling;
  const scriptAlt = scriptPref === 'cyrillic' && cyr ? primaryVariant.latinSpelling : (cyr ?? '');
  const synonymAlts = variants.slice(1).map((v) =>
    scriptPref === 'cyrillic' && v.cyrillicSpelling ? v.cyrillicSpelling : v.latinSpelling,
  );
  return (
    <View className="w-20 items-center gap-0.5">
      <Text variant="body" weight="semibold" align="center">
        {primary}
      </Text>
      {scriptAlt ? (
        <Text variant="caption" color="muted" align="center">
          {scriptAlt}
        </Text>
      ) : null}
      {synonymAlts.map((alt) => (
        <Text key={alt} variant="caption" color="muted" align="center">
          {alt}
        </Text>
      ))}
    </View>
  );
}
