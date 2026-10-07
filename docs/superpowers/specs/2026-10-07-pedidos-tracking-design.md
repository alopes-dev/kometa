# Pedidos & Tracking — Design Spec

**Figma:** página `69:4724` (`ORDERS & TRACKING`), boards 01–18.
**Data:** 2026-10-07
**Antecessor:** `2026-10-06-carrinho-checkout-design.md` (termina no pagamento
confirmado; esta spec começa aí).

## O que a página decide

Dezoito boards que cobrem tudo o que acontece **depois** do pagamento: a
confirmação, a lista de pedidos, os detalhes, o tracking ao vivo, o mapa, o
courier, a timeline, a entrega, a avaliação, as notificações e as três famílias
de falha (erro, cancelamento, pagamento).

Board 07 resume a pergunta que a página responde: **onde está, o que acontece,
quando chega e o que posso fazer** — respondido de imediato, em qualquer estado,
incluindo sem rede e sem mapa.

A regra que atravessa a página inteira, escrita no board 13: **nunca apagar
contexto**. Pedido, merchant, último estado, timestamp e ajuda permanecem
disponíveis durante falhas. Um ecrã que não consegue actualizar mostra o que
sabia, datado — nunca um vazio.

## Fluxos (board 17)

|     | Fluxo         | Percurso                                                | Resultado                           |
| --- | ------------- | ------------------------------------------------------- | ----------------------------------- |
| A   | Happy path    | Confirmação → Pedidos → Tracking → Entregue → Avaliação | Pedido concluído e avaliado         |
| B   | Pré-courier   | Confirmado → A preparar → Pronto → Atribuído            | Identidade do courier revelada      |
| C   | Live delivery | Recolhido → Em trânsito → A chegar → Courier chegou     | Chegada comunicada sem countdown    |
| D   | Excepções     | Atraso → Offline → Mapa indisponível → Último estado    | Estado preservado, nunca inventado  |
| E   | Cancelamento  | Detalhe → Sheet cancelar → Confirmar → Cancelado        | Impacto dito antes da acção         |
| F   | Pagamento     | Pendente → Tentar pagar → Falhou → Alterar método       | Sem cobrança duplicada              |
| G   | Reengagement  | Notificação → Deep link → Tracking → Ajuda / Reorder    | Destino explícito, contexto mantido |

As setas comunicam sequência visual, não interacções configuradas — o board
diz-o explicitamente, por isso nada aqui vira wiring de protótipo.

## Duas máquinas, não uma

`features/checkout/types.ts` já declara um `OrderStatus`
(`draft | submitting | pending | confirmed | failed | cancelled`). **Esse é o
ciclo do pagamento**, não o do pedido. O board 18 declara um segundo ciclo, o
**operacional**, e os dois partilham três nomes (`pending`, `confirmed`,
`cancelled`) com significados diferentes.

O board 15 obriga a separá-los: _«Enquanto o pagamento está pendente, o pedido
não aparece como Confirmado nem inicia ETA operacional.»_ Numa união única essa
regra é inexprimível — um pagamento pendente ficaria indistinguível de uma
cozinha pendente.

Decisão:

- `features/checkout` renomeia `OrderStatus` → **`PaymentStatus`**.
- `features/orders` declara **`OrderStage`**, as onze etapas do board 18.
- As duas juntam-se numa única regra, escrita num só sítio: um pagamento que
  atinge `confirmed` cria um pedido operacional na etapa `pending`. Nenhum
  outro ponto do código converte entre as duas.

## Máquina de estados (board 18)

A tabela do board 18 é canónica. Cada etapa fixa a copy humana, o que o courier
mostra e a banda de ETA.

