import { BankRequest } from '@/types/alerts';

export const mockBankRequests: BankRequest[] = [
  // ═══════════════════════════════════════════
  // SECURITY/SCAM — URGENT
  // ═══════════════════════════════════════════
  {
    id: 'REQ-2026-001',
    type: 'Security/Scam',
    priority: 'URGENT',
    status: 'Unread',
    customerData: {
      name: 'Sarah Mitchell',
      phone: '+1 (555) 234-8901',
      accountType: 'Personal',
    },
    description:
      'I received a phone call from someone claiming to be from the bank\'s fraud department. They asked me to verify my account number and social security number. I gave them my account number before I realized it might be a scam. They said there was suspicious activity and that my account would be frozen if I didn\'t cooperate. The caller ID showed the bank\'s actual number.',
    createdAt: new Date('2026-03-01T09:23:00'),
    aiResponse: {
      summary:
        '⚠️ URGENT SECURITY ALERT: Customer was targeted by a sophisticated vishing (voice phishing) attack. The attacker used caller ID spoofing to impersonate the bank\'s fraud department. The customer disclosed their account number before recognizing the scam. Immediate account protection measures are required.',
      suggestedActions: [
        { id: 'a1', label: 'Immediate account freeze', checked: false },
        { id: 'a2', label: 'Block all credit lines', checked: false },
        { id: 'a3', label: 'Notify Security Department', checked: false },
        { id: 'a4', label: 'Call customer to verify identity', checked: false },
        { id: 'a5', label: 'Issue new account credentials', checked: false },
        { id: 'a6', label: 'Flag for law enforcement report', checked: false },
      ],
      reasoningQuotes: [
        {
          quote: 'someone claiming to be from the bank\'s fraud department',
          keyword: 'security department',
          explanation:
            'Classic social engineering tactic — impersonating authority figures to build trust and urgency. The keyword "security department" indicates potential impersonation fraud.',
        },
        {
          quote: 'asked me to verify my account number and social security number',
          keyword: 'social security',
          explanation:
            'Banks never ask customers to "verify" sensitive information via outbound calls. This is a clear phishing indicator.',
        },
        {
          quote: 'The caller ID showed the bank\'s actual number',
          keyword: 'caller id',
          explanation:
            'Caller ID spoofing technology was used, indicating a technically sophisticated attacker. This should be escalated to the cybersecurity team.',
        },
        {
          quote: 'my account would be frozen if I didn\'t cooperate',
          keyword: 'scam',
          explanation:
            'Creating false urgency is a hallmark of fraud — pressuring the victim to act before they can think critically.',
        },
      ],
    },
    sentiment: {
      aggression: 15,
      joy: 5,
      stress: 85,
      disappointment: 70,
      gratitude: 10,
      sarcasm: 5,
      urgencyIndex: 92,
      manipulationRisk: 88,
      churnProbability: 72,
      factsRatio: 40,
      emotionsRatio: 60,
      keywords: [
        { word: 'мошенничество', type: 'danger' },
        { word: 'заморозят', type: 'danger' },
        { word: 'срочно', type: 'warning' },
        { word: 'верификация', type: 'warning' },
        { word: 'помогите', type: 'warning' },
      ],
      aiSummaryRu: 'Клиент подвергся сложной атаке типа «вишинг». Мошенники имитировали службу безопасности банка с подменой номера и вынудили раскрыть номер счёта. Высокий уровень стресса и страха указывает на эффективное психологическое давление.',
    },
  },

  {
    id: 'REQ-2026-002',
    type: 'Security/Scam',
    priority: 'URGENT',
    status: 'Unread',
    customerData: {
      name: 'James Rivera',
      phone: '+1 (555) 678-1234',
      accountType: 'Business',
    },
    description:
      'I noticed three unauthorized transactions on my business checking account totaling $15,400. The transactions were made to an overseas vendor I\'ve never done business with. I did not authorize these payments. Someone must have stolen my credentials.',
    createdAt: new Date('2026-03-01T10:05:00'),
    aiResponse: {
      summary:
        '⚠️ URGENT SECURITY ALERT: Business account compromised with $15,400 in unauthorized overseas transactions. Pattern suggests credential theft or account takeover. Immediate freeze recommended.',
      suggestedActions: [
        { id: 'b1', label: 'Immediate account freeze', checked: false },
        { id: 'b2', label: 'Initiate chargeback process', checked: false },
        { id: 'b3', label: 'Review login activity logs', checked: false },
        { id: 'b4', label: 'Reset online banking credentials', checked: false },
        { id: 'b5', label: 'Flag for law enforcement report', checked: false },
      ],
      reasoningQuotes: [
        {
          quote: 'three unauthorized transactions on my business checking account totaling $15,400',
          keyword: 'unauthorized',
          explanation:
            'Multiple unauthorized transactions suggest sustained access rather than a single breach event.',
        },
        {
          quote: 'overseas vendor I\'ve never done business with',
          keyword: 'stolen',
          explanation:
            'Cross-border transactions to unknown entities are a primary indicator of account takeover fraud.',
        },
      ],
    },
    sentiment: {
      aggression: 55,
      joy: 3,
      stress: 90,
      disappointment: 80,
      gratitude: 5,
      sarcasm: 8,
      urgencyIndex: 95,
      manipulationRisk: 65,
      churnProbability: 85,
      factsRatio: 60,
      emotionsRatio: 40,
      keywords: [
        { word: 'несанкционированные', type: 'danger' },
        { word: 'украли', type: 'danger' },
        { word: 'зарубежный', type: 'warning' },
        { word: 'срочно', type: 'warning' },
        { word: '$15.400', type: 'danger' },
      ],
      aiSummaryRu: 'Бизнес-счёт взломан — зафиксировано три несанкционированных перевода на сумму $15.400 в пользу неизвестного зарубежного поставщика. Клиент в состоянии сильного стресса, риск оттока критически высок. Вероятна компрометация учётных данных.',
    },
  },

  {
    id: 'REQ-2026-008',
    type: 'Security/Scam',
    priority: 'URGENT',
    status: 'Unread',
    customerData: {
      name: 'Amara Osei',
      phone: '+1 (555) 777-3210',
      accountType: 'Personal',
    },
    description:
      'Someone sent me an SMS code and then called pretending to be from the bank. They said I need to read them the sms code to confirm my identity, otherwise my account would be blocked. I read the code before I realized it might be a scam. Now I see a $2,000 transfer I didn\'t make.',
    createdAt: new Date('2026-03-01T11:45:00'),
    aiResponse: {
      summary:
        '⚠️ URGENT SECURITY ALERT: Customer was targeted by a two-factor authentication bypass scam. The attacker initiated a transaction, triggering an SMS code, then socially engineered the customer into providing the code. $2,000 unauthorized transfer detected. Immediate reversal and account lock required.',
      suggestedActions: [
        { id: 'h1', label: 'Immediate account freeze', checked: false },
        { id: 'h2', label: 'Reverse the $2,000 unauthorized transfer', checked: false },
        { id: 'h3', label: 'Block all credit lines', checked: false },
        { id: 'h4', label: 'Reset all authentication methods', checked: false },
        { id: 'h5', label: 'Flag for law enforcement report', checked: false },
      ],
      reasoningQuotes: [
        {
          quote: 'SMS code and then called pretending to be from the bank',
          keyword: 'sms code',
          explanation:
            'SMS code interception via social engineering is a known 2FA bypass technique. The attacker initiated a transaction and then convinced the customer to share the verification code.',
        },
        {
          quote: 'I read the code before I realized it might be a scam',
          keyword: 'scam',
          explanation:
            'The customer shared their 2FA code with the attacker, enabling the unauthorized $2,000 transfer. Immediate account lockdown is critical.',
        },
      ],
    },
    sentiment: {
      aggression: 10,
      joy: 5,
      stress: 88,
      disappointment: 75,
      gratitude: 20,
      sarcasm: 3,
      urgencyIndex: 90,
      manipulationRisk: 82,
      churnProbability: 68,
      factsRatio: 45,
      emotionsRatio: 55,
      keywords: [
        { word: 'мошенничество', type: 'danger' },
        { word: 'SMS-код', type: 'danger' },
        { word: '$2.000', type: 'danger' },
        { word: 'заблокируют', type: 'warning' },
        { word: 'доверилась', type: 'warning' },
      ],
      aiSummaryRu: 'Клиент стал жертвой схемы обхода двухфакторной аутентификации. Злоумышленник инициировал транзакцию, получил SMS-код через социальную инженерию и совершил перевод $2.000. Клиент испытывает смешанные чувства вины и страха.',
    },
  },

  // ═══════════════════════════════════════════
  // TRANSACTION PROBLEM — HIGH
  // ═══════════════════════════════════════════
  {
    id: 'REQ-2026-003',
    type: 'Transaction Problem',
    priority: 'HIGH',
    status: 'In Analysis',
    customerData: {
      name: 'Linda Park',
      phone: '+1 (555) 890-4567',
      accountType: 'Personal',
    },
    description:
      'I sent a wire transfer of $3,200 to my landlord two days ago but the money not arrived on their end. My account shows the deduction but the funds seem to be stuck somewhere. This is a failed transfer and I need it resolved urgently as my rent is overdue.',
    createdAt: new Date('2026-02-28T15:30:00'),
    aiResponse: {
      summary:
        'Transaction issue detected. Customer reports a $3,200 wire transfer that was debited but not received by the beneficiary after 2 days. This appears to be a stuck/failed transfer requiring investigation with the clearing house.',
      suggestedActions: [
        { id: 'c1', label: 'Check transaction log for the last 72 hours', checked: true },
        { id: 'c2', label: 'Contact clearing house', checked: false },
        { id: 'c3', label: 'Verify with recipient bank', checked: false },
        { id: 'c4', label: 'Issue provisional credit if applicable', checked: false },
      ],
      reasoningQuotes: [
        {
          quote: 'money not arrived on their end',
          keyword: 'money not arrived',
          explanation:
            'The phrase "money not arrived" indicates a failed or stuck wire transfer. The transaction log should be reviewed and the intermediary bank contacted.',
        },
        {
          quote: 'This is a failed transfer and I need it resolved urgently',
          keyword: 'failed transfer',
          explanation:
            'Customer explicitly reports a failed transfer. Priority investigation of the clearing process is warranted.',
        },
      ],
    },
    sentiment: {
      aggression: 30,
      joy: 5,
      stress: 75,
      disappointment: 85,
      gratitude: 15,
      sarcasm: 5,
      urgencyIndex: 78,
      manipulationRisk: 10,
      churnProbability: 60,
      factsRatio: 70,
      emotionsRatio: 30,
      keywords: [
        { word: 'зависли', type: 'warning' },
        { word: 'срочно', type: 'warning' },
        { word: 'аренда', type: 'warning' },
        { word: 'перевод', type: 'warning' },
        { word: 'просроченная', type: 'danger' },
      ],
      aiSummaryRu: 'Клиент сообщает о зависшем переводе $3.200 арендодателю. Средства списаны, но не получены. Высокий уровень разочарования и стресса из-за просроченной аренды. Случай не связан с мошенничеством — техническая проблема клиринга.',
    },
  },

  {
    id: 'REQ-2026-004',
    type: 'Transaction Problem',
    priority: 'HIGH',
    status: 'Unread',
    customerData: {
      name: 'David Chen',
      phone: '+1 (555) 321-7890',
      accountType: 'Business',
    },
    description:
      'I was charged twice for the same purchase at a grocery store — $87.50 was taken out of my account twice. Also, I tried to withdraw cash at an ATM yesterday and got an atm error message but $200 was still deducted from my balance.',
    createdAt: new Date('2026-03-01T08:15:00'),
    aiResponse: {
      summary:
        'Transaction issue detected. Customer reports a double charge of $87.50 at a grocery store and a separate ATM error where $200 was deducted without cash being dispensed. Two separate transaction disputes need investigation.',
      suggestedActions: [
        { id: 'd1', label: 'Check transaction log for the last 72 hours', checked: false },
        { id: 'd2', label: 'Initiate chargeback process for the double charge', checked: false },
        { id: 'd3', label: 'File ATM error dispute with terminal operator', checked: false },
        { id: 'd4', label: 'Issue provisional credit if applicable', checked: false },
      ],
      reasoningQuotes: [
        {
          quote: 'charged twice for the same purchase',
          keyword: 'double charge',
          explanation:
            'Double charge detected. The merchant\'s payment  processor likely submitted the transaction twice. A chargeback may be necessary.',
        },
        {
          quote: 'atm error message but $200 was still deducted',
          keyword: 'atm error',
          explanation:
            'ATM dispensing failure with account debit. The ATM operator\'s reconciliation logs need to be checked for the failed cash dispensation.',
        },
      ],
    },
    sentiment: {
      aggression: 40,
      joy: 5,
      stress: 65,
      disappointment: 70,
      gratitude: 10,
      sarcasm: 15,
      urgencyIndex: 65,
      manipulationRisk: 5,
      churnProbability: 50,
      factsRatio: 75,
      emotionsRatio: 25,
      keywords: [
        { word: 'дважды списали', type: 'danger' },
        { word: 'ошибка банкомата', type: 'warning' },
        { word: 'не выдан', type: 'warning' },
        { word: 'двойное списание', type: 'danger' },
        { word: '$200', type: 'warning' },
      ],
      aiSummaryRu: 'Клиент столкнулся одновременно с двойным списанием $87.50 в магазине и сбоем банкомата с потерей $200. Тон преимущественно деловой, но с признаками раздражения. Оба случая требуют отдельного расследования.',
    },
  },

  // ═══════════════════════════════════════════
  // TECHNICAL ISSUE — MEDIUM
  // ═══════════════════════════════════════════
  {
    id: 'REQ-2026-005',
    type: 'Technical Issue',
    priority: 'MEDIUM',
    status: 'Unread',
    customerData: {
      name: 'Maria Gonzalez',
      phone: '+1 (555) 456-7890',
      accountType: 'Personal',
    },
    description:
      'My mobile app is not opening after the latest update. It shows a white screen and then crashes. I\'ve tried clearing cache and reinstalling but nothing works. I need to do a password reset too because I forgot my login credentials.',
    createdAt: new Date('2026-02-28T14:00:00'),
    aiResponse: {
      summary:
        'Technical support request. Customer experiencing app crash after update and needs a password reset. Standard troubleshooting workflow should be initiated, including device compatibility check and credential recovery.',
      suggestedActions: [
        { id: 'e1', label: 'Send step-by-step troubleshooting guide', checked: false },
        { id: 'e2', label: 'Initiate password reset via secure link', checked: false },
        { id: 'e3', label: 'Verify account access permissions', checked: false },
        { id: 'e4', label: 'Escalate to technical support if unresolved', checked: false },
      ],
      reasoningQuotes: [
        {
          quote: 'mobile app is not opening after the latest update',
          keyword: 'app not opening',
          explanation:
            'The keyword "app not opening" suggests a technical issue with the mobile banking application, likely related to a recent update incompatibility.',
        },
        {
          quote: 'I need to do a password reset too because I forgot my login credentials',
          keyword: 'password reset',
          explanation:
            'Password reset request is a standard technical support task. A secure reset link should be sent to the registered email.',
        },
      ],
    },
    sentiment: {
      aggression: 5,
      joy: 10,
      stress: 40,
      disappointment: 45,
      gratitude: 25,
      sarcasm: 5,
      urgencyIndex: 35,
      manipulationRisk: 3,
      churnProbability: 25,
      factsRatio: 65,
      emotionsRatio: 35,
      keywords: [
        { word: 'не открывается', type: 'warning' },
        { word: 'сброс пароля', type: 'warning' },
        { word: 'переустановка', type: 'warning' },
        { word: 'обновление', type: 'warning' },
        { word: 'помогите', type: 'safe' },
      ],
      aiSummaryRu: 'Клиент обращается по двум техническим проблемам: сбой приложения после обновления и утеря пароля. Тон спокойный, уровень стресса умеренный. Стандартный запрос в техподдержку без признаков угрозы безопасности.',
    },
  },

  // ═══════════════════════════════════════════
  // TECHNICAL ISSUE — LOW
  // ═══════════════════════════════════════════
  {
    id: 'REQ-2026-006',
    type: 'Technical Issue',
    priority: 'LOW',
    status: 'Resolved',
    customerData: {
      name: 'Robert Kim',
      phone: '+1 (555) 234-5678',
      accountType: 'Business',
    },
    description:
      'I can\'t find where in the app to change my transfer limit from the settings. The interface changed after the update and the limit adjustment option seems to have moved.',
    createdAt: new Date('2026-02-27T10:30:00'),
    aiResponse: {
      summary:
        'Technical support request. Customer cannot locate the transfer limit settings after a UI update. This is a navigation/UX issue requiring guidance through the updated app interface.',
      suggestedActions: [
        { id: 'f1', label: 'Send step-by-step guide for new settings layout', checked: true },
        { id: 'f2', label: 'Guide customer through app settings', checked: true },
        { id: 'f3', label: 'Collect UI feedback for product team', checked: true },
      ],
      reasoningQuotes: [
        {
          quote: 'can\'t find where in the app to change my transfer limit from the settings',
          keyword: 'limit',
          explanation:
            'The keyword "limit" combined with "settings" indicates a navigation issue — customer needs guidance to the updated transfer limit controls.',
        },
      ],
    },
    sentiment: {
      aggression: 3,
      joy: 15,
      stress: 10,
      disappointment: 20,
      gratitude: 30,
      sarcasm: 5,
      urgencyIndex: 12,
      manipulationRisk: 2,
      churnProbability: 10,
      factsRatio: 80,
      emotionsRatio: 20,
      keywords: [
        { word: 'лимит перевода', type: 'warning' },
        { word: 'настройки', type: 'safe' },
        { word: 'изменилось', type: 'warning' },
        { word: 'не могу найти', type: 'warning' },
        { word: 'помогите', type: 'safe' },
      ],
      aiSummaryRu: 'Клиент не может найти настройки лимита перевода в обновлённом интерфейсе. Тон нейтральный, преобладают факты. Низкий риск оттока. Требуется краткая навигационная инструкция по новому UI приложения.',
    },
  },

  // ═══════════════════════════════════════════
  // GENERAL INQUIRY — LOW
  // ═══════════════════════════════════════════
  {
    id: 'REQ-2026-007',
    type: 'General Inquiry',
    priority: 'LOW',
    status: 'Unread',
    customerData: {
      name: 'Emma Thompson',
      phone: '+1 (555) 111-2233',
      accountType: 'Personal',
    },
    description:
      'I\'d like to know the current exchange rate for USD to EUR. Also, what are the branch opening hours for the downtown location on weekends? I\'m considering opening a savings account too.',
    createdAt: new Date('2026-02-28T16:45:00'),
    aiResponse: {
      summary:
        'General information request regarding exchange rates, branch hours, and savings account options. Customer can be directed to relevant resources and FAQ.',
      suggestedActions: [
        { id: 'g1', label: 'Send relevant FAQ link', checked: false },
        { id: 'g2', label: 'Provide current USD/EUR exchange rate', checked: false },
        { id: 'g3', label: 'Share downtown branch weekend hours', checked: false },
        { id: 'g4', label: 'Schedule callback with savings specialist', checked: false },
      ],
      reasoningQuotes: [
        {
          quote: 'current exchange rate for USD to EUR',
          keyword: 'exchange rate',
          explanation:
            'The keyword "exchange rate" indicates a general informational request. Current rate information should be provided.',
        },
        {
          quote: 'branch opening hours for the downtown location on weekends',
          keyword: 'opening hours',
          explanation:
            'The keyword "opening hours" is a standard inquiry. Branch schedule information should be provided.',
        },
      ],
    },
    sentiment: {
      aggression: 2,
      joy: 35,
      stress: 8,
      disappointment: 5,
      gratitude: 45,
      sarcasm: 5,
      urgencyIndex: 10,
      manipulationRisk: 2,
      churnProbability: 5,
      factsRatio: 85,
      emotionsRatio: 15,
      keywords: [
        { word: 'курс обмена', type: 'safe' },
        { word: 'часы работы', type: 'safe' },
        { word: 'накопительный счёт', type: 'safe' },
        { word: 'спасибо', type: 'safe' },
        { word: 'интересует', type: 'safe' },
      ],
      aiSummaryRu: 'Клиент делает стандартный информационный запрос: курс USD/EUR, часы работы отделения и возможность открытия вклада. Тон позитивный, уровень вовлечённости высокий. Отличный кандидат для допродажи банковских продуктов.',
    },
  },
];
