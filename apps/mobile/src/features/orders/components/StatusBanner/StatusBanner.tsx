import { View } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';
import { Icon } from '@/components/design-system/atoms';
import { Body, Container, Message, Title } from './StatusBanner.styles';

/**
 * The four banners board 03 draws at the foot of the component library:
 * Sucesso, Atrasado, Erro, Offline.
 *
 * Title and body are announced as one statement because the body is where the
 * next action lives — board 13 asks every failure to say what happened, the
 * impact and the next step, and a reader that hears only the headline gets
 * the first third of that.
 */
export type BannerTone = 'success' | 'warning' | 'error' | 'info';

const ICONS: Record<BannerTone, { name: keyof typeof Ionicons.glyphMap; sf: SFSymbol }> = {
  success: { name: 'checkmark-circle-outline', sf: 'checkmark.circle' },
  warning: { name: 'time-outline', sf: 'clock' },
  error: { name: 'alert-circle-outline', sf: 'exclamationmark.triangle' },
  info: { name: 'cloud-offline-outline', sf: 'wifi.slash' },
};

export type StatusBannerProps = {
  tone: BannerTone;
  title: string;
  body?: string;
};

/**
 * Joins the title and the body into one spoken sentence.
 *
 * A bare space runs them together — "Localização desativada Podes
 * acompanhar…" — with no pause where the heading ends. The full stop is added
 * only when the title does not already carry its own punctuation.
 */
function announce(title: string, body: string): string {
  return /[.!?:]$/.test(title) ? `${title} ${body}` : `${title}. ${body}`;
}

export function StatusBanner({ tone, title, body }: StatusBannerProps) {
  const icon = ICONS[tone];

  return (
    <Container
      tone={tone}
      accessibilityRole="alert"
      accessibilityLabel={body ? announce(title, body) : title}
    >
      {/* The icon is what keeps the tone readable without colour. */}
      <View testID="status-banner-icon">
        <Icon name={icon.name} sf={icon.sf} size={18} color={tone} />
      </View>
      <Body>
        <Title tone={tone}>{title}</Title>
        {body ? <Message>{body}</Message> : null}
      </Body>
    </Container>
  );
}