| Etapa       | Copy humana         | Courier            | ETA           |
| ----------- | ------------------- | ------------------ | ------------- |
| `pending`   | A confirmar         | sem courier        | 25–35 min     |
| `confirmed` | Pedido confirmado   | a procurar         | 25–35 min     |
| `preparing` | A preparar          | não mostrar        | 20–30 min     |
| `ready`     | Pronto para recolha | a procurar         | 18–24 min     |
| `assigned`  | Courier atribuído   | identidade visível | 18–24 min     |
| `picked-up` | Pedido recolhido    | contacto activo    | 14–18 min     |
| `transit`   | A caminho           | contacto activo    | ~12 min       |
| `arriving`  | A chegar            | contacto activo    | 2–4 min       |
| `arrived`   | Courier chegou      | contacto activo    | Agora         |
| `delivered` | Pedido entregue     | contacto encerra   | hora real     |
| `cancelled` | Pedido cancelado    | oculto             | não aplicável |

A visibilidade do courier é uma união própria — `none | searching | identity |
contact | closed` — e não um booleano, porque o board 09 desenha quatro cartões
distintos para ela.

**`arrived` reconcilia uma discrepância interna do Figma.** A tabela do board 18
tem dez estados e salta de `arriving` para `delivered`. O board 07 (lista
«Progressão operacional») e o fluxo C do board 17 desenham ambos **Courier
chegou · Agora** entre os dois. Dois boards desenham-no e só a tabela o omite,
por isso entra como décima-primeira etapa. Registado em «Discrepâncias».

## Modelo de dados

```
Order      orderId · merchantId · stage · placedAt · totals · paymentStatus
Lines      productId · name · quantity · unitPrice
Delivery   addressLabel · zone · city · instructions
Courier    name · vehicle · plate · rating · visibility · chat
Timeline   event[] · occurredAt · stage
Receipt    method · maskedCard · totalCharged
Cancel     reason · refundState · refundWindow
```

## ETA (board 18)

Quatro regras, todas do board 18:

1. **Intervalos largos antes do pickup.** Até `picked-up` o ETA é uma banda
   (`25–35 min`); depois estreita (`~12 min`, `2–4 min`).
2. **Recalcular em mudanças operacionais** — não em intervalos de relógio.
3. **Arredondar.** Nunca minutos exactos derivados de segundos.
4. **Nunca countdown ao segundo.** O board 04 chama-lhe «ETA sem falsa precisão»:
   o intervalo só encurta com sinal operacional confiável.

A entrega mostra hora real (`19:18`), não duração.

## Tokens (board 02)

| Papel          | Board     | Mapeia para              |
| -------------- | --------- | ------------------------ |
| Primary        | `#1BAC4B` | `brand.base`             |
| Primary light  | `#E8F7ED` | `status.success.bg`      |
| Primary soft   | `#A4DDB7` | `brand` ramp (desactivo) |
| Background     | `#FFFFFF` | `background.primary`     |
| Background alt | `#FAFAFA` | `background.secondary`   |
| Text           | `#212121` | `text.primary`           |
| Secondary      | `#616161` | `text.secondary`         |
| Tertiary       | `#9E9E9E` | `text.muted`             |
| Border         | `#EEEEEE` | `border.subtle`          |
| Error          | `#F75555` | `status.error`           |
| Star           | `#FFC107` | token de estrela         |
| Map land       | `#F3F4F5` | `background.secondary`   |

**Cor não entra em `theme/orders.ts`**, a mesma omissão deliberada que
`product.ts` e `checkout.ts` fazem: o verde do board é mais claro que o
`brand.base` da app e dois verdes a poucos graus um do outro lêem-se como bug.

### Vocabulário medido (board 02 · 03)

Passos de tipo: Large Title 34/41 · Title 2 24/30 · Headline 17/22 SemiBold ·
Body (Dynamic Type) · Caption 12/16.

Ritmo: 8 · 12 · 16 · 24 pt, alvo mínimo 44 pt.

Detents do sheet (board 03): **Collapsed 92 pt · Medium 220 pt · Expanded
350 pt**. O mapa activo ocupa **45–60%** da área útil (board 08).

