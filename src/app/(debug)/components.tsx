// Visual gallery of every component shell.
// Phase 0 deliverable — verify the library before any real Stitch mocks land.
// Navigate to `/(debug)/components` in dev to see all shells with sample props.

import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  AudioPlayer,
  Button,
  Card,
  CaseEndingPicker,
  CompareLanguagesPanel,
  CyrillicLetter,
  FillInBlankInput,
  FlashCard,
  LessonStep,
  ParetoProgress,
  ProgressBar,
  RecordButton,
  Screen,
  StreakBadge,
  TeacherAvatar,
  Text,
  WordChip,
} from '@/components';
import type { Variant } from '@/data/schemas/variant';

const sampleVariants: Variant[] = [
  { id: 'v-hr', conceptId: 'c-bread', language: 'hr', regionalTag: null, latinSpelling: 'kruh', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 92, caseForms: null },
  { id: 'v-sr', conceptId: 'c-bread', language: 'sr', regionalTag: null, latinSpelling: 'hleb', cyrillicSpelling: 'хлеб', stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 87, caseForms: null },
  { id: 'v-bs', conceptId: 'c-bread', language: 'bs', regionalTag: null, latinSpelling: 'hljeb', cyrillicSpelling: null, stressMark: null, ipa: null, audioUrl: null, frequencyRankInLang: 89, caseForms: null },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card variant="outlined">
      <Text variant="label" color="muted">
        {title}
      </Text>
      <View className="mt-3 gap-3">{children}</View>
    </Card>
  );
}

export default function ComponentsGallery() {
  const [flipped, setFlipped] = useState(false);

  return (
    <Screen scroll>
      <View className="gap-4">
        <Text variant="h1">Shell gallery</Text>
        <Text variant="caption" color="muted">
          Every component shell rendered with sample props. Phase 0 verification surface.
        </Text>

        <Section title="Text variants">
          <Text variant="display">Display</Text>
          <Text variant="h1">Heading 1</Text>
          <Text variant="h2">Heading 2</Text>
          <Text variant="h3">Heading 3</Text>
          <Text variant="body">Body — the default text</Text>
          <Text variant="caption" color="muted">caption muted</Text>
          <Text variant="label" color="muted">Label uppercase</Text>
          <Text variant="mono">mono · code</Text>
        </Section>

        <Section title="Buttons">
          <Button label="Primary" onPress={() => {}} />
          <Button label="Secondary" variant="secondary" onPress={() => {}} />
          <Button label="Ghost" variant="ghost" onPress={() => {}} />
          <Button label="Destructive" variant="destructive" onPress={() => {}} />
          <Button label="Loading" onPress={() => {}} loading />
          <Button label="Disabled" onPress={() => {}} disabled />
          <Button label="Full width" onPress={() => {}} fullWidth />
        </Section>

        <Section title="Cards">
          <Card>
            <Text>Default card</Text>
          </Card>
          <Card variant="elevated">
            <Text>Elevated card (shadow)</Text>
          </Card>
          <Card variant="outlined">
            <Text>Outlined card</Text>
          </Card>
        </Section>

        <Section title="Progress + streak">
          <ProgressBar value={0.3} showLabel />
          <ProgressBar value={0.7} variant="segmented" segments={5} showLabel />
          <ParetoProgress currentRank={320} targetRank={2000} language="sr" />
          <View className="flex-row gap-2">
            <StreakBadge days={0} active={false} />
            <StreakBadge days={3} active size="sm" />
            <StreakBadge days={12} active />
            <StreakBadge days={42} active size="lg" />
          </View>
        </Section>

        <Section title="Cyrillic letter (Serbian)">
          <View className="flex-row gap-3 justify-center">
            <CyrillicLetter letter="Б" romanization="B" ipa="b" state="new" />
            <CyrillicLetter letter="Ђ" romanization="Đ" ipa="dʑ" state="learning" />
            <CyrillicLetter letter="Љ" romanization="Lj" ipa="ʎ" state="known" />
          </View>
        </Section>

        <Section title="Word chips">
          <View className="flex-row gap-2 flex-wrap">
            <WordChip word="kruh" state="known" />
            <WordChip word="хлеб" romanization="hleb" state="learning" />
            <WordChip word="hljeb" state="new" />
          </View>
        </Section>

        <Section title="Compare languages panel">
          <CompareLanguagesPanel
            conceptEnglish="bread"
            variants={sampleVariants}
            currentLanguage="sr"
          />
        </Section>

        <Section title="FlashCard">
          <FlashCard
            flipped={flipped}
            onFlip={(v) => setFlipped(v)}
            front={
              <View className="items-center gap-2">
                <Text variant="caption" color="muted">English</Text>
                <Text variant="h1">bread</Text>
                <Text variant="caption" color="muted">tap to flip</Text>
              </View>
            }
            back={
              <View className="items-center gap-2">
                <Text variant="caption" color="muted">Serbian</Text>
                <Text variant="h1">хлеб</Text>
                <Text variant="caption">hleb</Text>
              </View>
            }
          />
        </Section>

        <Section title="Case-ending picker">
          <CaseEndingPicker
            stem="hleb"
            options={['-a', '-u', '-om', '-e']}
            correct="-u"
            caseHint="dat"
            onAnswer={() => {}}
          />
        </Section>

        <Section title="Fill in the blank">
          <FillInBlankInput
            prompt="The Serbian word for 'bread' is ___"
            acceptedAnswers={['hleb', 'хлеб']}
            onAnswer={() => {}}
          />
        </Section>

        <Section title="LessonStep wrapper">
          <LessonStep
            stepNumber={2}
            totalSteps={5}
            instruction="Pick the correct dative ending"
            prompt={<Text variant="h2">hleb___</Text>}
            feedback={{ status: 'close', message: <Text variant="caption">Missing the š — try `piše`</Text> }}
            onContinue={() => {}}
          >
            <Text variant="caption" color="muted">(interaction widget renders here)</Text>
          </LessonStep>
        </Section>

        <Section title="Teacher avatar">
          <View className="flex-row gap-4 items-end">
            <TeacherAvatar teacherId="niko" name="Niko" size="md" withName />
            <TeacherAvatar
              teacherId="mira"
              name="Baba Mira"
              size="lg"
              withName
              withBubble={{ text: 'Bravo!', tone: 'happy' }}
            />
          </View>
        </Section>

        <Section title="Audio (Phase 5+ stubs)">
          <AudioPlayer src="" />
          <RecordButton />
        </Section>
      </View>
    </Screen>
  );
}
