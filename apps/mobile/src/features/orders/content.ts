import { formatKwanza } from '../home/format';
import { etaBand, formatEta } from './eta';
import { stageCopy } from './stages';
import type { OrderRecord } from './store';
import type { EtaBand } from './types';

/**
 * Every string the orders and tracking path says.
 *
 * Portuguese of Angola: short, direct, never punitive. Board 13 asks that a
 * failure state "o que aconteceu, o impacto e a próxima ação", which is why
 * most failures here are a pair (title, body) rather than one sentence.
 *
 * Derivations live beside the strings they build so a figure and its label can
 * never disagree: `etaLine` is the only place "Chega em" is phrased, and the
 * accessible label reads the same band through `etaSpoken`.
 */

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export const content = {
  // ─── Navigation (boards 04–15) ───────────────────────────────────────────
  ordersTitle: 'Pedidos',
  detailsTitle: 'Detalhes do pedido',
  trackingTitle: 'Acompanhar pedido',
  timelineTitle: 'Progresso do pedido',
  mapTitle: 'Mapa',
  deliveredTitle: 'Pedido concluído',
  ratingTitle: 'Avaliar pedido',
  cancelledTitle: 'Pedido cancelado',
  rejectedTitle: 'Pedido não aceite',
  receiptTitle: 'Recibo',

  // ─── Sections (boards 05, 06) ────────────────────────────────────────────
  sectionActive: 'Em curso',
  sectionHistory: 'Anteriores',
  sectionItems: 'Itens',
  sectionDelivery: 'ENTREGA',

  // ─── Actions ─────────────────────────────────────────────────────────────
  track: 'Acompanhar pedido',
  keepExploring: 'Continuar a explorar',
  receipt: 'Recibo',
  help: 'Ajuda',
  reorder: 'Repetir',
  message: 'Mensagem',
  call: 'Ligar',
  downloadReceipt: 'Descarregar recibo',
  retry: 'Tentar novamente',
  reviewCart: 'Rever carrinho',
  exploreRestaurants: 'Explorar restaurantes',
  confirmCancel: 'Confirmar cancelamento',
  keepOrder: 'Manter pedido',
  cancelOrder: 'Cancelar pedido',
  backToOrders: 'Voltar aos pedidos',
  needHelp: 'Preciso de ajuda',
  rate: 'Avaliar pedido',
  sendRating: 'Enviar avaliação',
  copy: 'Copiar',
  close: 'Fechar',

  // ─── Summary lines (board 06) ────────────────────────────────────────────
  subtotal: 'Subtotal',
  deliveryFee: 'Entrega',
  discount: 'Desconto',
  total: 'Total',
  totalCharged: 'Total cobrado',
  method: 'Método',
  orderLabel: 'Pedido',
  merchantLabel: 'Restaurante',
  estimatedDelivery: 'Entrega estimada',

  // ─── Confirmation (board 04) ─────────────────────────────────────────────
  confirmedTitle: 'Pedido confirmado!',
  /** `A Burger House já recebeu o teu pedido.` */
  confirmedBody: (merchant: string) => `A ${merchant} já recebeu o teu pedido.`,

  // ─── Tracking (boards 07, 08) ────────────────────────────────────────────
  onTheWay: 'O teu pedido está a caminho',
  stillOnTheWay: 'O teu pedido continua a caminho',
  wasOnTheWay: 'O teu pedido estava a caminho',
  updatedNow: 'Atualizado agora',
  lastUpdatedAt: (clock: string) => `Última atualização às ${clock}`,
  lastEta: (band: EtaBand) => `Último ETA: ${formatEta(band)}`,

  delayTitle: 'A entrega está a demorar um pouco mais',
  delayBody: (window: string) => `Novo intervalo: ${window}. Avisamos se houver nova alteração.`,

  mapUnavailableTitle: 'Mapa temporariamente indisponível',
  mapUnavailableBody: 'O pedido continua a caminho. Consulta o estado e o ETA abaixo.',
  locationOffTitle: 'Localização desativada',
  locationOffBody: 'Podes acompanhar o pedido sem partilhar a tua localização.',
  offlineTitle: 'Sem conexão',
  offlineBody: (clock: string) => `A mostrar as últimas informações disponíveis · ${clock}`,

  // ─── Courier (board 09) ──────────────────────────────────────────────────
  courierSearchingTitle: 'Courier ainda não atribuído',
  courierSearchingBody: 'Estamos a encontrar a melhor pessoa para a entrega.',
  courierReassignedTitle: 'Courier reatribuído',
  courierReassignedBody: (name: string, band: EtaBand) =>
    `${name} assume a entrega. O ETA foi recalculado para ${formatEta(band)}.`,
  courierDone: (clock: string) => `Entrega concluída · ${clock}`,
  chatUnavailableTitle: 'Mensagem indisponível',
  chatUnavailableBody: 'Podes ligar ou tentar novamente em instantes.',
  chatClosedTitle: 'Chat encerrado',
  chatClosedBody: 'A conversa fica visível no histórico do pedido.',

  // ─── Delivery and rating (board 11) ──────────────────────────────────────
  deliveredHeadline: 'Pedido entregue',
  deliveredBody: 'Esperamos que aproveites!',
  deliveredChip: (clock: string) => `Entregue às ${clock}`,
  ratingHeadline: 'Como correu o teu pedido?',
  ratingBody: (merchant: string, courier: string) =>
    `O teu feedback ajuda a ${merchant} e o ${courier}.`,
  ratingTags: ['Chegou quente', 'Entrega cuidadosa', 'Muito saboroso', 'Bom atendimento'],
  ratingPlaceholder: 'Queres acrescentar algo? (opcional)',

  // ─── Cancellation (board 14) ─────────────────────────────────────────────
  cancelPrompt: 'Cancelar pedido?',
  cancelBody: 'Diz-nos o motivo. Confirmamos qualquer impacto antes de cancelar.',
  cancelReasons: ['Enganei-me no pedido', 'Endereço incorreto', 'Tempo de espera', 'Outro motivo'],
  cancelledHeadline: 'O pedido foi cancelado',
  refundChip: 'Estorno iniciado',
  /** `O estorno de 12.400 Kz pode demorar 3–5 dias úteis, conforme o banco.` */
  refundBody: (total: number) =>
    `O estorno de ${formatKwanza(total)} pode demorar 3–5 dias úteis, conforme o banco.`,
  /** When the order was cancelled before its payment ever settled. */
  cancelledNoChargeBody: 'Não houve cobrança. Nada será debitado do teu método de pagamento.',

  // ─── Rejection (board 13) ────────────────────────────────────────────────
  rejectedHeadline: (merchant: string) => `A ${merchant} não conseguiu aceitar o pedido`,
  rejectedBody: 'Não houve cobrança. Podes rever o carrinho ou escolher outro restaurante.',
  noChargeChip: 'Sem cobrança',

  // ─── Empty state (board 05) ──────────────────────────────────────────────
  emptyTitle: 'Ainda não tens pedidos',
  emptyBody: 'Quando fizeres um pedido, ele aparece aqui.',

  // ─── Derivations ─────────────────────────────────────────────────────────

  /** `2 itens` / `1 item` — board 05 changes the noun, not only the number. */
  itemCount: (count: number) => `${count} ${count === 1 ? 'item' : 'itens'}`,

  /**
   * `Hoje · 2 itens` / `28 set · 3 itens` — a history row's meta.
   *
   * Compares calendar days rather than elapsed time: an order placed four
   * minutes after midnight is still today, which subtracting milliseconds
   * would get wrong.
   */
  historyMeta: (placedAt: number, count: number, now: number = Date.now()) =>
    `${dayLabel(placedAt, now)} · ${content.itemCount(count)}`,

  /** `Chega em ~12 min`, or `Entregue às 19:18` once it has landed. */
  etaLine: (band: EtaBand) => {
    if (band.kind === 'none') return '';
    if (band.kind === 'time') return `Entregue às ${formatEta(band)}`;
    // "Chega em Agora" is not a sentence: arrival is stated, not prefixed.
    if (band.kind === 'now') return 'O courier chegou';
    return `Chega em ${formatEta(band)}`;
  },

  /**
   * Board 16, AX3. A screen reader must not have to pronounce `~` or `min`,
   * so the same band is spelled out: `Chega em aproximadamente 12 minutos`.
   */
  etaSpoken: (band: EtaBand) => {
    switch (band.kind) {
      case 'approx':
        return `Chega em aproximadamente ${band.minutes} ${minuteWord(band.minutes)}`;
      case 'range':
        return `Chega em ${band.min} a ${band.max} ${minuteWord(band.max)}`;
      case 'now':
        return 'O courier chegou';
      case 'time':
        return `Entregue às ${formatEta(band)}`;
      case 'none':
        return '';
    }
  },

  /**
   * Board 16's semantic label for the courier card, verbatim:
   * «João Manuel, avaliação 4 vírgula 9, Toyota Yaris, matrícula ABC-12-34.»
   *
   * The rating is spelled with the Portuguese decimal comma read aloud, and
   * the plate is labelled — otherwise a screen reader announces a star glyph
   * and then spells `ABC-12-34` character by character with no context.
   */
  courierLabel: (courier: { name: string; rating: number; vehicle: string; plate: string }) =>
    `${courier.name}, avaliação ${String(courier.rating).replace('.', ' vírgula ')}, ` +
    `${courier.vehicle}, matrícula ${courier.plate}.`,

  /**
   * Board 16's semantic label for the Active Order Card, read as one
   * sentence: "Pedido CM-10482, Burger House, a caminho, chega em
   * aproximadamente 12 minutos. Botão acompanhar pedido."
   */
  activeOrderLabel: (order: OrderRecord, merchant: string) => {
    if (order.stage === null) {
      return `Pedido ${order.orderId}, ${merchant}. Botão acompanhar pedido.`;
    }
    // The band is derived here rather than passed in: the label and the ETA on
    // the card must be the same reading of the same stage, and a parameter is
    // an opportunity for a caller to hand over a different one.
    const deliveredAt = order.events.find((event) => event.stage === 'delivered')?.occurredAt;
    const spoken = content.etaSpoken(etaBand(order.stage, deliveredAt));
    const eta = spoken === '' ? '' : `, ${spoken.toLocaleLowerCase('pt')}`;
    const stage = stageCopy(order.stage).toLocaleLowerCase('pt');
    return `Pedido ${order.orderId}, ${merchant}, ${stage}${eta}. Botão acompanhar pedido.`;
  },
};

function minuteWord(count: number): string {
  return count === 1 ? 'minuto' : 'minutos';
}

/** `Hoje` / `Ontem` / `28 set`, by calendar day. */
function dayLabel(at: number, now: number): string {
  const days = calendarDaysBetween(at, now);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  const date = new Date(at);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

function calendarDaysBetween(at: number, now: number): number {
  const startOf = (value: number) => {
    const date = new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };
  return Math.round((startOf(now) - startOf(at)) / 86_400_000);
}
