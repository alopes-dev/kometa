import styled from 'styled-components/native';
import { checkoutTextStyle, continuousCorners } from '@/theme';
import { content } from '../../content';
import type { MinimumEvaluation } from '../../minimum';

const Card = styled.View`
  gap: ${({ theme }) => theme.checkout.metrics.progressGap}px;
  padding: ${({ theme }) => theme.checkout.metrics.progressPadding}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.progressRadius}px;
  ${continuousCorners}
  background-color: ${({ theme }) => theme.colors.status.warning.bg};
`;

const Heading = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const Title = styled.Text`
  ${checkoutTextStyle('progressTitle')}
  color: ${({ theme }) => theme.colors.text.warning};
`;

const Value = styled.Text`
  ${checkoutTextStyle('progressValue')}
  color: ${({ theme }) => theme.colors.text.warning};
`;

const Track = styled.View`
  height: ${({ theme }) => theme.checkout.metrics.progressTrackHeight}px;
  border-radius: ${({ theme }) => theme.checkout.metrics.progressTrackRadius}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.status.warning.fill};
  opacity: ${({ theme }) => theme.opacity[20]};
`;

const Fill = styled.View<{ ratio: number }>`
  width: ${({ ratio }) => Math.round(ratio * 100)}%;
  height: 100%;
  border-radius: ${({ theme }) => theme.checkout.metrics.progressTrackRadius}px;
  background-color: ${({ theme }) => theme.colors.text.warning};
`;

const Note = styled.Text`
  ${checkoutTextStyle('progressNote')}
  color: ${({ theme }) => theme.colors.text.warning};
`;

export type MinimumProgressProps = {
  evaluation: MinimumEvaluation;
  subtotal: number;
  merchantName: string;
};

/**
 * Board 08, "Regra transparente": the minimum is never hidden until the end,
 * the progress is monetary rather than a bare percentage, and the sentence
 * says whose rule it is.
 *
 * The track is painted in the warning ramp rather than the brand: this is a
 * block, and colouring a block with the colour of success is how a customer
 * ends up tapping a button that cannot fire.
 */
export function MinimumProgress({ evaluation, subtotal, merchantName }: MinimumProgressProps) {
  const label = content.minimumProgress(subtotal, evaluation.minimum);

  return (
    <Card
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${content.minimumTitle}. ${label}`}
      accessibilityValue={{
        min: 0,
        max: evaluation.minimum,
        now: Math.min(subtotal, evaluation.minimum),
      }}
    >
      <Heading>
        <Title>{content.minimumTitle}</Title>
        <Value>{label}</Value>
      </Heading>
      <Track>
        <Fill ratio={evaluation.ratio} />
      </Track>
      <Note>{content.minimumExplainer(merchantName, evaluation.minimum)}</Note>
    </Card>
  );
}
