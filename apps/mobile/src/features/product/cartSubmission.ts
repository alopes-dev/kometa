/**
 * The seam where adding to the cart stops being local.
 *
 * `apps/api` is an empty slot, so nothing here talks to a server yet. It
 * exists anyway because the board specifies states — "A adicionar…", a
 * recoverable error, a price that moved, no connection — that cannot be
 * built against a function which always succeeds instantly. Modelling the
 * call now means those states are real and testable today, and replacing
 * the mock later is a change to this file alone.
 */

export type SubmissionRequest = {
  /**
   * Stable across every retry of one attempt. It is what makes a retry safe:
   * the board requires that a second press after a timeout cannot add the
   * product twice.
   */
  key: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type SubmissionFailure =
  /** The request did not go through. Nothing was created. */
  | { reason: 'failed' }
  /** No connection. The configuration is kept; the action is paused. */
  | { reason: 'offline' }
  /** The total could not be worked out. Choices are preserved. */
  | { reason: 'pricing' }
  /** The product's base price moved; the customer must confirm the new one. */
  | { reason: 'priceChanged'; newPrice: number };

export type SubmissionResult = { ok: true } | ({ ok: false } & SubmissionFailure);

export type CartSubmitter = (request: SubmissionRequest) => Promise<SubmissionResult>;

export type CartSubmitterOptions = {
  /** How long the round trip takes. Zero in tests, a realistic wait in the app. */
  latencyMs?: number;
  /** When set, every fresh key fails this way instead of succeeding. */
  failWith?: SubmissionFailure;
  /** Called once per request that is actually submitted, never on a replay. */
  onSubmit?: (request: SubmissionRequest) => void;
};

const DEFAULT_LATENCY_MS = 600;

export function createCartSubmitter(options: CartSubmitterOptions = {}): CartSubmitter {
  const { latencyMs = DEFAULT_LATENCY_MS, failWith, onSubmit } = options;

  // Keys that already succeeded. A retry of one of these is answered from
  // here rather than sent again — the difference between "add it once" and
  // "add it once per press of a button the customer could not see working".
  const settled = new Set<string>();

  return async (request) => {
    if (settled.has(request.key)) return { ok: true };

    onSubmit?.(request);
    if (latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
    }

    // A failure records nothing, so the same key may be tried again.
    if (failWith) return { ok: false, ...failWith };

    settled.add(request.key);
    return { ok: true };
  };
}

/** What the app uses. Tests build their own with `createCartSubmitter`. */
export const submitToCart: CartSubmitter = createCartSubmitter();