Breakpoints demonstrados: 390×844 · 393×852 · 430×932. O conteúdo preserva a
largura de leitura e aumenta o espaço vertical — **sem escalar tipografia**
(board 04).

## Estados por ecrã

### 04 Confirmação

Ícone de sucesso, título `Pedido confirmado!`, subtítulo `A {merchant} já
recebeu o teu pedido.`, e um cartão de factos: Pedido `#CM-10482` · Restaurante ·
Entrega estimada `Chega em 25–35 min` · Total.

Acções: **Acompanhar pedido** (primária) e **Continuar a explorar**.

A confirmação **não depende de animação** — ícone, título e número do pedido
formam uma redundância acessível.

### 05 Lista de pedidos

Duas secções, nesta ordem: **Em curso** e **Anteriores**. O cartão activo
precede sempre o histórico.

O **Active Order Card** é persistente na Home _e_ em Pedidos enquanto houver
fluxo activo: merchant, ETA (`Chega em ~12 min`), zona, total, chip de estado,
número do pedido e uma acção principal — `Acompanhar pedido`.

A Home **não expõe detalhes de itens**; apenas merchant, total, estado e ETA.

Linhas do histórico: merchant · data e contagem de itens · total · chip
(`Entregue` / `Cancelado`) · número. Um pedido reembolsado escreve
`Reembolsado` na linha de meta e mantém o chip `Cancelado`.

### 06 Detalhes do pedido

Cabeçalho `Detalhes do pedido` com acção `Ajuda`. Corpo: número do pedido +
chip de estado, merchant e zona, cartão **Itens**, linhas de valores
(Subtotal · Entrega · Desconto a verde · **Total**), cartão **ENTREGA** com
morada e instruções, e três acções: **Recibo · Ajuda · Repetir**.

O recibo é um ecrã próprio: método (`Visa •••• 2408`), total cobrado e
**Descarregar recibo**.

`Repetir` abre revisão do carrinho — disponibilidade, preços e endereço **nunca
são assumidos**.

### 07 Tracking

Mapa em cima, sheet em baixo. O sheet traz título de estado (`O teu pedido está
a caminho`), ETA a verde, `Atualizado agora`, e o `CourierCard`.

Variante de atraso: banner âmbar **A entrega está a demorar um pouco mais** com
o novo intervalo (`19:22–19:30`) e a promessa `Avisamos se houver nova
alteração`. O título passa a `O teu pedido continua a caminho` e o ETA à banda
nova.

### 08 Mapa

Cartografia neutra: ruas legíveis, POIs moderados, rota única, controlos
discretos. **Sem estilo GPS** — sem velocidade, sem bússola agressiva, sem
dashboard.

Cinco estados (board 03): `waiting · assigned · active · completed ·
unavailable`.

O fallback é completo, não degradado: **Mapa temporariamente indisponível · O
pedido continua a caminho. Consulta o estado e o ETA abaixo.** Estado, ETA e
acções continuam visíveis.

**Privacidade:** negar localização **nunca** bloqueia tracking. A posição do
cliente não é necessária para acompanhar uma entrega; o ecrã mostra o banner
`Localização desativada · Podes acompanhar o pedido sem partilhar a tua
localização.` e segue normalmente.

### 09 Courier

Cinco visibilidades, quatro cartões — `none` não desenha cartão nenhum:

| Visibilidade | Etapas                  | Cartão                                                                                |
| ------------ | ----------------------- | ------------------------------------------------------------------------------------- |
| `none`       | `pending` · `preparing` | nenhum — a secção do courier não existe no ecrã                                       |
| `searching`  | `confirmed` · `ready`   | `Courier ainda não atribuído` · «Estamos a encontrar a melhor pessoa para a entrega.» |
| `identity`   | `assigned`              | Nome · veículo · matrícula · `★ 4.9` · **Mensagem** e **Ligar**                       |
| `contact`    | `picked-up` → `arrived` | Igual, com meta `Está a chegar · {veículo}`                                           |
| `closed`     | `delivered`             | Nome · `Entrega concluída · 19:18` · `★ 4.9`, sem acções                              |

