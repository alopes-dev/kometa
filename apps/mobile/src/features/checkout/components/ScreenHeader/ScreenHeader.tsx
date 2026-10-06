import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import { content } from '../../content';
import { Action, ActionSpacer, Back, Bar, Caption, Title, Titles } from './ScreenHeader.styles';

export type ScreenHeaderProps = {
  title: string;
  caption?: string;
  /** The trailing text action — `Editar`, `Concluir`, `Adicionar`. */
  action?: { label: string; onPress: () => void };
  /** Defaults to `router.back()`, which is what every board in the path does. */
  onBack?: () => void;
};

/**
 * The navigation bar shared by every screen in the cart and checkout path.
 *
 * It owns the top safe area so no screen has to, and it always renders
 * something in the trailing slot — the action or an invisible spacer — so the
 * title does not shift sideways between two steps of the same flow.
 */
export function ScreenHeader({ title, caption, action, onBack }: ScreenHeaderProps) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Bar topInset={insets.top}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        accessibilityRole="button"
        accessibilityLabel={content.back}
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? theme.pressed.opacity : 1 })}
      >
        <Back>
          <Icon
            name="chevron-back"
            sf="chevron.left"
            size={theme.checkout.metrics.backIcon}
            color="primary"
          />
        </Back>
      </Pressable>
      <Titles>
        <Title numberOfLines={1}>{title}</Title>
        {caption ? <Caption numberOfLines={1}>{caption}</Caption> : null}
      </Titles>
      {action ? (
        <Pressable onPress={action.onPress} accessibilityRole="button" hitSlop={8}>
          <Action>{action.label}</Action>
        </Pressable>
      ) : (
        <ActionSpacer />
      )}
    </Bar>
  );
}
