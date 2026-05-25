import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import {
  BulkMarkButton,
  KnownWordRow,
  Screen,
  Text,
} from '@/components';
import { loadStarterVocab } from '@/data/loader';
import type { Concept } from '@/data/schemas/concept';
import type { Variant } from '@/data/schemas/variant';
import { getLocalLearnerId } from '@/lib/learner-id';
import {
  getMarkedKnownVariantIds,
  markVariantKnown,
  markVariantsKnown,
  unmarkVariantKnown,
} from '@/lib/srs/sqlite';
import { storage, storageKeys } from '@/lib/storage/mmkv';

// Known Words editor: scrollable frequency-ranked list of variants with
// per-row checkboxes and an inline "I know up to here" shortcut.
// Authoritative design: docs/decisions/0002-known-words-vs-placement-test.md

interface Row {
  variant: Variant;
  concept: Concept | null;
  word: string;
}

export default function KnownWords() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const handleClose = useCallback(() => {
    // From onboarding: there's no back-stack to fall back to (we replaced),
    // so explicitly land on the lessons tab. From settings: a normal `back()`.
    if (from === 'onboarding') router.replace('/(tabs)/learn');
    else router.back();
  }, [from]);

  const [vocab] = useState(() => loadStarterVocab('sr'));
  const userId = useMemo(getLocalLearnerId, []);
  const scriptPref = (storage.getString(storageKeys.serbianScriptPref) ?? 'latin') as
    | 'latin'
    | 'cyrillic';

  const conceptById = useMemo(() => {
    const m = new Map<string, Concept>();
    for (const c of vocab.concepts) m.set(c.id, c);
    return m;
  }, [vocab.concepts]);

  const rows: Row[] = useMemo(() => {
    return vocab.variants
      .filter((v) => v.language === 'sr' && v.regionalTag === null)
      .sort((a, b) => a.frequencyRankInLang - b.frequencyRankInLang)
      .map((variant) => {
        const concept = conceptById.get(variant.conceptId) ?? null;
        const word =
          scriptPref === 'cyrillic' && variant.cyrillicSpelling
            ? variant.cyrillicSpelling
            : variant.latinSpelling;
        return { variant, concept, word };
      });
  }, [vocab.variants, conceptById, scriptPref]);

  const [known, setKnown] = useState<Set<string>>(() => {
    try {
      return getMarkedKnownVariantIds(userId);
    } catch {
      return new Set();
    }
  });

  // Re-read once on mount in case another surface (sync) wrote to SQLite
  // between hook init and first paint. Cheap; sub-millisecond on 121 rows.
  useEffect(() => {
    try {
      setKnown(getMarkedKnownVariantIds(userId));
    } catch {
      // ignore; the initial state stands.
    }
  }, [userId]);

  const handleToggle = useCallback(
    (variantId: string, nextChecked: boolean) => {
      setKnown((prev) => {
        const next = new Set(prev);
        if (nextChecked) next.add(variantId);
        else next.delete(variantId);
        return next;
      });
      try {
        if (nextChecked) markVariantKnown(userId, variantId);
        else unmarkVariantKnown(userId, variantId);
      } catch (err) {
        if (__DEV__) console.warn('[known-words] persist toggle failed', err);
      }
    },
    [userId],
  );

  const handleMarkUpToHere = useCallback(
    (rank: number) => {
      const ids = rows
        .filter((r) => r.variant.frequencyRankInLang <= rank)
        .map((r) => r.variant.id);
      setKnown((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.add(id);
        return next;
      });
      try {
        markVariantsKnown(userId, ids);
      } catch (err) {
        if (__DEV__) console.warn('[known-words] bulk-mark failed', err);
      }
    },
    [rows, userId],
  );

  const handleMarkAll = useCallback(() => {
    if (rows.length === 0) return;
    handleMarkUpToHere(rows[rows.length - 1].variant.frequencyRankInLang);
  }, [rows, handleMarkUpToHere]);

  return (
    <Screen
      header={
        <Header
          knownCount={known.size}
          totalCount={rows.length}
          onClose={handleClose}
          onMarkAll={handleMarkAll}
        />
      }
    >
      <FlatList
        data={rows}
        keyExtractor={(r) => r.variant.id}
        renderItem={({ item }) => (
          <KnownWordRow
            rank={item.variant.frequencyRankInLang}
            word={item.word}
            gloss={item.concept?.englishTranslation ?? '—'}
            script={scriptPref}
            checked={known.has(item.variant.id)}
            onToggle={(next) => handleToggle(item.variant.id, next)}
            onMarkUpToHere={() =>
              handleMarkUpToHere(item.variant.frequencyRankInLang)
            }
          />
        )}
        initialNumToRender={20}
        windowSize={10}
      />
    </Screen>
  );
}

interface HeaderProps {
  knownCount: number;
  totalCount: number;
  onClose: () => void;
  onMarkAll: () => void;
}

function Header({ knownCount, totalCount, onClose, onMarkAll }: HeaderProps) {
  return (
    <View className="border-b border-border bg-surface px-4 pb-3 pt-2">
      <View className="items-center pb-2">
        <View className="h-1.5 w-20 rounded-pill bg-border" />
      </View>
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text variant="h3" weight="bold">
            Mark words you know
          </Text>
          <Text variant="caption" color="muted">
            You know {knownCount} of {totalCount} words
          </Text>
        </View>
        <BulkMarkButton label="Mark all" onPress={onMarkAll} />
        <Pressable onPress={onClose} accessibilityRole="button" className="px-2 py-1 active:opacity-70">
          <Text variant="body" weight="semibold" color="accent">
            Done
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export { KnownWords };
