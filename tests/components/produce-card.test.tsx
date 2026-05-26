import { fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard } from 'react-native';

import { ProduceCard } from '@/components';

// Smoke-tests the contract that closes ROADMAP Phase 1's "close answers show
// correction inline" Done-when. The grading library already has full
// edge-case coverage in tests/lib/grading; here we just confirm the wiring:
// FillInBlankInput → tier === 'close' → correction renders → Continue fires
// onGraded('close').
describe('ProduceCard', () => {
  function setup(onGraded = jest.fn()) {
    render(
      <ProduceCard
        englishTranslation="he writes"
        acceptedAnswers={['piše']}
        onGraded={onGraded}
      />,
    );
    return { onGraded };
  }

  it('renders the English prompt and the input', () => {
    setup();
    expect(screen.getByText('he writes')).toBeTruthy();
    expect(screen.getByText('Your answer')).toBeTruthy();
    expect(screen.getByText('Check')).toBeTruthy();
  });

  it('shows the correction inline when a close answer is submitted', () => {
    setup();
    // "pise" is a diacritic-only miss of "piše" → grader returns tier=close
    // with correction="piše".
    fireEvent.changeText(screen.getByPlaceholderText('...'), 'pise');
    fireEvent.press(screen.getByText('Check'));

    expect(screen.getByText('Almost — check the spelling')).toBeTruthy();
    expect(screen.getByText('Correct spelling: piše')).toBeTruthy();
    // Continue button appears so the learner can advance.
    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('does not show a correction when the answer is right', () => {
    setup();
    fireEvent.changeText(screen.getByPlaceholderText('...'), 'piše');
    fireEvent.press(screen.getByText('Check'));

    expect(screen.getByText('Bravo!')).toBeTruthy();
    // No "Correct spelling:" line because tier === 'right'.
    expect(screen.queryByText(/^Correct spelling:/)).toBeNull();
  });

  it('shows the correction for wrong answers too', () => {
    setup();
    fireEvent.changeText(screen.getByPlaceholderText('...'), 'kruh');
    fireEvent.press(screen.getByText('Check'));

    expect(screen.getByText('Not quite')).toBeTruthy();
    expect(screen.getByText('Correct spelling: piše')).toBeTruthy();
  });

  it('calls onGraded with the tier when Continue is pressed', () => {
    const { onGraded } = setup();
    fireEvent.changeText(screen.getByPlaceholderText('...'), 'pise');
    fireEvent.press(screen.getByText('Check'));
    fireEvent.press(screen.getByText('Continue'));

    expect(onGraded).toHaveBeenCalledTimes(1);
    expect(onGraded).toHaveBeenCalledWith('close');
  });

  it('propagates the right tier through Continue', () => {
    const { onGraded } = setup();
    fireEvent.changeText(screen.getByPlaceholderText('...'), 'piše');
    fireEvent.press(screen.getByText('Check'));
    fireEvent.press(screen.getByText('Continue'));
    expect(onGraded).toHaveBeenCalledWith('right');
  });

  it('propagates the wrong tier through Continue', () => {
    const { onGraded } = setup();
    fireEvent.changeText(screen.getByPlaceholderText('...'), 'kruh');
    fireEvent.press(screen.getByText('Check'));
    fireEvent.press(screen.getByText('Continue'));
    expect(onGraded).toHaveBeenCalledWith('wrong');
  });

  it('dismisses the keyboard when Check is pressed', () => {
    const spy = jest.spyOn(Keyboard, 'dismiss');
    setup();
    fireEvent.changeText(screen.getByPlaceholderText('...'), 'pise');
    fireEvent.press(screen.getByText('Check'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  // Phase 2 — Serbian Latin/Cyrillic script toggle. When the learner's
  // pref is Cyrillic, the lesson runner passes BOTH spellings as
  // acceptedAnswers so a Cyrillic answer grades as `right` and Latin still
  // works as the keyboard-fallback. Multi-answer grading picks the best
  // match across the set.
  it('accepts a Cyrillic answer when both scripts are in acceptedAnswers', () => {
    const onGraded = jest.fn();
    render(
      <ProduceCard
        englishTranslation="he writes"
        acceptedAnswers={['piše', 'пише']}
        onGraded={onGraded}
      />,
    );
    fireEvent.changeText(screen.getByPlaceholderText('...'), 'пише');
    fireEvent.press(screen.getByText('Check'));

    expect(screen.getByText('Bravo!')).toBeTruthy();
    expect(screen.queryByText(/^Correct spelling:/)).toBeNull();
    fireEvent.press(screen.getByText('Continue'));
    expect(onGraded).toHaveBeenCalledWith('right');
  });
});
