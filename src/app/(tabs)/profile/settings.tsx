import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Screen, TeacherAvatar, Text } from '@/components';
import { storage, storageKeys } from '@/lib/storage/mmkv';
import { pushScriptPrefBestEffort, realScriptPrefIO } from '@/lib/sync';
import { useAuth } from '@/providers/AuthProvider';

type ScriptPref = 'latin' | 'cyrillic';

function readScriptPref(): ScriptPref {
  return (storage.getString(storageKeys.serbianScriptPref) ?? 'latin') as ScriptPref;
}

const DAD_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCnYtcAIEGQ1AlHCVTI2RiTs7_gqdye8YtQK9pwYRB2idawzZ5mro-WClEjOe9SZOJD0SuFGQEd2NgxFC740M4vh6nHB2qmFChYNjXYLwU2wUq7iETyoZDb28g4lHxqlzYXdKAoGZ373fsYj0iUqNf9hbA3OshqCQFeJv8h86wlD7PYOE4FtJYqozESCL26jOFszxLSkTCd6WXX0_Dre-n9dK7ERCZlobbaoa5uPTAM9hKHOOyghphwcwul9imAgTCImEEcbvNwcDE';

const languages = [
  'Hrvatski',
  'Srpski',
  'Bosanski',
];

export default function Settings() {
  const [selectedLanguage, setSelectedLanguage] = useState('Srpski');
  const [dailyGoal, setDailyGoal] = useState(5);
  const [scriptPref, setScriptPref] = useState<ScriptPref>(readScriptPref);
  const { session } = useAuth();

  const handleScriptChange = (next: ScriptPref) => {
    setScriptPref(next);
    storage.set(storageKeys.serbianScriptPref, next);
    // Best-effort remote push so a second device sees the new pref on next
    // sign-in. Local UX never blocks on network — sync-on-sign-in will
    // reconcile if this fails.
    if (session?.userId) {
      void pushScriptPrefBestEffort(session.userId, next, realScriptPrefIO).then((r) => {
        if (!r.ok && __DEV__) {
          console.warn('[settings] scriptPref remote push failed:', r.remoteError);
        }
      });
    }
  };

  return (
    <Screen scroll>
      <View className="gap-5 pb-8">
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} className="active:opacity-70">
            <Text variant="h2" className="text-brand-500">
              Back
            </Text>
          </Pressable>
          <Text variant="h2" className="text-brand-500" weight="bold">
            Settings
          </Text>
        </View>

        <Card variant="outlined" className="flex-row items-center gap-4">
          <View className="rounded-full border-4 border-accent-500 bg-surface p-1">
            <TeacherAvatar
              teacherId="balkan-dad"
              name="Balkan Dad"
              avatarUrl={DAD_IMAGE}
              size="lg"
            />
          </View>
          <View className="flex-1 gap-1">
            <Text variant="h2" className="text-brand-500" weight="bold">
              Balkan Dad
            </Text>
            <Text variant="body">Level 42 Rakija Master</Text>
            <View className="self-start rounded-pill bg-accent-500/20 px-3 py-1">
              <Text variant="caption" weight="semibold">
                Fluent Speaker
              </Text>
            </View>
          </View>
        </Card>

        <Card variant="default" className="gap-1 bg-brand-500">
          <Text variant="label" color="inverse">
            Streak
          </Text>
          <Text variant="display" color="inverse">
            157
          </Text>
          <Text variant="h3" color="inverse">
            Days in a row!
          </Text>
        </Card>

        <Card variant="outlined" className="gap-4">
          <Text variant="h2" weight="bold">
            Target Dialect
          </Text>
          {languages.map((language) => (
            <Pressable
              key={language}
              onPress={() => setSelectedLanguage(language)}
              className={`items-center rounded-card border p-5 ${
                selectedLanguage === language
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-border bg-surface'
              }`}
            >
              <View
                className={`mb-3 h-12 w-12 items-center justify-center rounded-full ${
                  selectedLanguage === language ? 'bg-brand-500' : 'bg-border/40'
                }`}
              >
                <Text
                  variant="h3"
                  color={selectedLanguage === language ? 'inverse' : 'default'}
                >
                  {selectedLanguage === language ? 'SR' : '--'}
                </Text>
              </View>
              <Text
                variant="body"
                weight="semibold"
                className={selectedLanguage === language ? 'text-brand-500' : ''}
              >
                {language}
              </Text>
            </Pressable>
          ))}
        </Card>

        <Card variant="outlined" className="gap-4">
          <Text variant="h2" weight="bold">
            Script
          </Text>
          <Text variant="body" color="muted">
            How Serbian words appear in lessons. Croatian and Bosnian stay Latin.
          </Text>
          <View className="flex-row gap-3">
            <ScriptOption
              label="Latin"
              sample="piše"
              selected={scriptPref === 'latin'}
              onPress={() => handleScriptChange('latin')}
            />
            <ScriptOption
              label="Cyrillic"
              sample="пише"
              selected={scriptPref === 'cyrillic'}
              onPress={() => handleScriptChange('cyrillic')}
            />
          </View>
        </Card>

        <Card variant="outlined" className="gap-4">
          <Text variant="h2" weight="bold">
            Daily Goal
          </Text>
          <Text variant="body" color="muted">
            How many lessons today?
          </Text>
          <View className="flex-row items-center justify-between rounded-pill border border-border bg-bg px-6 py-3">
            <Pressable
              onPress={() => setDailyGoal((current) => Math.max(1, current - 1))}
              className="px-3 py-1 active:opacity-70"
            >
              <Text variant="h3">-</Text>
            </Pressable>
            <View className="items-center">
              <Text variant="h2" className="text-brand-500">
                {dailyGoal}
              </Text>
              <Text variant="caption" color="muted">
                lessons
              </Text>
            </View>
            <Pressable
              onPress={() => setDailyGoal((current) => Math.min(10, current + 1))}
              className="px-3 py-1 active:opacity-70"
            >
              <Text variant="h3">+</Text>
            </Pressable>
          </View>
        </Card>

        <Card variant="outlined" className="gap-3">
          <Text variant="h2" weight="bold">
            Known Words
          </Text>
          <Text variant="body" color="muted">
            Words you've marked as already known. Lessons skip these.
          </Text>
          <Button
            label="Manage known words"
            variant="secondary"
            onPress={() => router.push('/(modal)/known-words')}
            fullWidth
          />
        </Card>

        <Button label="Sign out" variant="destructive" onPress={() => router.replace('/(auth)/sign-in')} />

        <View className="items-center gap-3 py-6">
          <Text variant="body" color="muted">
            End of settings
          </Text>
          <Text variant="caption" color="muted">
            Balkanski v2.4.0-prototype
          </Text>
          <Text variant="caption" color="muted">
            Made with coffee and Rakija
          </Text>
        </View>
      </View>
    </Screen>
  );
}

interface ScriptOptionProps {
  label: string;
  sample: string;
  selected: boolean;
  onPress: () => void;
}

function ScriptOption({ label, sample, selected, onPress }: ScriptOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label} script`}
      className={`flex-1 items-center gap-2 rounded-card border p-4 ${
        selected ? 'border-brand-500 bg-brand-50' : 'border-border bg-surface'
      }`}
    >
      <Text
        variant="h3"
        weight="bold"
        className={selected ? 'text-brand-500' : ''}
      >
        {sample}
      </Text>
      <Text
        variant="caption"
        color={selected ? 'accent' : 'muted'}
        weight="semibold"
      >
        {label}
      </Text>
    </Pressable>
  );
}