`cancelled` oculta a secção, como `none`.

Reatribuição mostra banner âmbar **Courier reatribuído** que explica o que
mudou, apresenta a nova pessoa e actualiza o ETA **sem dramatizar**.

O painel de chat entra como **três estados visuais** — `available` (bolhas de
conversa), `unavailable` (`Mensagem indisponível · Podes ligar ou tentar
novamente em instantes`), `closed` (`Chat encerrado · A conversa fica visível no
histórico do pedido`). **Sem compositor funcional**: não há backend nesta build,
e um campo de envio que não envia seria a única superfície falsa da feature.

### 10 Timeline

Ecrã `Progresso do pedido`: número do pedido, merchant e zona, e a lista de
eventos com hora (`Pedido confirmado 18:42` … `A caminho 19:02`).

Quatro estados de linha: **concluído** (ponto cheio) · **estado actual** (ponto
anelado) · **próximo passo** (ponto vazio, texto esbatido) · **falha ao
actualizar** (ponto vermelho).

Duas regras: `Entregue` permanece _upcoming_ e **sem hora** até existir
confirmação operacional — futuro sem promessa; e falhas de rede **não apagam
eventos já confirmados**.

Cor, texto, ícone e posição comunicam estado — nunca apenas verde ou vermelho.

### 11 Entrega e avaliação

`Pedido concluído`: ícone de sucesso, `Pedido entregue`, `Esperamos que
aproveites!`, chip `Entregue às 19:18`, foto de prova com morada e hora, e as
acções **Avaliar pedido** / **Voltar aos pedidos**.

A prova é privada: **sem rosto, sem matrícula, sem número da casa, sem
geolocalização exacta** nos metadados visíveis. Retenção limitada.

`Avaliar pedido`: cinco estrelas, tags curtas (`Chegou quente` · `Entrega
cuidadosa` · `Muito saboroso` · `Bom atendimento`), comentário opcional e
**Enviar avaliação**. Não força gorjeta nem texto; a avaliação do courier é
separada.

### 12 Notificações

Só mudanças significativas: confirmado, atribuído, recolhido, a chegar,
entregue, atraso relevante e acção necessária.

Cada notificação declara destino explícito:

| Evento              | Destino           |
| ------------------- | ----------------- |
| Pedido confirmado   | Detalhe do pedido |
| Courier atribuído   | Tracking          |
| Pedido recolhido    | Tracking          |
| A chegar            | Mapa expandido    |
| Pedido entregue     | Avaliação         |
| A entrega atrasada  | Tracking atrasado |
| Pagamento pendente  | Pagamento         |
| Courier reatribuído | Tracking          |

Payload: `orderId · event · occurredAt · destination · localizedTitle ·
localizedBody`, **deduplicado por `eventId`**.

Lock screen evita morada completa, instruções de acesso e telefone do courier.

Opt-in granular: actualizações de pedido, promoções e sons são controlados em
separado.

### 13 Erros

Banner de offline no topo do tracking: `Sem conexão · A mostrar as últimas
informações disponíveis · 19:03`. O título passa ao passado
(`O teu pedido estava a caminho`), o ETA fica rotulado `Último ETA: ~12 min`, e
aparece **Tentar novamente**.

Ecrã de recusa: `A {merchant} não conseguiu aceitar o pedido` · «Não houve
cobrança. Podes rever o carrinho ou escolher outro restaurante.» · chip **Sem
cobrança** · acções **Rever carrinho** / **Explorar restaurantes**.

Quatro banners (board 03): `Sucesso` · `Atrasado` · `Erro` · `Offline`.

