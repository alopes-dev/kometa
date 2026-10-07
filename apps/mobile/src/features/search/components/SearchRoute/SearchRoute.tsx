import { useLocalSearchParams, useRouter } from 'expo-router';
import { SearchScreen } from '../SearchScreen';

export type SearchRouteProps = {
  /**
   * Opens the results, in the stack the route belongs to. Passed in rather
   * than built here: Home and Discovery each push their own copy of these two
   * screens, so that searching from a tab stays inside it instead of throwing
   * the customer into another one.
   */
  onSubmit: (query: string) => void;
};

/**
 * Everything the focused search screen needs from the router, in one place —
 * both stacks mount this, so the behaviour cannot drift between them.
 */
export function SearchRoute({ onSubmit }: SearchRouteProps) {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();

  return <SearchScreen initialQuery={q ?? ''} onBack={() => router.back()} onSubmit={onSubmit} />;
}
