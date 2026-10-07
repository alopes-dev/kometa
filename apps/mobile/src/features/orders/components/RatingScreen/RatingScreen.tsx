import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Button, StarRating } from '@/components/design-system/atoms';
import { continuousCorners, ordersTextStyle } from '@/theme';
import { content } from '../../content';
import { ScreenHeader } from '../ScreenHeader';

/**
 * Board 11's rating.
 *
 * Simple, optional and human — the board's words. There is deliberately no
 * tip control, no required comment and no separate courier rating: "Não força
 * gorjeta, texto ou avaliação do courier separada." Each absence is a design
 * decision, not an omission.
 */

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Body = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing[16]}px;
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
  padding-top: ${({ theme }) => theme.spacing[16]}px;
`;

const Title = styled.Text`
  ${ordersTextStyle('statusTitle')}
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const Subtitle = styled.Text`
  ${ordersTextStyle('rowMeta')}
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const Tags = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const Tag = styled.View<{ selected: boolean }>`
  min-height: ${({ theme }) => theme.orders.metrics.touchTarget}px;
  justify-content: center;
  padding-horizontal: ${({ theme }) => theme.spacing[12]}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  ${continuousCorners}
  border-width: 1px;
  border-color: ${({ theme, selected }) =>
    selected ? theme.colors.brand.base : theme.colors.border.subtle};
  background-color: ${({ theme, selected }) =>
    selected ? theme.colors.status.success.bg : theme.colors.background.secondary};
`;

const TagLabel = styled.Text<{ selected: boolean }>`
  ${ordersTextStyle('chip')}
  color: ${({ theme, selected }) =>
    selected ? theme.colors.status.success.fg : theme.colors.text.primary};
`;

const Comment = styled.TextInput`
  align-self: stretch;
  min-height: 96px;
  padding: ${({ theme }) => theme.spacing[12]}px;
  border-radius: ${({ theme }) => theme.orders.metrics.cardRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align-vertical: top;
`;

const Actions = styled.View<{ bottomInset: number }>`
  padding-horizontal: ${({ theme }) => theme.orders.metrics.bodyPaddingH}px;
  padding-bottom: ${({ theme, bottomInset }) => theme.spacing[16] + bottomInset}px;
`;

export type RatingSubmission = {
  stars: number;
  tags: string[];
  comment: string;
};

export type RatingScreenProps = {
  merchantName: string;
  courierName: string;
  onBack: () => void;
  onSubmit: (submission: RatingSubmission) => void;
};

export function RatingScreen({ merchantName, courierName, onBack, onSubmit }: RatingScreenProps) {
  const insets = useSafeAreaInsets();
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const toggle = (tag: string) =>
    setTags((current) =>
      current.includes(tag) ? current.filter((entry) => entry !== tag) : [...current, tag]
    );

  return (
    <Screen>
      <ScreenHeader title={content.ratingTitle} onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Body>
          <Title>{content.ratingHeadline}</Title>
          <Subtitle>{content.ratingBody(merchantName, courierName)}</Subtitle>

          <StarRating value={stars} onChange={setStars} />

          <Tags>
            {content.ratingTags.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggle(tag)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Tag selected={selected}>
                    <TagLabel selected={selected}>{tag}</TagLabel>
                  </Tag>
                </Pressable>
              );
            })}
          </Tags>

          {/* Optional, and labelled as optional — board 11 does not force text. */}
          <Comment
            value={comment}
            onChangeText={setComment}
            placeholder={content.ratingPlaceholder}
            multiline
          />
        </Body>
      </ScrollView>

      <Actions bottomInset={insets.bottom}>
        <Button
          variant="primary"
          size="lg"
          shape="pill"
          onPress={() => onSubmit({ stars, tags, comment })}
        >
          {content.sendRating}
        </Button>
      </Actions>
    </Screen>
  );
}
