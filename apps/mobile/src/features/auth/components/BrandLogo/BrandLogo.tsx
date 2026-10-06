import { Text } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { OnboardingIcon } from '@/features/onboarding/components/OnboardingIcon';
import { brand } from '../../assets';
import { welcome } from '../../content';

/** `Cometa logo` — node 74:24624. */
const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.auth.metrics.logoGap}px;
`;

/** `Comet mark` — node 74:24625. The plate the Kometa mark sits on. */
const Mark = styled.View`
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.auth.metrics.markSize}px;
  height: ${({ theme }) => theme.auth.metrics.markSize}px;
  border-radius: ${({ theme }) => theme.auth.metrics.markRadius}px;
  background-color: ${({ theme }) => theme.auth.color.offerGreen};
`;

const Wordmark = styled(Text)`
  font-family: ${({ theme }) => theme.auth.type.wordmark.fontFamily};
  font-size: ${({ theme }) => theme.auth.type.wordmark.fontSize}px;
  letter-spacing: ${({ theme }) => theme.auth.type.wordmark.letterSpacing}px;
  color: ${({ theme }) => theme.auth.color.textPrimary};
`;

/**
 * The lockup in the Welcome screen's navigation row — node 74:24624.
 *
 * Exposed to assistive tech as one label rather than a mark plus a word, since
 * the two are one name, not two pieces of information.
 */
export function BrandLogo() {
  const theme = useTheme();

  return (
    <Row accessible accessibilityRole="image" accessibilityLabel={welcome.wordmark}>
      <Mark>
        <OnboardingIcon source={brand.kometaMark} size={theme.auth.metrics.markLogoWidth} />
      </Mark>
      <Wordmark>{welcome.wordmark}</Wordmark>
    </Row>
  );
}
