import styled, { useTheme } from 'styled-components/native';
import { Icon } from '@/components/design-system/atoms';
import {
  Camera,
  LineLayer,
  MapView,
  PointAnnotation,
  ShapeSource,
  isMapboxAvailable,
} from '@/features/tracking/mapbox';
import {
  CUSTOMER_COORDINATE,
  RESTAURANT_COORDINATE,
  ROUTE_COORDINATES,
} from '@/features/tracking/mockData';
import { courierCoordinate } from '../../position';
import type { OrderStage } from '../../types';
import { MapFallback } from '../MapFallback';

/**
 * The map half of the tracking screen — board 08.
 *
 * Neutral cartography: one route line, two endpoints and the courier. No
 * speed, no compass, no dashboard. The board is explicit that this is not a
 * navigation app: "Sem estilo GPS."
 *
 * The marker's position comes from `courierCoordinate(stage)`, which takes no
 * clock — board 18 forbids inventing a position between updates, and a
 * function with nothing to interpolate against cannot.
 */

export type MapState = 'waiting' | 'assigned' | 'active' | 'completed' | 'unavailable';

const Marker = styled.View<{ kind: 'merchant' | 'customer' | 'courier' }>`
  width: ${({ kind }) => (kind === 'courier' ? 40 : 32)}px;
  height: ${({ kind }) => (kind === 'courier' ? 40 : 32)}px;
  border-radius: ${({ kind }) => (kind === 'courier' ? 20 : 16)}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, kind }) =>
    kind === 'merchant' ? theme.colors.background.primary : theme.colors.brand.base};
  border-width: ${({ kind }) => (kind === 'merchant' ? 2 : 0)}px;
  border-color: ${({ theme }) => theme.colors.brand.base};
`;

export type MapCanvasProps = {
  stage: OrderStage;
  state?: MapState;
  locationDenied?: boolean;
};

export function MapCanvas({ stage, state = 'active', locationDenied }: MapCanvasProps) {
  const theme = useTheme();

  // Either the board asked for the unavailable state, or this build has no
  // map at all. Both land on the same complete textual fallback.
  if (state === 'unavailable' || !isMapboxAvailable) {
    return <MapFallback reason="unavailable" locationDenied={locationDenied} />;
  }

  const courier = courierCoordinate(stage);
  const route = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: ROUTE_COORDINATES.map((point) => [point.longitude, point.latitude]),
    },
  };

  return (
    <MapView style={{ flex: 1 }}>
      <Camera centerCoordinate={[courier.longitude, courier.latitude]} zoomLevel={13.5} />

      <ShapeSource id="route" shape={route}>
        <LineLayer
          id="route-line"
          style={{
            lineColor: theme.colors.brand.base,
            lineWidth: 4,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </ShapeSource>

      <PointAnnotation
        id="merchant"
        coordinate={[RESTAURANT_COORDINATE.longitude, RESTAURANT_COORDINATE.latitude]}
      >
        <Marker kind="merchant">
          <Icon name="restaurant-outline" sf="fork.knife" size={14} color="brand" />
        </Marker>
      </PointAnnotation>

      <PointAnnotation
        id="customer"
        coordinate={[CUSTOMER_COORDINATE.longitude, CUSTOMER_COORDINATE.latitude]}
      >
        <Marker kind="customer">
          <Icon name="home" sf="house.fill" size={14} color="onBrand" />
        </Marker>
      </PointAnnotation>

      {state === 'waiting' ? null : (
        <PointAnnotation id="courier" coordinate={[courier.longitude, courier.latitude]}>
          <Marker kind="courier">
            <Icon name="bicycle-outline" sf="bicycle" size={18} color="onBrand" />
          </Marker>
        </PointAnnotation>
      )}
    </MapView>
  );
}
