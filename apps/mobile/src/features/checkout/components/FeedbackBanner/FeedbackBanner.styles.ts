import styled from 'styled-components/native';
import { checkoutTextStyle, continuousCorners } from '@/theme';

/**
 * Board 03 · Feedback, and every banner the screen boards stack on top of a
 * list: `inline · toast · success · error · loading`.
 *
 * `loading` is a tone rather than a separate component because board 09 draws
 * "A verificar o código…" in the same slot, at the same geometry, as the
 * failure it will become — swapping components there would move the message.
 */
export type BannerTone = 'info' | 'success' | 'warning' | 'error' | 'loading';

export const Container = styled.View<{ tone: BannerTone }>`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.checkout.metrics.bannerGap}px;
  padding: ${({ theme }) => theme.checkout.metrics.bannerPadding}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.bannerRadius}px;
  ${continuousCorners}
  background-color: ${({ theme, tone }) =>
    tone === 'success'
      ? theme.colors.status.success.bg
      : tone === 'warning'
        ? theme.colors.status.warning.bg
        : tone === 'error'
          ? theme.colors.status.error.bg
          : tone === 'info'
            ? theme.colors.status.info.bg
            : theme.colors.background.secondary};
`;

export const Copy = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing[2]}px;
`;

export const Title = styled.Text<{ tone: BannerTone }>`
  ${checkoutTextStyle('bannerTitle')}
  color: ${({ theme, tone }) => toneColor(theme, tone)};
`;

export const Body = styled.Text<{ tone: BannerTone }>`
  ${checkoutTextStyle('bannerBody')}
  color: ${({ theme, tone }) => toneColor(theme, tone)};
`;

function toneColor(
  theme: { colors: { status: Record<string, { fg: string }>; text: { secondary: string } } },
  tone: BannerTone
): string {
  if (tone === 'loading') return theme.colors.text.secondary;
  return theme.colors.status[tone].fg;
}
