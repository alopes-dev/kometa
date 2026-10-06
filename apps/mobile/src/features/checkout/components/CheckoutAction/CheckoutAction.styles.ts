import styled from 'styled-components/native';
import { checkoutTextStyle, continuousCorners } from '@/theme';
import type { CtaTone } from '../../checkoutState';

/**
 * Board 03 · CTA and board 14 · Checkout action: `ready · disabled · loading ·
 * success · error`. The band it sits in is drawn by `BottomAction`, which
 * every screen in the path shares so the button never moves between steps.
 */
export const Band = styled.View<{ bottomInset: number }>`
  background-color: ${({ theme }) => theme.colors.background.primary};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border.subtle};
  padding-horizontal: ${({ theme }) => theme.checkout.metrics.actionPaddingH}px;
  padding-top: ${({ theme }) => theme.checkout.metrics.actionPaddingTop}px;
  gap: ${({ theme }) => theme.checkout.metrics.actionGap}px;
  padding-bottom: ${({ theme, bottomInset }) =>
    Math.max(bottomInset, theme.spacing[16]) + theme.spacing[8]}px;
`;

export const Button = styled.View<{ tone: CtaTone }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[8]}px;
  height: ${({ theme }) => theme.checkout.metrics.ctaHeight}px;
  padding-horizontal: ${({ theme }) => theme.spacing[20]}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.ctaRadius}px;
  ${continuousCorners}
  background-color: ${({ theme, tone }) =>
    tone === 'destructive'
      ? theme.colors.status.error.fill
      : tone === 'disabled'
        ? theme.colors.surface.disabled
        : theme.colors.brand.base};
`;

export const Label = styled.Text<{ tone: CtaTone }>`
  ${checkoutTextStyle('actionLabel')}
  color: ${({ theme, tone }) =>
    tone === 'disabled' ? theme.colors.text.muted : theme.colors.text.onBrand};
`;

/** The pair board 05 draws above the CTA on an invalid cart. */
export const SecondaryRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

export const SecondaryButton = styled.View<{ destructive?: boolean }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: ${({ theme }) => theme.layout.minHitTarget}px;
  padding-horizontal: ${({ theme }) => theme.spacing[16]}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.ctaRadius}px;
  ${continuousCorners}
  border-width: 1px;
  border-color: ${({ theme, destructive }) =>
    destructive ? theme.colors.status.error.fill : theme.colors.border.default};
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

export const SecondaryLabel = styled.Text<{ destructive?: boolean }>`
  ${checkoutTextStyle('secondaryActionLabel')}
  color: ${({ theme, destructive }) => (destructive ? theme.colors.text.error : theme.colors.text.primary)};
`;
