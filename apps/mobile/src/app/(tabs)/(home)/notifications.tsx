import { useMemo } from 'react';
import { Pressable, SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Icon, Text } from '@/components/design-system/atoms';
import { NotificationRow } from '@/features/notifications/components/NotificationRow';
import { mockNotifications } from '@/features/notifications/mockData';
import { groupNotificationsBySection } from '@/features/notifications/selectors';
import type { AppNotification } from '@/features/notifications/types';

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const Header = styled.View<{ topInset: number }>`
  padding-top: ${({ theme, topInset }) => theme.spacing[16] + topInset}px;
  padding-horizontal: ${({ theme }) => theme.spacing[16]}px;
  padding-bottom: ${({ theme }) => theme.spacing[8]}px;
  gap: ${({ theme }) => theme.spacing[8]}px;
`;

const BackButton = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface.primary};
`;

const SectionTitle = styled.Text`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding-top: ${({ theme }) => theme.spacing[16]}px;
  padding-bottom: ${({ theme }) => theme.spacing[4]}px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.subtle};
`;

const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[16]}px;
  padding: ${({ theme }) => theme.spacing[32]}px;
`;

export default function Notifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sections = useMemo(() => groupNotificationsBySection(mockNotifications), []);

  return (
    <Screen>
      <SectionList
        sections={sections}
        keyExtractor={(item: AppNotification) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <Header topInset={insets.top}>
            <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={8}>
              <BackButton>
                <Icon name="chevron-back" sf="chevron.left" size={18} color="primary" />
              </BackButton>
            </Pressable>
            <Text variant="bodyStrong">Notificações</Text>
          </Header>
        }
        renderSectionHeader={({ section }) => <SectionTitle>{section.title}</SectionTitle>}
        renderItem={({ item, index }) => (
          <>
            {index > 0 ? <Divider /> : null}
            <NotificationRow notification={item} />
          </>
        )}
        ListEmptyComponent={
          <EmptyState>
            <Icon name="notifications-off-outline" sf="bell.slash" size={32} color="secondary" />
            <Text color="secondary">Sem notificações por agora</Text>
          </EmptyState>
        }
      />
    </Screen>
  );
}