### 14 Cancelamento

Sheet sobre os detalhes: `Cancelar pedido?` · «Diz-nos o motivo. Confirmamos
qualquer impacto antes de cancelar.» · quatro motivos
(`Enganei-me no pedido` · `Endereço incorreto` · `Tempo de espera` ·
`Outro motivo`) · **Confirmar cancelamento** (destrutiva) / **Manter pedido**.

Se houver taxa ou impossibilidade de cancelamento, isso aparece **antes** do
botão destrutivo.

Resultado: `O pedido foi cancelado` · «O estorno de 12.400 Kz pode demorar 3–5
dias úteis, conforme o banco.» · chip `Estorno iniciado` · **Voltar aos
pedidos** / **Preciso de ajuda**.

O vermelho é reservado à acção final e a erros reais; o ecrã de resultado volta
a paleta neutra.

### 15 Pagamento

`Pagamento pendente`: ícone âmbar, «Conclui o pagamento para a {merchant}
começar a preparar o pedido.», linha `#CM-10482 · 12.400 Kz`, acções **Concluir
pagamento** / **Cancelar pedido**.

`O pagamento não foi concluído`: ícone vermelho, «Não cobrámos o teu cartão.
Tenta novamente ou escolhe outro método.», acções **Tentar novamente** /
**Alterar método**.

Idempotência: repetir pagamento reutiliza a intenção e impede cobranças
duplicadas — já garantido por `buildIdempotencyKey` em `features/checkout`.

Privacidade: mostra apenas bandeira e quatro últimos dígitos.

Estes dois estados dobram no `StatusScreen` existente, que já os renderiza; o
board refina copy e acções, não cria rotas.

## Acessibilidade (board 16)

Labels semânticas transcritas do board:

- **Active Order Card** — «Pedido CM-10482, Burger House, a caminho, chega em
  cerca de 12 minutos. Botão acompanhar pedido.»
- **Courier** — «João Manuel, avaliação 4 vírgula 9, Toyota Yaris, matrícula
  ABC-12-34.»
- **Mapa** — «Courier a caminho de Casa, Talatona. Aproximadamente 12 minutos.
  Mapa, ajustável.»

Regras:

- **Dynamic Type** — acções empilham, sheets expandem, cards crescem. Conteúdo
  crítico nunca trunca nem fica preso a altura fixa. Em AX3 o ETA escreve-se por
  extenso: `Chega em aproximadamente 12 minutos`.
- **Alvos 44×44 mínimo.** A área interactiva pode ser maior que o glifo; alvos
  adjacentes mantêm separação.
- **Contraste** `#212121` sobre `#FFFFFF` = **15.3:1** (AAA).
- **Reduce Motion** — transições viram cross-fade; o tracking não depende do
  movimento do marker para comunicar progresso.
- **Mapa alternativo** — estado textual descreve origem, destino, etapa e ETA;
  o mapa pode ser ocultado **sem perda de função**.

## Motion & haptics (board 18)

Motion: **150–350 ms**, curvas iOS, sheet físico, markers **sem saltos**.
Reduce Motion usa cross-fade.

Haptics: `success` em confirmação e entrega; `warning` em acção necessária;
`selection` leve nos detents do sheet. **Nunca repetitivo.**

## Persistência e resiliência (board 18)

Persistir o **último snapshot confirmado**, timestamp, ETA e timeline. **Nunca
inventar posição entre actualizações** — um marker sem dados frescos fica onde
estava, datado, em vez de interpolar.

Actualização: push para eventos; polling adaptativo **15–30 s** em tracking
activo e mais lento em background.

## Privacidade

- Morada e contacto mínimos; localização **opcional**; PII oculta no lock
  screen; retenção limitada da foto de prova.
- Endereço e instruções visíveis ao courier **apenas durante a entrega**.
- Eventos essenciais: `order_confirmed · tracking_opened · courier_contacted ·
delivery_completed · rating_submitted` — **sem morada nem mensagem**.

