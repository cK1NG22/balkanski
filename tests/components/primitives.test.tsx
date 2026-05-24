import { render, screen, fireEvent } from '@testing-library/react-native';

import { Button, Card, Text } from '@/components';

describe('Button', () => {
  it('renders the label', () => {
    render(<Button label="Press me" onPress={() => {}} />);
    expect(screen.getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button label="Tap" onPress={onPress} />);
    fireEvent.press(screen.getByText('Tap'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button label="Tap" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('Tap'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <Text>inside card</Text>
      </Card>,
    );
    expect(screen.getByText('inside card')).toBeTruthy();
  });

  it('calls onPress when pressable', () => {
    const onPress = jest.fn();
    render(
      <Card onPress={onPress}>
        <Text>tap card</Text>
      </Card>,
    );
    fireEvent.press(screen.getByText('tap card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Text', () => {
  it('renders the content', () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('accepts variants without error', () => {
    render(
      <>
        <Text variant="display">D</Text>
        <Text variant="h1">H1</Text>
        <Text variant="h2">H2</Text>
        <Text variant="h3">H3</Text>
        <Text variant="body">B</Text>
        <Text variant="caption">C</Text>
        <Text variant="label">L</Text>
        <Text variant="mono">M</Text>
      </>,
    );
    expect(screen.getByText('D')).toBeTruthy();
    expect(screen.getByText('M')).toBeTruthy();
  });
});
