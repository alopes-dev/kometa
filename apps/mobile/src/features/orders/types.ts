/**
 * The operational order lifecycle — Figma page 69:4724, board 18.
 *
 * Deliberately NOT `PaymentStatus` from `features/checkout/types.ts`, which is
 * what the payment provider says about one attempt. The two share the names
 * `pending`, `confirmed` and `cancelled` and mean different things by each:
 * board 15 requires a pending *payment* to be distinguishable from a pending
 * *kitchen*, so an order awaiting payment has no stage at all.
 */

/**
 * The eleven stages board 18's table fixes.
 *
 * `arrived` reconciles a discrepancy inside the Figma: board 18's table has
 * ten rows and steps from `arriving` straight to `delivered`, but board 07's
 * "Progressão operacional" list and flow C of board 17 both draw
 * **Courier chegou · Agora** between the two. Two boards draw it and only the
 * table omits it, so it is carried here. See the spec's
 * "Discrepâncias registadas".
 */
export type OrderStage =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'picked-up'
  | 'transit'
  | 'arriving'
  | 'arrived'
  | 'delivered'
  | 'cancelled';

/**
 * How much of the courier the customer may see — board 18's third column,
 * which board 09 draws as four distinct cards plus an absence.
 *
 * A union rather than a boolean because the board distinguishes "we are
 * looking for someone" from "here is who it is" from "here is how to reach
 * them": revealing identity before assignment would be a privacy leak, and
 * offering contact before pickup would be a promise the courier cannot keep.
 */
export type CourierVisibility = 'none' | 'searching' | 'identity' | 'contact' | 'closed';

/**
 * What board 18's ETA column says for a stage, before it meets a clock.
 *
 * `at-delivery` is the one entry that cannot be resolved from the stage alone
 * — board 18 writes "hora real" for `delivered`, which needs the timestamp the
 * delivery actually happened at. `eta.ts` turns this into an `EtaBand`.
 */
export type StageEta =
  | { kind: 'range'; min: number; max: number }
  | { kind: 'approx'; minutes: number }
  | { kind: 'now' }
  | { kind: 'at-delivery' }
  | { kind: 'none' };
