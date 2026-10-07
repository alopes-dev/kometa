import { CUSTOMER_COORDINATE, RESTAURANT_COORDINATE } from '@/features/tracking/mockData';
import type { Coordinate } from '@/features/tracking/types';
import { interpolateCoordinate } from '@/features/tracking/geo';
import type { OrderStage } from './types';

/**
 * Where the courier's marker sits for a given stage.
 *
 * Board 18: "Nunca inventar posição entre atualizações." That rule is enforced
 * by the signature — this function takes a stage and no clock, so there is
 * nothing to interpolate against and the marker simply cannot drift between
 * updates. It moves when a stage lands, and at no other moment.
 *
 * With no backend there are no real courier coordinates, so each stage is
 * given a fixed point along the merchant-to-customer line. That is a
 * fixture, not a simulation of movement.
 */

/** How far along the route each stage places the courier. */
const PROGRESS: Record<OrderStage, number> = {
  pending: 0,
  confirmed: 0,
  preparing: 0,
  ready: 0,
  assigned: 0,
  'picked-up': 0.1,
  transit: 0.55,
  arriving: 0.9,
  arrived: 1,
  delivered: 1,
  cancelled: 0,
};

export function courierCoordinate(stage: OrderStage): Coordinate {
  return interpolateCoordinate(RESTAURANT_COORDINATE, CUSTOMER_COORDINATE, PROGRESS[stage]);
}
