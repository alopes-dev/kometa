import { Image } from 'expo-image';

export type OnboardingIconProps = {
  /**
   * A `require`d asset from `features/onboarding/assets` or the auth set —
   * an exported SVG for the glyphs, or a PNG where the artwork is not one
   * (the brand mark in the welcome lockup).
   */
  source: number;
  /**
   * The square box reserved for the artwork, passed explicitly so it does
   * not collapse and then jump once the file decodes. The glyphs are square
   * and fill it exactly; a wider source is contained within it and centred,
   * so this is its width rather than its height.
   */
  size: number;
  /**
   * Recolours the glyph where the design makes its colour stateful — the
   * category grid draws the same icon green when selected and grey when not.
   * Left undefined, the colour exported in the file is what renders.
   */
  tintColor?: string;
  accessibilityLabel?: string;
};

/**
 * Renders one of the exported assets inside a box reserved for it.
 *
 * `expo-image` decodes SVG on both platforms, which is what lets these ship as
 * the files Figma produced instead of being redrawn as `react-native-svg`
 * elements — the project has no SVG transformer, and hand-porting the paths
 * would put a second, drifting copy of each glyph in the repo.
 */
export function OnboardingIcon({
  source,
  size,
  tintColor,
  accessibilityLabel,
}: OnboardingIconProps) {
  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      contentFit="contain"
      tintColor={tintColor}
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
