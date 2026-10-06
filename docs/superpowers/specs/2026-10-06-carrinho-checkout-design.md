# Carrinho & Checkout — Design Spec

**Figma:** página `67:4561` (`CART & CHECKOUT`), boards 01–19.
**Data:** 2026-10-06
**Antecessor:** `2026-10-03-produto-personalizacao-design.md` (termina no `addItem`; esta spec começa aí).

## O que a página decide

Dezanove boards que cobrem o percurso do carrinho ao pedido confirmado. Board 19
fixa quatro princípios — **Transparency over Decoration, Clarity over Complexity,
Speed over Steps, Trust over Friction** — e a página inteira é a aplicação deles:
nenhum ecrã esconde um número, nenhum erro termina sem próxima acção, nenhuma
falha de pagamento duplica um pedido.

O percurso: **Carrinho → Promoção → Entrega → Instruções → Pagamento → Revisão →
Processamento → Confirmação**, com recuperação em cada passo.

## Fluxos (board 18)

|     | Fluxo                   | Percurso                                                  | Resultado                                |
| --- | ----------------------- | --------------------------------------------------------- | ---------------------------------------- |
| A   | Checkout normal         | Cart → Delivery → Payment → Review → Success              | Pedido confirmado e rastreável           |
| B   | Editar item             | Cart item → Product Detail preenchido → Update → Cart     | Carrinho actualizado sem perder contexto |
| C   | Pedido mínimo           | Cart 3.800 Kz → Blocked (mín. 5.000) → Menu → Ready       | O utilizador sabe quanto falta           |
| D   | Promoção                | Promo entry → Validation → Applied −1.500 Kz → Summary    | Desconto explicado no resumo             |
| E   | Endereço                | Address list → Manual add → Area check → Instructions     | ETA e taxa confirmados                   |
| F   | Pagamento               | Unselected (CTA bloqueado) → Select → Review → Processing | Método único persistido                  |
| G   | Falha de pagamento      | Processing → Failed (sem débito) → Change/retry → Success | Retry sem duplicar pedido                |
| H   | Invalidação do carrinho | Resume → Revalidate → Attention → Accept → Cart ready     | Mudança aceite de forma explícita        |

## Máquina de estados (board 19 · 02)

```
Cart      empty | loading | ready | below-minimum | invalid | updating
Delivery  missing | selected | unavailable | validating | valid
Payment   unselected | selected | unavailable | processing | failed | success
Order     draft | submitting | pending | confirmed | failed | cancelled
```

Transições seguras que o board 14 fixa:

| Transição              | Regra                                          |
| ---------------------- | ---------------------------------------------- |
| `ready → processing`   | Tap único; o CTA bloqueia imediatamente.       |
| `processing → pending` | Tempo limite **nunca** assume falha.           |
| `processing → success` | `orderId` persistido **antes** da confirmação. |
| `processing → error`   | Retry idempotente; nunca duplica pedido.       |

## Modelo de dados (board 19 · 03)

```
Cart      merchantId · items[] · promo · subtotal · deliveryFee · discount · total
Item      productId · options[] · quantity · unitPrice · availability
Delivery  addressId · label · zone · reference · instructions · phone · eta
Payment   methodId · availability · status · providerReference
Order     orderId · cartSnapshot · totals · status · createdAt
```

## Preço (board 19 · 05)

