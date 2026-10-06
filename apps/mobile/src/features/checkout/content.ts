import { formatKwanza } from '../home/format';

/**
 * Every string the cart and the checkout say.
 *
 * Portuguese of Angola: short, direct, never punitive — board 19 asks that an
 * error explain "o que aconteceu, o impacto e a próxima ação", which is why
 * most failures here are a pair (title, body) rather than a single sentence.
 *
 * Derivations live beside the strings they build so a figure and its label can
 * never disagree: `remainingToMinimum` is the only place "faltam X" is phrased,
 * and the CTA reads it too.
 */
export const content = {
  // ─── Navigation (boards 04–17) ───────────────────────────────────────────
  cartTitle: 'O teu carrinho',
  cartReviewTitle: 'Revê o carrinho',
  cartAttentionCaption: 'É necessária uma ação',
  cartActionRequiredCaption: 'Precisamos da tua atenção',
  editItemTitle: 'Editar item',
  promoTitle: 'Promoção',
  promoCaption: 'Aplica um código ao pedido',
  promoConditionsCaption: 'Condições legíveis',
  deliveryTitle: 'Entrega',
  deliveryCaption: 'Onde devemos entregar?',
  deliveryConfirmCaption: 'Confirma os dados',
  addressListTitle: 'Os teus endereços',
  newAddressTitle: 'Novo endereço',
  newAddressCaption: 'Preenche manualmente',
  instructionsTitle: 'Instruções',
  instructionsCaption: 'Ajuda o estafeta a encontrar-te',
  paymentTitle: 'Pagamento',
  paymentChooseCaption: 'Escolhe como pagar',
  paymentNoneCaption: 'Nenhum método selecionado',
  paymentLiveCaption: 'Disponibilidade em tempo real',
  reviewTitle: 'Rever pedido',
  reviewCaption: 'Confirma antes de pagar',
  processingTitle: 'A processar',
  processingCaption: 'Não feches esta janela',
  pendingTitle: 'Pagamento pendente',
  pendingCaption: 'A confirmar com o provedor',
  failedTitle: 'Pagamento falhou',
  failedCaption: 'O pedido ainda não foi criado',
  confirmedTitle: 'Pedido confirmado',
  resumeTitle: 'Continuar o pedido?',
  resumeCaption: 'Encontrámos um carrinho guardado',

  back: 'Voltar',
  edit: 'Editar',
  done: 'Concluir',
  add: 'Adicionar',

  // ─── Cart (boards 04–06) ─────────────────────────────────────────────────
  singleMerchantChip: '1 loja',
  editingOptions: 'A editar opções',
  updatingItem: 'A atualizar…',
  unavailableItem: 'Indisponível neste momento',
  promoRowTitle: 'Adicionar promoção',
  promoRowSubtitle: 'Insere um código promocional',

  quantityUpdatedTitle: 'Quantidade atualizada',
  quantityUpdatedBody: 'O total foi recalculado automaticamente.',

  itemUnavailableTitle: 'Um item ficou indisponível',
  seeSubstitutes: 'Ver substitutos',
  remove: 'Remover',
  removeAndContinue: 'Remover e continuar',
  keepInCart: 'Manter no carrinho',
  removeItemAction: 'Remover item',
  removeItemBody: 'Podes voltar ao menu e adicionar novamente mais tarde.',

  // ─── Empty cart (board 07) ───────────────────────────────────────────────
  emptyTitle: 'Ainda não há nada aqui',
  emptyBody: 'Descobre os favoritos de Talatona e cria o teu pedido.',
  emptyAction: 'Explorar restaurantes',

  // ─── Minimum order (board 08) ────────────────────────────────────────────
  minimumTitle: 'Pedido mínimo',
  checkoutBlockedTitle: 'Checkout bloqueado',

  // ─── Promotions (board 09) ───────────────────────────────────────────────
  promoFieldLabel: 'CÓDIGO PROMOCIONAL',
  promoPlaceholder: 'Ex.: COMETA1500',
  promoApply: 'Aplicar código',
  promoValidating: 'A verificar o código…',
  promoAppliedTitle: 'Código aplicado',
  promoInvalidFieldError: 'Este código não é válido.',
  promoInvalidTitle: 'Código inválido',
  promoInvalidBody: 'Confirma a escrita ou tenta outro código.',
  promoExpiredTitle: 'Código expirado',
  promoMinimumTitle: 'Mínimo não atingido',
  promoKeptNote: 'A mensagem mantém o código no campo para correção. O carrinho nunca é limpo.',
  promoUsageNote: '1 uso por cliente',

  freeDeliveryChip: 'Entrega grátis',
  dynamicDeliveryChip: 'Entrega dinâmica',
  dynamicDeliveryNote: 'Entrega ajustada por procura elevada. Vês sempre o preço antes de pagar.',
  priceUpdatedTitle: 'Preço atualizado',
  priceUpdatedBody:
    'A entrega é calculada para Talatona e pode mudar com a procura. Confirmamos antes do pagamento.',

  // ─── Delivery (boards 10–11) ─────────────────────────────────────────────
  useThisAddress: 'Usar este endereço',
  addNewAddress: 'Adicionar novo endereço',
  useCurrentLocation: 'Usar localização atual',
  useCurrentLocationSubtitle: 'Opcional · pedimos permissão primeiro',
  fillWithLocation: 'Preencher com localização atual',
  optional: 'Opcional',
  saveAddress: 'Guardar endereço',
  insideAreaTitle: 'Dentro da área de entrega',
  outsideAreaTitle: 'Fora da área de entrega',

  privacyTitle: 'Privacidade',
  privacyBody:
    'A localização ajuda a preencher o endereço; nunca é necessária para concluir manualmente.',
  addressFormNote:
    'Confirma a zona antes de guardares. A disponibilidade e a taxa de entrega são verificadas automaticamente.',

  addressNameLabel: 'NOME DO ENDEREÇO',
  addressZoneLabel: 'BAIRRO / ZONA',
  addressStreetLabel: 'RUA E NÚMERO',
  addressReferenceLabel: 'REFERÊNCIA',
  addressCityLabel: 'CIDADE',
  referenceLabel: 'REFERÊNCIA',

  instructionsLabel: 'INSTRUÇÕES DE ENTREGA',
  instructionsPlaceholder: 'Ex.: Ligar ao chegar. Portão castanho.',
  instructionSuggestions: ['Ligar ao chegar', 'Deixar na portaria', 'Não tocar à campainha'],
  contactLabel: 'CONTACTO',
  contactPlaceholder: '+244 900 000 000',
  contactPrivacyNote: 'Usado apenas para coordenar esta entrega.',
  etaTitle: 'Entrega estimada',
  etaBody: '25–35 min após confirmação do pedido.',
  saveAndContinue: 'Guardar e continuar',

  // ─── Payment (board 12) ──────────────────────────────────────────────────
  paymentMissingTitle: 'Falta o método de pagamento',
  paymentMissingBody: 'Seleciona uma opção para continuar.',
  paymentUnavailableTitle: 'Pagamentos digitais indisponíveis',
  paymentUnavailableBody: 'Podes continuar com numerário ou tentar novamente.',
  paymentTemporarilyUnavailable: 'Temporariamente indisponível',
  singleMethodTitle: 'Um método por pedido',
  singleMethodBody: 'O MVP não inclui carteira, crédito, BNPL ou pagamento dividido.',
  digitalConfirmNote: 'Os métodos digitais mostram confirmação antes de criarem o pedido.',
  retry: 'Tentar novamente',
  continueToReview: 'Continuar para revisão',
  continueWithCash: 'Continuar com numerário',

  // ─── Review and checkout states (boards 13–14) ───────────────────────────
  contactRow: 'Contacto',
  instructionsRow: 'Instruções',
  paymentRow: 'Pagamento',

  ctaSelectPayment: 'Seleciona o pagamento',
  ctaAddAddress: 'Adiciona um endereço',
  ctaProcessing: 'A processar pagamento…',
  ctaConfirmed: 'Pagamento confirmado',
  ctaLoadingTotal: 'A carregar total…',

  processingHeadline: 'Estamos a confirmar o pagamento',
  processingBody:
    'Normalmente demora apenas alguns segundos. Não voltes atrás nem repitas o pagamento.',

  // ─── Errors (board 15) ───────────────────────────────────────────────────
  errorUnavailableTitle: 'Item indisponível',
  errorPriceChangedTitle: 'O preço mudou',
  errorClosedTitle: 'Restaurante fechado',
  errorOutOfAreaTitle: 'Fora da área de entrega',
  errorOfflineTitle: 'Sem ligação',
  errorOfflineBody: 'Não foi possível atualizar o carrinho. Verifica a internet.',
  errorOfflineNote: 'Os dados locais continuam disponíveis enquanto recuperamos a ligação.',
  acceptChanges: 'Aceitar alterações',

  sessionTitle: 'Sessão interrompida',
  resumeOrder: 'Continuar o teu pedido',
  startOver: 'Começar de novo',

  replaceCartTitle: 'Substituir o carrinho atual?',
  replaceCartAction: 'Substituir',

  // ─── Confirmation (board 17) ─────────────────────────────────────────────
  pendingHeadline: 'Estamos a confirmar',
  pendingBody: 'Não tentes pagar novamente. Atualizaremos este ecrã assim que houver resposta.',
  pendingSafeTitle: 'Podes sair em segurança',
  pendingSafeBody: 'Enviaremos uma atualização quando o estado mudar.',
  orderRow: 'Pedido',

  failedHeadline: 'Não foi possível pagar',
  failedBody: 'Não debitámos o valor. Tenta novamente ou escolhe outro método.',
  failedMethodSubtitle: 'Método usado nesta tentativa',
  changePaymentMethod: 'Alterar método de pagamento',
  dataKeptTitle: 'Os teus dados estão guardados',
  dataKeptBody: 'Endereço, contacto, itens e promoção continuam intactos.',

  confirmedHeadline: 'Pedido confirmado',
  forecastRow: 'Previsão',
  deliveryRow: 'Entrega',
  totalRow: 'Total',
  trackOrder: 'Acompanhar pedido',

  // ─── Summary labels (board 03) ───────────────────────────────────────────
  subtotal: 'Subtotal',
  delivery: 'Entrega',
  discount: 'Desconto',
  total: 'Total',
  free: 'Grátis',

  // ─── Derivations ─────────────────────────────────────────────────────────

  /** `3 itens · Burger House` — the caption under the cart title. */
  cartCaption(count: number, merchantName: string): string {
    return `${count} ${count === 1 ? 'item' : 'itens'} · ${merchantName}`;
  },

  /** `3.800 / 5.000 Kz` — progress stated in money, never as a percentage. */
  minimumProgress(subtotal: number, minimum: number): string {
    return `${formatKwanza(subtotal).replace(' Kz', '')} / ${formatKwanza(minimum)}`;
  },

  /** The rule belongs to the merchant, and the sentence says whose it is. */
  minimumExplainer(merchantName: string, minimum: number): string {
    return `A ${merchantName} aceita pedidos a partir de ${formatKwanza(minimum)}.`;
  },

  /** The single phrasing of what is still missing — the CTA reads it too. */
  remainingToMinimum(remaining: number): string {
    return `Faltam ${formatKwanza(remaining)}`;
  },

  minimumBlockedBody(remaining: number): string {
    return `Adiciona mais ${formatKwanza(remaining)} para atingir o mínimo.`;
  },

  promoMinimumBody(remaining: number, code: string): string {
    return `Adiciona mais ${formatKwanza(remaining)} para usar ${code}.`;
  },

  promoAppliedBody(discount: number): string {
    return `Poupaste ${formatKwanza(discount)} neste pedido.`;
  },

  promoExpiredBody(endedOn: string): string {
    return `Esta promoção terminou a ${endedOn}.`;
  },

  /** `Pagar 12.400 Kz` — the action names its destination and its amount. */
  payAction(total: number): string {
    return `Pagar ${formatKwanza(total)}`;
  },

  continueToPayment(total: number): string {
    return `Continuar para pagamento · ${formatKwanza(total)}`;
  },

  continueWithTotal(total: number): string {
    return `Continuar · ${formatKwanza(total)}`;
  },

  itemUnavailableBody(itemName: string): string {
    return `${itemName} não pode ser incluída neste pedido.`;
  },

  itemRemovedBody(itemName: string): string {
    return `${itemName} foi removida do total.`;
  },

  priceChangedBody(itemName: string, from: number, to: number): string {
    return `${itemName} passou de ${formatKwanza(from)} para ${formatKwanza(to)}.`;
  },

  previousPrice(price: number): string {
    return `Preço anterior ${formatKwanza(price)}`;
  },

  closedBody(merchantName: string, reopensAt: string): string {
    return `${merchantName} volta a aceitar pedidos ${reopensAt}.`;
  },

  outOfAreaBody(zone: string, merchantName: string): string {
    return `Ainda não entregamos em ${zone} a partir da ${merchantName}.`;
  },

  removeItemTitle(itemName: string): string {
    return `Remover ${itemName}?`;
  },

  replaceCartBody(nextMerchant: string, currentMerchant: string): string {
    return `Só podes encomendar de um merchant por carrinho. Ao adicionar de ${nextMerchant}, removemos o pedido da ${currentMerchant}.`;
  },

  keepMerchant(merchantName: string): string {
    return `Manter ${merchantName}`;
  },

  sessionBody(itemCount: number, addressLabel: string, promoCode?: string | null): string {
    const parts = [
      `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`,
      `o endereço ${addressLabel}`,
    ];
    if (promoCode) parts.push(`o código ${promoCode}`);
    return `Guardámos ${parts.join(', ').replace(/, ([^,]*)$/, ' e $1')}.`;
  },

  confirmedBody(merchantName: string): string {
    return `A ${merchantName} recebeu o teu pedido e já está a preparar.`;
  },

  cashOnDeliveryBody(total: number): string {
    return `Prepara ${formatKwanza(total)} em numerário.`;
  },

  characterCount(length: number, max: number): string {
    return `${length}/${max} caracteres`;
  },

  reviewLine(quantity: number, name: string): string {
    return `${quantity}× ${name}`;
  },

  orderReference(orderId: string, total: number): string {
    return `${orderId} · ${formatKwanza(total)}`;
  },
} as const;
