import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import type { DefaultTheme } from 'styled-components/native';
import { Button, Icon } from '@/components/design-system/atoms';
import { continuousCorners, ordersTextStyle } from '@/theme';

/**
 * The shape boards 13 and 14 end on: a badge, a sentence, a qualifying chip
 * and two ways forward.
 *
 * Board 14 sets the colour rule these two share — "O resultado concluído
 * volta a uma paleta neutra" — so a finished outcome is neutral even when the
 * action that produced it was destructive. Red belongs to the button that
 * cancels, not to the screen that reports it cancelled.
 */

export type ResultTone = 'neutral' | 'error';

const badgeBackground = (theme: DefaultTheme, tone: ResultTone) =>
  tone === 'error' ? theme.colors.status.error.bg : theme.colors.background.secondary;

const Screen = styled.View<{ topInset: number; bottomInset: number }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding-top: ${({ theme, topInset }) => theme.spacing[32] + topInset}px;
  padding-bottom: ${({ theme, bottomInset }) => theme.spacing[16] + bottomInset}px;
`;

const Body = styled.View`
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[12]}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
`;

const Badge = styled.View<{ tone: ResultTone }>`
  width: 88px;
  height: 88px;
  border-radius: 44px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, tone }) => badgeBackground(theme, tone)};
`;

const Title = styled.Text`
  ${ordersTextStyle('statusTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const Body2 = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const Chip = styled.View`
  padding-vertical: ${({ theme }) => theme.spacing[6]}px;
  padding-horizontal: ${({ theme }) => theme.spacing[12]}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const ChipLabel = styled.Text`
  ${ordersTextStyle('chip')}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
`;

export type ResultScreenProps = {
  tone: ResultTone;
  icon: { name: keyof typeof Ionicons.glyphMap; sf: SFSymbol };
  title: string;
  body: string;
  chip?: string;
  primary: { label: string; onPress: () => void };
  secondary: { label: string; onPress: () => void };
  children?: ReactNode;
};

export function ResultScreen({
  tone,
  icon,
  title,
  body,
  chip,
  primary,
  secondary,
  children,
}: ResultScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <Screen topInset={insets.top} bottomInset={insets.bottom}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Body>
          <Badge tone={tone}>
            <Icon
              name={icon.name}
              sf={icon.sf}
              size={36}
              color={tone === 'error' ? 'error' : 'secondary'}
            />
          </Badge>
          <Title>{title}</Title>
          <Body2>{body}</Body2>
          {chip ? (
            <Chip>
              <ChipLabel>{chip}</ChipLabel>
            </Chip>
          ) : null}
          {children}
        </Body>
      </ScrollView>

      <Actions>
        <Button variant="primary" size="lg" shape="pill" onPress={primary.onPress}>
          {primary.label}
        </Button>
        <Button variant="text" size="lg" onPress={secondary.onPress}>
          {secondary.label}
        </Button>
      </Actions>
    </Screen>
  );
}
