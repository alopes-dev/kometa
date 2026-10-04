import { createCartSubmitter, type SubmissionRequest } from './cartSubmission';

const request: SubmissionRequest = { key: 'k1', productId: 'r4-1', quantity: 1, unitPrice: 3000 };

describe('createCartSubmitter', () => {
  it('succeeds by default', async () => {
    const submit = createCartSubmitter({ latencyMs: 0 });
    await expect(submit(request)).resolves.toEqual({ ok: true });
  });

  it('reports the failure the caller asked it to simulate', async () => {
    const submit = createCartSubmitter({ latencyMs: 0, failWith: { reason: 'failed' } });
    await expect(submit(request)).resolves.toEqual({ ok: false, reason: 'failed' });
  });

  it('reports a missing connection', async () => {
    const submit = createCartSubmitter({ latencyMs: 0, failWith: { reason: 'offline' } });
    await expect(submit(request)).resolves.toEqual({ ok: false, reason: 'offline' });
  });

  it('reports a price that moved under the customer', async () => {
    const submit = createCartSubmitter({
      latencyMs: 0,
      failWith: { reason: 'priceChanged', newPrice: 4800 },
    });
    await expect(submit(request)).resolves.toEqual({
      ok: false,
      reason: 'priceChanged',
      newPrice: 4800,
    });
  });

  /*
   * The board's rule: "Retry idempotente; impedir duplicação acidental."
   * A key that already succeeded must not be submitted a second time, or a
   * retry after a timeout adds the product twice.
   */
  it('answers a repeated key from its record instead of submitting again', async () => {
    let calls = 0;
    const submit = createCartSubmitter({
      latencyMs: 0,
      onSubmit: () => {
        calls += 1;
      },
    });
    await submit(request);
    await submit(request);
    expect(calls).toBe(1);
  });

  it('treats a different key as a different request', async () => {
    let calls = 0;
    const submit = createCartSubmitter({
      latencyMs: 0,
      onSubmit: () => {
        calls += 1;
      },
    });
    await submit(request);
    await submit({ ...request, key: 'k2' });
    expect(calls).toBe(2);
  });

  it('lets a failed key be retried, because nothing was recorded', async () => {
    let calls = 0;
    const submit = createCartSubmitter({
      latencyMs: 0,
      failWith: { reason: 'failed' },
      onSubmit: () => {
        calls += 1;
      },
    });
    await submit(request);
    await submit(request);
    expect(calls).toBe(2);
  });
});
