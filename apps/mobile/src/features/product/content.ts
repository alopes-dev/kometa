import { formatKwanza } from '../home/format';
import type { ModifierGroup, ModifierOption } from './types';

/**
 * Every string the product screen says, and the three derivations the board
 * fixes. Portuguese of Angola: short, direct, never punitive — board 07,
 * "Frases curtas, directas e sem tom punitivo".
 */
export const content = {
  notFound: 'Produto não encontrado',
  quantityLabel: 'Quantidade',
  limitReached: 'Limite atingido',
  noteLabel: 'Observação',
  noteHelper: 'Opcional · não substitui escolhas acima',
  notePlaceholder: 'Ex.: Sem cebola',
  unavailableBadge: 'Temporariamente indisponível',
  unavailableExplainer:
    'O produto continua visível para preservar contexto, preço e informação. Não prometemos uma hora de regresso.',
  ctaUnavailable: 'Indisponível',
  ctaAdded: 'Adicionado ✓',
  ctaAdding: 'A adicionar…',
  ctaRetry: 'Tentar novamente',

  /** Board 02, "Feedback · no contexto". Each says what survived the failure. */
  errorAddTitle: 'Não foi possível adicionar ao carrinho.',
  errorAddBody: 'Nada foi duplicado. Tente adicionar novamente.',
  errorPricingTitle: 'Não foi possível calcular o total.',
  errorPricingBody: 'As escolhas continuam aqui. Tente novamente.',
  offlineTitle: 'Sem conexão',
  priceChangedTitle: 'Produto actualizado',
  ctaNeedsChoices: 'Escolher opções',
  back: 'Voltar',
  share: 'Partilhar',
  close: 'Fechar',

  /**
   * The derivation table from the spec, in code — the single place the
   * radio-versus-checkbox wording is decided, so the subtitle can never
   * disagree with the control the card renders.
   */
  groupSubtitle(group: ModifierGroup): string {
    if (group.minSelections === 1 && group.maxSelections === 1) return 'Escolha 1 · obrigatório';
    if (group.maxSelections > 1) return `Escolha até ${group.maxSelections}`;
    return 'Opcional';
  },

  groupCounter(count: number, max: number): string {
    return `${count}/${max}`;
  },

  /** Deltas wear a plus; an absolute variation is simply its price. */
  optionCost(price: number, pricing: ModifierGroup['pricing']): string {
    return pricing === 'absolute' ? formatKwanza(price) : `+${formatKwanza(price)}`;
  },

  missingChoice(group: ModifierGroup): string {
    return `Falta escolher ${group.errorNoun}.`;
  },

  maxAvailable(max: number): string {
    return `Máximo disponível: ${max}`;
  },

  noteCounter(length: number, max: number): string {
    return `${length}/${max}`;
  },

  /** "Abacate, +600 Kz, Indisponível hoje" — name, cost, state, in that order. */
  optionAnnouncement(
    option: ModifierOption,
    pricing: ModifierGroup['pricing'],
    note?: string
  ): string {
    const cost = option.price > 0 ? `, ${content.optionCost(option.price, pricing)}` : '';
    return `${option.label}${cost}${note ? `, ${note}` : ''}`;
  },

  /**
   * Board 07: the group is announced before its options — "Escolha o pão,
   * obrigatório, 0 de 1 seleccionado".
   */
  groupAnnouncement(group: ModifierGroup, count: number): string {
    const requirement = group.minSelections > 0 ? 'obrigatório' : 'opcional';
    return `${group.label}, ${requirement}, ${count} de ${group.maxSelections} seleccionado`;
  },

  addToCart(total: number): string {
    return `Adicionar ao carrinho · ${formatKwanza(total)}`;
  },

  /** The sheet's label — board 06. Less room, so fewer words for one action. */
  addShort(total: number): string {
    return `Adicionar · ${formatKwanza(total)}`;
  },

  /** The CTA announces its total, not just its verb. */
  addToCartAnnouncement(total: number): string {
    return `Adicionar ao carrinho, total ${formatKwanza(total)}`;
  },

  /** `1 item · 6.200 Kz · Ver carrinho` — board 03 A·03 and board 04 B·03. */
  cartBar(count: number, total: number): string {
    return `${count} ${count === 1 ? 'item' : 'itens'} · ${formatKwanza(total)} · Ver carrinho`;
  },

  cartBarAnnouncement(count: number, total: number): string {
    return `Ver carrinho, ${count} ${count === 1 ? 'item' : 'itens'}, ${formatKwanza(total)}`;
  },

  /** "Bacon, Extra queijo e Sesame estão preservados." — board 04, offline. */
  offlineBody(labels: string[]): string {
    if (labels.length === 0) return 'A tua configuração está preservada.';
    const head = labels.slice(0, -1).join(', ');
    const tail = labels[labels.length - 1];
    const list = head ? `${head} e ${tail}` : tail;
    return `${list} ${labels.length === 1 ? 'está preservado' : 'estão preservados'}.`;
  },

  /** "Preço base alterado de 4.500 Kz para 4.800 Kz." — board 04. */
  priceChangedBody(from: number, to: number): string {
    return `Preço base alterado de ${formatKwanza(from)} para ${formatKwanza(to)}.`;
  },

  savings(amount: number): string {
    return `Poupa ${formatKwanza(amount)}. O desconto já está incluído no total.`;
  },

  fromPrice(value: number): string {
    return `A partir de ${formatKwanza(value)}`;
  },

  variantPrice(label: string, value: number): string {
    return `${label} · ${formatKwanza(value)}`;
  },
} as const;
