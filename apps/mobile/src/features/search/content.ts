/**
 * Every string the Search screens render, transcribed from the board
 * (page 48:22336, "06 — Search": frames 48:20081 "Pesquisa — foco" and
 * 48:20156 "Resultados — hambúrguer").
 *
 * Same contract as `features/home/content.ts` and
 * `features/discovery/content.ts`: the board is the source of truth for
 * wording, and a reviewer comparing the two should not have to open ten
 * components to do it.
 */
export const search = {
  /** The field, node 48:20092 — the same question Discovery's entry asks. */
  placeholder: 'O que estás à procura?',
  back: 'Voltar',
  /** The x-circle inside the field, node 48:21786. */
  clearQuery: 'Limpar pesquisa',
  /**
   * The field on the results screen (node 48:20173), which holds the query
   * rather than taking one: tapping it goes back to the screen that does.
   */
  editQuery: (query: string) => `Pesquisa: ${query}. Toca para editar.`,

  /** "Pesquisas recentes", nodes 48:20097 and 48:20098. */
  recents: 'Pesquisas recentes',
  clearRecents: 'Limpar',
  /** The x at the end of a recent row, node 48:21792. */
  removeRecent: (term: string) => `Remover ${term} das pesquisas recentes`,

  /** Node 48:20117. */
  popular: 'Populares',
  /** Node 48:20135. */
  suggestedCategories: 'Categorias sugeridas',

  /**
   * Node 48:20154 — the board's own note on how the screen behaves, drawn as
   * a card inside the content frame. `SEARCH_DEBOUNCE_MS` and the return key
   * are what make it true rather than decorative.
   */
  keyboardNote: 'Ao escrever, sugestões aparecem em 150 ms · Enter abre resultados',

  /** Results header, node 48:20167. */
  resultsTitle: 'Resultados',
  notifications: 'Notificações',
  unreadNotifications: 'Tens notificações por ler',

  /**
   * Node 48:20195. The board draws "18 resultados" over three cards, which is
   * the placeholder a design file uses before real data exists; the count is
   * derived from what the feed actually renders, so the heading can never
   * promise rows that are not there.
   */
  resultCount: (count: number) => `${count} ${count === 1 ? 'resultado' : 'resultados'}`,

  /**
   * The empty states, frame 62:290 — "04 — Search Empty States", the board
   * the results frame leaves out because every query it draws has results.
   *
   * Its body reads "Tente «tacos», altere a localização ou remova alguns
   * filtros. Há 18 restaurantes abertos perto de Talatona." — three ways out
   * and a count drawn against data this app does not hold: no opening hours,
   * no locality for the customer, and no term to suggest. What carries over
   * is the shape rather than the sentence: name what emptied the screen, and
   * offer the one thing that undoes it.
   *
   * Written in the second person the rest of this file uses. The board writes
   * "Tente" and "Pesquise"; two formal screens inside an app that says "Tens
   * notificações por ler" would read as someone else's copy.
   */

  /** Node 62:338. */
  noResultsTitle: 'Não encontrámos resultados',
  /** Node 62:339, where the query itself is what found nothing. */
  noResultsBody: 'Tenta outro termo ou procura por uma categoria.',
  /**
   * The same line where the query did match and the filters hid it — the
   * board's "Há 18 restaurantes...", counted off what this screen would show
   * with the filters lifted rather than off a number no data backs.
   */
  noResultsFiltered: (count: number) =>
    `Sem filtros, esta pesquisa dá ${count} ${count === 1 ? 'resultado' : 'resultados'}.`,
  /** Node 62:341. */
  clearFilters: 'Limpar filtros',
  /** The way out when no filter is hiding anything: change the words. */
  editSearch: 'Editar pesquisa',

  /** "Busca vazia" (nodes 62:317, 62:318) — the screen with nothing to offer yet. */
  startTitle: 'O que vais encontrar hoje?',
  startBody: 'Pesquisa por pratos, restaurantes, farmácias, produtos ou ofertas perto de ti.',

  /** Scope tabs, nodes 48:20178, 48:20180, 48:20182, 48:20184. */
  scopes: {
    all: 'Tudo',
    restaurants: 'Restaurantes',
    products: 'Produtos',
    offers: 'Ofertas',
  },

  /** Quick filters, nodes 48:20188, 48:20190, 48:20192. */
  filters: 'Filtros',
  fastest: 'Mais rápidos',
  /** Written with a point, as the board writes it — ratings elsewhere use a comma. */
  highlyRated: '4.5+',
} as const;
