import { Button, Icon, type IconProps } from '@/components/design-system/atoms';
import { Centered, Disc, ICON_SIZE, Root } from './SearchEmptyState.styles';

export type SearchEmptyStateProps = {
  /** The pairing `Icon` expects: an SF Symbol for iOS, an Ionicon for Android. */
  icon: { name: IconProps['name']; sf: IconProps['sf'] };
  title: string;
  body: string;
  /** The one way out, where there is one — node 62:340. */
  action?: { label: string; onPress: () => void };
};

/**
 * The block both Search boards draw where there is nothing to list — node
 * 62:290, "04 — Search Empty States".
 *
 * One component for the two phones because they differ only in their glyph,
 * their words and whether there is anything to press: "Busca vazia"
 * (node 62:314) asks what you are looking for, "Sem resultados"
 * (node 62:335) says it found nothing and offers the way back.
 *
 * It takes its copy rather than holding it: what an empty state should say
 * depends on how the screen arrived at it — a query that matched nothing and
 * a filter that cut everything are not the same dead end — and that is the
 * screen's knowledge, not this component's.
 */
export function SearchEmptyState({ icon, title, body, action }: SearchEmptyStateProps) {
  return (
    <Root>
      <Disc>
        <Icon name={icon.name} sf={icon.sf} size={ICON_SIZE} color="brand" />
      </Disc>

      {/*
        The board sets the title in Poppins at 18, a step the ramp has no
        place for; `h5` is the nearest and the one every other heading on
        these screens already uses.
      */}
      <Centered variant="h5">{title}</Centered>
      <Centered variant="caption" color="secondary">
        {body}
      </Centered>

      {action ? (
        <Button variant="primary" size="md" shape="pill" onPress={action.onPress}>
          {action.label}
        </Button>
      ) : null}
    </Root>
  );
}
