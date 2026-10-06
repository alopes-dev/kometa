import type { ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Icon, type IconProps } from '@/components/design-system/atoms';
import { checkoutTextStyle, continuousCorners } from '@/theme';

export type StateTone = 'progress' | 'pending' | 'success' | 'error';

const Container = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.checkout.metrics.stateGap}px;
  padding-horizontal: ${({ theme }) => theme.spacing[32]}px;
  padding-vertical: ${({ theme }) => theme.spacing[48]}px;
`;

const Badge = styled.View<{ tone: StateTone }>`
  width: ${({ theme }) => theme.checkout.metrics.stateBadge}px;
  height: ${({ theme }) => theme.checkout.metrics.stateBadge}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.stateBadge / 2}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, tone }) =>
    tone === 'success'
      ? theme.colors.brand.base
      : tone === 'error'
        ? theme.colors.status.error.bg
        : tone === 'pending'
          ? theme.colors.status.warning.bg
          : theme.colors.status.success.bg};
`;

const Title = styled.Text`
  ${checkoutTextStyle('stateTitle')}
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Body = styled.Text`
  ${checkoutTextStyle('stateBody')}
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Extra = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.checkout.metrics.bodyGap}px;
  padding-top: ${({ theme }) => theme.spacing[8]}px;
`;

export { continuousCorners };

export type StateScreenProps = {
  tone: StateTone;
  title: string;
  body: string;
  icon?: Pick<IconProps, 'name' | 'sf'>;
  children?: ReactNode;
};

/**
 * The centred states boards 14 and 17 draw: processing, pending, failed and
 * confirmed.
 *
 * One component for four states because the boards differ only in the badge
 * and the words. The tone decides the glyph as well as the colour, so none of
 * them can be told apart by colour alone (board 19 · 06).
 */
export function StateScreen({ tone, title, body, icon, children }: StateScreenProps) {
  const theme = useTheme();

  return (
    <Container accessible accessibilityRole="alert" accessibilityLabel={`${title}. ${body}`}>
      <Badge tone={tone}>
        {tone === 'progress' ? (
          <ActivityIndicator size="large" color={theme.colors.brand.base} />
        ) : (
          <Icon
            name={icon?.name ?? TONE_ICON[tone].name}
            sf={icon?.sf ?? TONE_ICON[tone].sf}
            size={theme.checkout.metrics.stateBadgeIcon}
            color={tone === 'success' ? 'onBrand' : tone === 'error' ? 'error' : 'warning'}
          />
        )}
      </Badge>
      <Title>{title}</Title>
      <Body>{body}</Body>
      {children ? <Extra>{children}</Extra> : null}
    </Container>
  );
}

const TONE_ICON: Record<StateTone, Pick<IconProps, 'name' | 'sf'>> = {
  progress: { name: 'sync-outline', sf: 'arrow.triangle.2.circlepath' },
  pending: { name: 'time-outline', sf: 'clock' },
  success: { name: 'checkmark', sf: 'checkmark' },
  error: { name: 'close', sf: 'xmark' },
};