1. `Kz` sempre **depois** do valor; sem cêntimos no MVP → `formatKwanza`.
2. Subtotal é a soma de itens e opções × quantidade.
3. Entrega tem três modos — `normal`, `free` (`Grátis`, a verde), `dynamic`
   (valor + explicação: _"Entrega ajustada por procura elevada. Vês sempre o
   preço antes de pagar."_).
4. Desconto é uma **linha negativa** e mantém o código aplicado visível.
5. Alteração de preço exige **aceitação explícita** antes do checkout.

> **Mudança face ao código actual:** o resumo do Figma tem exactamente quatro
> linhas — Subtotal, Entrega, Desconto, Total. Não há IVA nem gorjeta. O
> `computeOrderSummary` actual calcula `vat` (14%) e `tip`, e o carrinho actual
> tem um bloco de gorjeta com pills. Ambos saem: um total que o Figma não mostra
> é um número que o cliente não pode verificar, e a spec diz "sem surpresas".

## Tokens (board 02)

Cores do board mapeadas no ramp semântico — nunca congeladas:

| Board                             | Token                                         | Porquê                                                         |
| --------------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| `#1BAC4B`                         | `brand.base` (`#0A7D53`)                      | Dois verdes a poucos graus lêem-se como bug, não como sistema. |
| `#D92D20`                         | `status.error` / `text.error`                 |                                                                |
| `#B25E09` sobre `#FFF5E8`         | `text.warning` / `status.warning.bg`          |                                                                |
| `#EAF8EE`                         | `surface.selected` / `status.success.bg`      |                                                                |
| `#FFFFFF` / `#FAFAFA`             | `background.primary` / `background.secondary` |                                                                |
| `#EEEEEE`                         | `border.subtle`                               |                                                                |
| `#212121` / `#616161` / `#9E9E9E` | `text.primary` / `.secondary` / `.muted`      |                                                                |

Geometria e passos de tipo vão para `theme/checkout.ts`, cada um nomeado pelo nó
de origem — o padrão de `theme/product.ts`.

**Escala espacial:** 4 · 8 · 12 · 16 · 24 · 32. **Raios:** 12 · 18 · 24 · 44.
**Viewports:** 390×844 (principal), 393×852, 430×932.

### Vocabulário medido (boards 03–17)

| Elemento         | Geometria                                                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation       | `min-height 56`, `px 16 · py 8`, `gap 12`; Back `40×40 r20` sobre `background.secondary`; título Poppins SemiBold 18; legenda Inter Regular 11 secundária; acção Inter SemiBold 13 brand                         |
| Screen body      | `px 16`, `pt 8 · pb 12`, `gap 12`                                                                                                                                                                                |
| Merchant context | `p 12 · r 18` sobre `background.secondary`; imagem `52 r14`; nome Poppins Bold 16; meta Inter Regular 12; chip `px10 py6 r999` Inter SemiBold 11                                                                 |
| Cart item        | `py 10 · gap 12`; imagem `64 r14`; título Inter SemiBold 14; preço Inter SemiBold 13; opções Inter Regular 11 (lh 1.35); `Editar` Inter SemiBold 11; stepper `p4 r999 gap10`, ícones 14, valor Inter SemiBold 12 |
| Selection row    | `min-height 58`, `p 12 · r 12 · gap 12`; ícone 20; título Inter SemiBold 13; subtítulo Inter Regular 11; trailing 18                                                                                             |
| Order summary    | `p 14 · r 18 · gap 9`; linhas Inter Regular 12 / Inter Medium 12; desconto Inter SemiBold 12 brand; `Total` Poppins SemiBold 15 + Inter Bold 18                                                                  |
| Form field       | label Inter SemiBold 11 secundária maiúsculas, `gap 5`; input `min-height 48`, `px14 py12 r12`, texto Inter Regular 13; erro Inter Regular 10                                                                    |
| Feedback banner  | `p 12 · r 12 · gap 10`; ícone 18; título Inter SemiBold 12; corpo Inter Regular 11 (lh 1.35)                                                                                                                     |
| Minimum progress | `p 16 · r 18 · gap 10`; barra `h 8 r 4`; cabeçalho Inter Bold 13 + Inter SemiBold 12                                                                                                                             |
| Bottom action    | `px 16 · pt 12 · pb 30`, borda superior `border.subtle`; CTA `h 54 · r 18`, label Inter Bold 14                                                                                                                  |

## Contrato do CTA (board 14)

| Estado            | Label                              | Fundo               | Activo |
| ----------------- | ---------------------------------- | ------------------- | ------ |
| `ready`           | `Pagar 12.400 Kz`                  | `brand.base`        | sim    |
| `missing-payment` | `Seleciona o pagamento`            | `border.subtle`     | não    |
| `missing-address` | `Adiciona um endereço`             | `border.subtle`     | não    |
| `below-minimum`   | `Faltam 1.300 Kz`                  | `border.subtle`     | não    |
| `processing`      | `A processar pagamento…` + spinner | `brand.base`        | não    |
| `success`         | `Pagamento confirmado` + check     | `brand.base`        | não    |
| `error`           | `Tentar novamente`                 | `status.error.fill` | sim    |

O CTA informa **destino e valor**. Está sempre acima da safe area.

## Estados por ecrã

### 04/05/06 Carrinho

Contexto persistente (merchant, localização, ETA), edição imediata (quantidade
altera no lugar; `Editar` abre o Product Detail preenchido), preço explicável,
CTA explícito. Quantidade actualizada mostra banner de sucesso _"Quantidade
actualizada · O total foi recalculado automaticamente."_; a linha em voo mostra
`A atualizar…` e o stepper troca o caixote por `−`.

Item indisponível: banner de erro _"Um item ficou indisponível"_, a linha fica
esbatida, o resumo deixa de a contar (total sobe de 12.400 para 13.900 Kz porque
o desconto da promoção também cai), e surgem duas acções — `Ver substitutos`
(neutra) e `Remover` (destrutiva, contorno) — com o CTA a virar
`Remover e continuar` em vermelho.

Remoção pede confirmação: _"Remover Batata Frita?"_ / _"Podes voltar ao menu e
adicionar novamente mais tarde."_ → `Remover item` (destrutivo) ou `Manter no
carrinho`.

### 07 Carrinho vazio

Contexto, não erro. Ícone em placa `r24` sobre `background.secondary`, título
Poppins SemiBold, corpo centrado, CTA `Explorar restaurantes`. Mantém a navegação
de volta. Se o último merchant continua disponível pode sugerir voltar lá —
**nunca** inventa recomendações automáticas no checkout.

### 08 Pedido mínimo

Progresso monetário (`3.800 / 5.000 Kz`), barra a 76%, frase que atribui a regra
ao merchant (_"A Burger House aceita pedidos a partir de 5.000 Kz."_), sugestão
opcional de add-on com botão `+` circular, banner `Checkout bloqueado` e CTA
desactivado a dizer quanto falta.

### 09 Promoções

Campo com o código preservado para correção — **o carrinho nunca é limpo**.
Estados: `default`, `loading` (_"A verificar o código…"_), `success`
(_"Poupaste 1.500 Kz neste pedido."_ + cartão com `Remover`), `invalid`,
`expired`, `minimum-not-met`. Entrega grátis e entrega dinâmica aparecem como
variantes do resumo, cada uma com a sua causa escrita.

### 10 Endereço

Mapa opcional, endereço seleccionado com verificação de área (_"Dentro da área de
entrega · Entrega estimada em 25–35 min · 1.200 Kz"_), lista
(`Casa`/`Trabalho`/`Outro`/`Usar localização atual`), e formulário manual.
**Privacidade:** _"A localização ajuda a preencher o endereço; nunca é necessária
para concluir manualmente."_ Fora de área é um erro explicado, não um beco.

### 11 Instruções

Instrução ≤ 120 caracteres com contador, chips sugeridos (`Ligar ao chegar`,
`Deixar na portaria`, `Não tocar à campainha`), contacto `+244` com teclado
telefónico, e a nota de privacidade: _"Usado apenas para coordenar esta
entrega."_ Instruções e telefone sobrevivem ao voltar atrás.

### 12 Pagamento

Um método de cada vez. `Pagamento na entrega` (numerário), `Cartão`, `Multicaixa
Express`. Indisponibilidade é explicada e oferece alternativa + `Tentar
novamente`. Sem método: aviso `Falta o método de pagamento` e CTA desactivado.
Nota do MVP: _"O MVP não inclui carteira, crédito, BNPL ou pagamento dividido."_

### 13 Revisão

Última leitura: itens (`1× Classic Burger`), endereço, contacto, instruções,
pagamento, resumo e `Pagar <total>`. Qualquer secção pode ser revista sem perder
dados.

### 16 Loading

Skeletons com as **dimensões finais** — mesma geometria, atraso mínimo, shimmer
discreto que respeita Reduce Motion, estado parcial preservado.

### 15 Erros

| Erro                | Banner           | Recuperação                                  |
| ------------------- | ---------------- | -------------------------------------------- |
| Item indisponível   | `status.error`   | Remove do total, mantém a linha visível      |
| Preço mudou         | `status.warning` | `Aceitar alterações` antes de continuar      |
| Restaurante fechado | `status.error`   | Diz quando reabre                            |
| Fora da área        | `status.error`   | Escolher outro endereço                      |
| Sem ligação         | `status.warning` | `Tentar novamente`; dados locais continuam   |
| Sessão interrompida | `status.info`    | `Continuar o teu pedido` / `Começar de novo` |
| Outro merchant      | `status.warning` | `Manter Burger House` / `Substituir`         |

### 17 Confirmação

`pending` (relógio âmbar, _"Não tentes pagar novamente"_, `Podes sair em
segurança`), `failed` (cruz vermelha, _"Não debitámos o valor"_, método usado,
`Alterar método de pagamento`, dados guardados, `Tentar novamente`) e `confirmed`
(check verde, `#CM-2048`, previsão/entrega/total, nota do método, `Acompanhar
pedido`).

## Acessibilidade (board 19 · 06)

- Touch targets ≥ 44 pt; zonas primárias alcançáveis com uma mão.
- Safe areas respeitadas no topo e no home indicator.
- Dynamic Type: os layouts refluem; preços e acções nunca truncam.
- Labels semânticos anunciam estado, valor, quantidade e acção.
- Contraste AA; **ícone e texto acompanham sempre a cor** — a cor nunca carrega
  o estado sozinha.

## Motion & haptics (board 19 · 07)

`150ms` tap · `220ms` state · `300ms` sheet · `350ms` screen.
Haptic leve em adicionar/remover e selecção confirmada; haptic de sucesso **só**
após pedido confirmado; erro apenas em falha relevante. Sem haptics em scroll,
loading ou cada campo digitado. Tudo honra `useReducedMotion`.

## Persistência (board 19 · 04)

Guardar itens, opções, quantidades, promoção, endereço, telefone, instruções e
método. Ao regressar, revalidar disponibilidade, preço, área, mínimo e estado do
merchant. Um timeout de pagamento **nunca** é tratado como falha — consulta-se o
estado por referência. A submissão é idempotente: nem pedido nem débito
duplicados.

## Guardrail MVP

Fora de âmbito, explicitamente: multi-merchant activo, subscrição, loyalty,
carteira, crédito, BNPL, pagamento dividido, motor fiscal complexo e AI checkout.