## Deep links (board 18)

```
cometa://orders/{orderId}     abre detalhe
cometa://tracking/{orderId}   abre tracking e respeita autenticação
```

## Rotas

Todos os ecrãs do pedido vivem sob `(tabs)/(orders)/`, para os deep links terem
um alvo canónico:

```
(orders)/index.tsx                    board 05
(orders)/[orderId]/index.tsx          board 06
(orders)/[orderId]/confirmation.tsx   board 04
(orders)/[orderId]/tracking.tsx       boards 07 + 08
(orders)/[orderId]/timeline.tsx       board 10
(orders)/[orderId]/receipt.tsx        board 06 (recibo)
(orders)/[orderId]/cancel.tsx         board 14 (sheet)
(orders)/[orderId]/delivered.tsx      board 11
(orders)/[orderId]/rating.tsx         board 11
(orders)/[orderId]/rejected.tsx       board 13
```

Cada rota é uma linha que delega num componente de `features/orders/components`.

## Arquitectura

```
features/orders/
  stages.ts       as onze etapas + a tabela do board 18
  eta.ts          bandas, arredondamento, recálculo
  timeline.ts     transições → log de eventos datados
  simulation.ts   o relógio que avança etapas (sem backend)
  store.ts        registos, pedido activo, persistência
  content.ts      todas as strings, português de Angola
  types.ts
  components/     OrderStatusChip · ActiveOrderCard · OrderHistoryRow ·
                  OrderNumber · TrackingHeader · CourierCard ·
                  CourierChatPanel · TimelineList · StatusBanner ·
                  MapCanvas · MapFallback · TrackingSheet
features/tracking/   estreitado a geo + mapa (geo.ts · mapbox.ts · bottomSheet.ts)
hooks/OrdersProvider.tsx + useOrders.ts
theme/orders.ts + ordersTextStyle() em theme/mixins.ts
```

`stages`, `eta`, `timeline`, `simulation` e `store` são módulos puros com testes
próprios, escritos primeiro. Os ecrãs ficam finos.

## Corte final

Apagados num commit de cut-over, depois de as rotas novas passarem:

`app/(tabs)/(home)/order-tracking.tsx` · `live-tracking.tsx` · `delivered.tsx` ·
`rating.tsx` · `TRACKING_STAGES` e `DRIVER_ASSIGNED_STAGE_INDEX` em
`features/tracking/mockData.ts` · `features/tracking/components/DriverCard`.

Os ecrãs antigos escrevem português do Brasil (`Chegando até você`,
`Entregador`, `Restaurante preparando`) e sete etapas que não correspondem às
onze do board — são substituídos, não corrigidos.

## Fora de âmbito

- **Tab bar.** O board 05 desenha quatro separadores (Início · Explorar ·
  Pedidos · Perfil); a app tem cinco, incluindo Hi Kometa. O board está a
  simplificar e a barra vem do seu próprio nó (`48:20371`). Não se altera.
- **`features/rating`.** Mantém os critérios que já tem; o board 11 só muda o
  ecrã.
- **Chat funcional.** Ver board 09 acima.

## Discrepâncias registadas

| Onde                        | Discrepância                                                                                                                                                         | Resolução                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Board 18 vs. boards 07 e 17 | A tabela do board 18 lista dez estados e salta de `arriving` para `delivered`. O board 07 e o fluxo C do board 17 desenham **Courier chegou · Agora** entre os dois. | Entra como etapa `arrived`. Dois boards desenham-no; só a tabela o omite. |
| Board 05                    | Tab bar de quatro separadores.                                                                                                                                       | Fora de âmbito, acima.                                                    |

## Definition of done (board 18)

Todos os estados têm copy humana, timestamp, fallback sem mapa, VoiceOver,
Dynamic Type, loading, offline e acção de recuperação.
