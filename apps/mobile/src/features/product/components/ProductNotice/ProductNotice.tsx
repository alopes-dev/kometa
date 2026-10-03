import type { ReactNode } from 'react';
import { Icon } from '@/components/design-system/atoms';
import type { IconProps } from '@/components/design-system/atoms/Icon/Icon';
import { Container, Label, type NoticeTone } from './ProductNotice.styles';

export type { NoticeTone };

export type ProductNoticeProps = {
  tone?: NoticeTone;
  icon?: Pick<IconProps, 'name' | 'sf'>;
  children: ReactNode;
};

/**
 * A statement about the product that is not a choice — availability, a
 * discount, a caution. Read-only by construction: nothing here is pressable,
 * so nothing invites a tap that would do nothing.
 */
export function ProductNotice({ tone = 'neutral', icon, children }: ProductNoticeProps) {
  const iconColor =
    tone === 'positive' ? 'success' : tone === 'warning' ? 'warning' : tone === 'unavailable' ? 'error' : 'secondary';

  return (
    <Container tone={tone} accessible accessibilityRole="text">
      {icon ? <Icon name={icon.name} sf={icon.sf} size={14} color={iconColor} /> : null}
      <Label tone={tone}>{children}</Label>
    </Container>
  );
}
