import { useMemo, useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Icon, Text } from '@/components/design-system/atoms';
import { RestaurantCard } from '@/features/home/components/RestaurantCard';
import { RestaurantListFilterBar } from '@/features/home/components/RestaurantListFilterBar';
import { getRestaurants } from '@/features/home/data';
import { applyRestaurantSort, filterRestaurants, type RestaurantSort } from '@/features/home/selectors';
import type { Restaurant } from '@/features/home/types';

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Header = styled.View<{ topInset: number }>`
  gap: ${({ theme }) => theme.spacing[4]}px;
  padding-top: ${({ theme, topInset }) => theme.spacing[16] + topInset}px;
  padding-horizontal: ${({ theme }) => theme.spacing[16]}px;
  padding-bottom: ${({ theme }) => theme.spacing[8]}px;
`;

const BackButton = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface.primary};
  margin-bottom: ${({ theme }) => theme.spacing[8]}px;
`;

const ListHeader = styled.View`
  gap: ${({ theme }) => theme.spacing[16]}px;
  padding-bottom: ${({ theme }) => theme.spacing[16]}px;
`;

const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[32]}px;
`;

export default function RestaurantListing() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category, q } = useLocalSearchParams<{ category?: string; q?: string }>();
  const [sort, setSort] = useState<RestaurantSort | null>(null);

  const baseResults = useMemo(
    () => filterRestaurants(getRestaurants(), { query: q ?? '', category: category ?? null }),
    [category, q]
  );
  const results = useMemo(() => applyRestaurantSort(baseResults, sort), [baseResults, sort]);

  return (
    <Screen>
      <Header topInset={insets.top}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
          <BackButton>
            <Icon name="chevron-back" sf="chevron.left" size={18} color="primary" />
          </BackButton>
        </Pressable>
        <Text variant="bodyStrong">{category ?? 'Resultados'}</Text>
        <Text variant="caption" color="secondary">
          {results.length} {results.length === 1 ? 'restaurante encontrado' : 'restaurantes encontrados'}
        </Text>
      </Header>
      <FlatList
        data={results}
        keyExtractor={(item: Restaurant) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}
        ListHeaderComponent={
          <ListHeader>
            <RestaurantListFilterBar selected={sort} onSelect={setSort} />
          </ListHeader>
        }
        renderItem={({ item, index }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
            index={index}
            entranceDelayMs={80}
          />
        )}
        ListEmptyComponent={
          <EmptyState>
            <Text color="secondary">Nenhum restaurante encontrado</Text>
          </EmptyState>
        }
      />
    </Screen>
  );
}
