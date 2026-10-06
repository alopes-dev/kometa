import { ActivityIndicator } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Icon, type IconProps } from '@/components/design-system/atoms';
import { Body, Container, Copy, Title, type BannerTone } from './FeedbackBanner.styles';

export type { BannerTone };

export type FeedbackBannerProps = {
  tone: BannerTone;
  title: string;
  body?: string;
  /** Overrides the tone's default glyph — board 09 gives the expired code a clock. */
  icon?: Pick<IconProps, 'name' | 'sf'>;
};

/**
 * Board 19 · 06: "ícone e texto acompanham qualquer estado por cor". Every
 * banner therefore carries all three — a glyph, a colour and a sentence — so
 * the state survives a customer who cannot tell the red from the amber.
 */
const TONE_ICON: Record<BannerTone, Pick<IconProps, 'name' | 'sf'>> = {
  info: { name: 'information-circle-outline', sf: 'info.circle' },
  success: { name: 'checkmark-circle-outline', sf: 'checkmark.circle' },
  warning: { name: 'warning-outline', sf: 'exclamationmark.triangle' },
  error: { name: 'alert-circle-outline', sf: 'exclamationmark.circle' },
  loading: { name: 'sync-outline', sf: 'arrow.triangle.2.circlepath' },
};

const TONE_COLOR = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  loading: 'secondary',
} as const;

export function FeedbackBanner({ tone, title, body, icon }: FeedbackBannerProps) {
  const theme = useTheme();
  const glyph = icon ?? TONE_ICON[tone];

  return (
    <Container
      tone={tone}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={body ? `${title}. ${body}` : title}
    >
      {tone === 'loading' ? (
        <ActivityIndicator size="small" color={theme.colors.text.secondary} />
      ) : (
        <Icon
          name={glyph.name}
          sf={glyph.sf}
          size={theme.checkout.metrics.bannerIcon}
          color={TONE_COLOR[tone]}
        />
      )}
      <Copy>
        <Title tone={tone}>{title}</Title>
        {body ? <Body tone={tone}>{body}</Body> : null}
      </Copy>
    </Container>
  );
}
