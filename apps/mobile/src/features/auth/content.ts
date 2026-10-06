/**
 * Every string the authentication screens render, transcribed verbatim from
 * Figma file PAuqq5xMI0yQtx8POz4TUL, page "AUTHENTICATION".
 *
 * The page is drawn in Brazilian Portuguese ("você", "Digite o código") while
 * the rest of the app speaks European Portuguese. That split is kept rather
 * than harmonised, for the reason `features/onboarding/content.ts` gives: the
 * copy is part of the design under review, and quietly rewriting it would hide
 * the inconsistency instead of surfacing it.
 */

/** Node 74:24614 — the first screen behind the splash. */
export const welcome = {
  /**
   * The board draws this as "COMETA"; the app is Kometa everywhere else,
   * app config included, so the name wins over the transcription here.
   */
  wordmark: 'Kometa',
  /** Node 74:24639. */
  title: 'Tudo o que precisas, num só lugar.',
  /** Node 74:24640. */
  description: 'Peça comida, produtos e muito mais perto de você.',
  /** Node 74:24643. */
  primaryAction: 'Começar',
  /** Node 74:24645. */
  secondaryAction: 'Já tenho uma conta',
  /** Node 74:24646. */
  legal: 'Ao continuar, você aceita nossos Termos e a Política de Privacidade.',
} as const;

/** Node 74:24703 and the five sibling state frames. */
export const phone = {
  /** Node 74:24716. */
  title: 'Qual é o seu número?',
  /** Node 74:24717. */
  description: 'Enviaremos um código por SMS para confirmar sua identidade.',
  /** Node 74:24719. */
  label: 'Número de telefone',
  /** Node 74:24725 — the placeholder, drawn in `text/muted`. */
  placeholder: '923 456 789',
  /** Node 74:24726. */
  hint: 'Seu número não será exibido publicamente. Tarifas de SMS podem ser aplicadas.',
  /** Node 74:24729. */
  action: 'Continuar',
  /** Frame "Phone · Invalid" (74:24827). */
  invalid: 'Introduza um número angolano válido, começado por 9.',
} as const;

/** Node 74:24940 and the seven sibling state frames. */
export const otp = {
  /** Node 74:24953. */
  title: 'Digite o código',
  /**
   * Node 74:24954. The board draws the number inline; it is a template here
   * so the screen shows the number actually used rather than the mock one.
   */
  description: (formattedNumber: string) => `Enviamos um código para ${formattedNumber}.`,
  /** Node 74:24970. */
  hint: 'Compatível com SMS autofill, colar código e avanço automático.',
  /** Node 74:24969 — the countdown while a resend is still blocked. */
  resendIn: (seconds: string) => `Reenviar em ${seconds}`,
  /** Frame "OTP · Reenvio disponível" (74:25177). */
  resendAvailable: 'Reenviar código',
  /** Frame "OTP · Código incorreto" (74:25091). */
  incorrect: 'Código incorreto. Tente novamente.',
  /** Frame "OTP · Expirado" (74:25134). */
  expired: 'Este código expirou. Peça um novo.',
  /** Frame "OTP · Muitas tentativas" (74:25216). */
  tooManyAttempts: 'Demasiadas tentativas. Tente novamente mais tarde.',
  /** Frame "OTP · Filled / verifying" (74:25006). */
  verifying: 'A verificar…',
} as const;

/** Node 74:25416 — shown only when the number has no account yet. */
export const newAccount = {
  title: 'Como te chamas?',
  description: 'É o nome que o estafeta e o restaurante vão ver.',
  label: 'Nome completo',
  placeholder: 'António Mendes',
  action: 'Criar conta',
  /** Frame "New account · creating" (74:25444). */
  creating: 'A criar a conta…',
} as const;

/** The Angolan dialling code the board draws — node 74:24721. */
export const country = {
  flag: '🇦🇴',
  dialCode: '+244',
  name: 'Angola',
} as const;
