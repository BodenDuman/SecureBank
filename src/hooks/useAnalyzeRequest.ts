import { BankRequest, RequestType, RequestPriority, AiAction, AiReasoning, AccountType, SentimentAnalysis } from '@/types/alerts';
import { LLMSettings, callLLM } from '@/store/llmStore';

// ──────────────────────────────────────────────
// Словарь ключевых слов
// ──────────────────────────────────────────────

interface KeywordRule {
    keywords: string[];
    type: RequestType;
    priority: RequestPriority;
    actions: string[];
    explanationTemplate: (keyword: string) => string;
}

const CLASSIFICATION_RULES: KeywordRule[] = [
    {
        keywords: [
            'scam', 'fraud', 'police', 'security department', 'stolen',
            'lost card', 'unauthorized', 'sms code', 'pushed to take a loan',
            'impersonate', 'phishing', 'suspicious call', 'caller id',
            'social security', 'account frozen', 'cooperate',
            'мошенничество', 'мошенники', 'кредит', 'паника', 'паниках',
            'звонили из банка', 'позвонили из банка', 'звонят из банка',
            'полиция', 'украли', 'смс код', 'смс-код', 'код из смс',
            'заставили взять кредит', 'заставляют', 'угрожают',
            'украли карту', 'потерял карту', 'потеряла карту',
            'несанкционированн', 'подозрительн', 'блокируют счёт',
            'служба безопасности', 'отдел безопасности',
            'перевести деньги', 'безопасный счёт',
            'скам', 'фрод', 'обман',
        ],
        type: 'Security/Scam',
        priority: 'URGENT',
        actions: [
            'Немедленная блокировка счёта',
            'Заблокировать все кредитные линии',
            'Уведомить отдел безопасности',
            'Связаться с клиентом для подтверждения',
            'Выпустить новые реквизиты',
            'Направить отчёт в правоохранительные органы',
        ],
        explanationTemplate: (keyword: string) =>
            `Ключевое слово «${keyword}» указывает на возможное мошенничество или скам. Требуется немедленная эскалация и защита счёта клиента.`,
    },
    {
        keywords: [
            'failed transfer', 'money not arrived', 'double charge', 'atm error',
            'declined', 'wrong amount', 'pending transaction', 'refund',
            'chargeback', 'missing deposit', 'overdraft', 'balance discrepancy',
            'не пришли деньги', 'деньги не дошли', 'деньги не пришли',
            'двойное списание', 'списали дважды', 'списали два раза',
            'ошибка банкомата', 'банкомат не выдал', 'банкомат забрал карту',
            'отклонён', 'отказ в транзакции', 'неправильная сумма',
            'перевод не прошёл', 'перевод завис', 'возврат средств',
            'возврат денег', 'баланс не совпадает', 'пропал депозит',
        ],
        type: 'Transaction Problem',
        priority: 'HIGH',
        actions: [
            'Проверить журнал транзакций за последние 72 часа',
            'Связаться с клиринговой палатой',
            'Инициировать процедуру возврата',
            'Проверить с банком получателя',
            'Выдать временный кредит при необходимости',
        ],
        explanationTemplate: (keyword: string) =>
            `Фраза «${keyword}» указывает на проблему с транзакцией, требующую проверки платёжных записей и возможного возврата средств.`,
    },
    {
        keywords: [
            'password reset', 'app not opening', 'can\'t log in', 'login error',
            'two-factor', '2fa', 'app crash', 'update', 'bug', 'glitch',
            'settings', 'limit', 'notification', 'mobile app', 'browser',
            'не могу войти', 'не входит', 'ошибка входа',
            'приложение не работает', 'приложение не открывается', 'приложение зависает',
            'сбросить пароль', 'забыл пароль', 'забыла пароль', 'смена пароля',
            'настройки', 'лимит', 'лимиты', 'изменить лимит',
            'уведомления', 'не приходят уведомления',
            'обновление', 'ошибка в приложении', 'баг', 'глючит',
        ],
        type: 'Technical Issue',
        priority: 'MEDIUM',
        actions: [
            'Отправить пошаговую инструкцию',
            'Помочь клиенту с настройками',
            'Проверить права доступа к аккаунту',
            'Передать в техническую поддержку при необходимости',
        ],
        explanationTemplate: (keyword: string) =>
            `Ключевое слово «${keyword}» указывает на техническую проблему с приложением или аккаунтом. Необходимо провести стандартную процедуру устранения неисправности.`,
    },
    {
        keywords: [
            'opening hours', 'exchange rate', 'interest rate', 'new account',
            'documents needed', 'branch location', 'fees', 'charges',
            'mortgage', 'savings', 'investment', 'credit card application',
            'часы работы', 'график работы', 'время работы',
            'курс валют', 'обменный курс', 'курс доллара', 'курс евро',
            'процентная ставка', 'ставка по кредиту', 'ставка по депозиту',
            'документы', 'какие документы нужны',
            'открыть счёт', 'открыть карту', 'новая карта',
            'адрес отделения', 'где находится',
            'комиссия', 'тарифы', 'условия',
            'ипотека', 'вклад', 'депозит', 'инвестиции',
        ],
        type: 'General Inquiry',
        priority: 'LOW',
        actions: [
            'Отправить ссылку на FAQ',
            'Предоставить контактные данные отделения',
            'Отправить информацию о продуктах',
            'Назначить обратный звонок со специалистом',
        ],
        explanationTemplate: (keyword: string) =>
            `Ключевое слово «${keyword}» указывает на общий информационный запрос. Необходимо предоставить клиенту соответствующие ресурсы и информацию.`,
    },
];

// ──────────────────────────────────────────────
// Движок классификации (keyword-based)
// ──────────────────────────────────────────────

interface ClassificationResult {
    type: RequestType;
    priority: RequestPriority;
    matchedKeywords: { keyword: string; sentence: string; ruleIndex: number }[];
}

function classifyText(text: string): ClassificationResult {
    const lowerText = text.toLowerCase();
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

    const matchedKeywords: { keyword: string; sentence: string; ruleIndex: number }[] = [];

    for (let ruleIndex = 0; ruleIndex < CLASSIFICATION_RULES.length; ruleIndex++) {
        const rule = CLASSIFICATION_RULES[ruleIndex];
        for (const keyword of rule.keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                const matchingSentence = sentences.find(s =>
                    s.toLowerCase().includes(keyword.toLowerCase())
                ) || text.substring(0, 120);

                matchedKeywords.push({ keyword, sentence: matchingSentence, ruleIndex });
            }
        }
    }

    if (matchedKeywords.length === 0) {
        return { type: 'General Inquiry', priority: 'LOW', matchedKeywords: [] };
    }

    const bestRuleIndex = Math.min(...matchedKeywords.map(m => m.ruleIndex));
    return {
        type: CLASSIFICATION_RULES[bestRuleIndex].type,
        priority: CLASSIFICATION_RULES[bestRuleIndex].priority,
        matchedKeywords,
    };
}

function generateSummary(type: RequestType, description: string, keywords: string[]): string {
    const truncatedDesc = description.length > 80 ? description.substring(0, 80) + '...' : description;

    switch (type) {
        case 'Security/Scam':
            return `⚠️ СРОЧНОЕ ОПОВЕЩЕНИЕ: Клиент сообщает о возможном мошенничестве. Обнаружены индикаторы: ${keywords.slice(0, 3).join(', ')}. Рекомендуется немедленная блокировка счёта и защитные меры. «${truncatedDesc}»`;
        case 'Transaction Problem':
            return `Обнаружена проблема с транзакцией. Клиент сообщает о: ${keywords.slice(0, 3).join(', ')}. Рекомендуется проверка истории транзакций. «${truncatedDesc}»`;
        case 'Technical Issue':
            return `Обращение в техническую поддержку. Клиент испытывает проблемы: ${keywords.slice(0, 3).join(', ')}. Необходимо начать стандартную процедуру устранения неисправности. «${truncatedDesc}»`;
        case 'General Inquiry':
            return `Общий информационный запрос по теме: ${keywords.slice(0, 3).join(', ')}. Клиенту необходимо предоставить соответствующие ресурсы и информацию. «${truncatedDesc}»`;
        default:
            return `Обращение клиента получено. «${truncatedDesc}»`;
    }
}

// ──────────────────────────────────────────────
// Генератор уникальных ID
// ──────────────────────────────────────────────

function generateId(): string {
    const uuid = crypto.randomUUID().split('-')[0];
    return `REQ-${uuid.toUpperCase()}`;
}

// ──────────────────────────────────────────────
// Генератор ИИ-анализа тональности (keyword-based)
// ──────────────────────────────────────────────

const DANGER_WORDS = [
    'мошенничество', 'мошенники', 'украли', 'украл', 'взломали',
    'несанкционированн', 'суд', 'полиция', 'заблокировали', 'ограбили',
    'scam', 'fraud', 'stolen', 'unauthorized', 'police', 'hacked',
    'кредит', 'заставили', 'угрожают', 'требуют', 'шантаж',
];
const STRESS_WORDS = [
    'срочно', 'помогите', 'срочная', 'быстрее', 'немедленно', 'паника',
    'urgent', 'help', 'immediately', 'asap', 'emergency',
    'боюсь', 'страшно', 'переживаю', 'тревога', 'беда',
    'заморозят', 'заблокируют', 'потеряю', 'страх',
];
const FRUSTRATION_WORDS = [
    'невозможно', 'безобразие', 'неприемлемо', 'почему', 'надоело',
    'ужасно', 'отвратительно', 'обидно', 'несправедливо',
    'ждал', 'ждала', 'до сих пор', 'опять', 'снова', 'всё ещё',
    'не работает', 'не пришло', 'не прошёл',
];
const GRATITUDE_WORDS = [
    'спасибо', 'благодарю', 'признателен', 'признательна', 'отлично', 'замечательно',
    'thank', 'thanks', 'grateful', 'appreciate',
    'помогли', 'решили', 'хорошо', 'удобно',
];
const AGGRESSION_WORDS = [
    'требую', 'немедленно верните', 'это недопустимо', 'пожалуюсь',
    'подам заявление', 'в суд', 'ваша вина', 'виноваты',
    'возмущён', 'возмущена', 'скандал', 'жалоба', 'претензия',
];
const MANIPULATION_TRIGGERS = [
    'звонили из банка', 'позвонили из банка', 'сотрудник банка позвонил',
    'служба безопасности позвонила', 'отдел безопасности', 'безопасный счёт',
    'смс код', 'смс-код', 'код из смс', 'код подтверждения',
    'установить приложение', 'anydesk', 'teamviewer', 'удалённый доступ',
    'перевести на другой счёт', 'временный счёт', 'защитный счёт',
    'ваш счёт взломан', 'ваш счёт под угрозой',
    'security department', 'caller id', 'sms code', 'remote access',
    'safe account', 'transfer to safe',
];

function countMatches(text: string, words: string[]): number {
    const lower = text.toLowerCase();
    return words.filter(w => lower.includes(w.toLowerCase())).length;
}

function clamp(val: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, val));
}

function extractKeywords(
    text: string,
    type: RequestType,
): SentimentAnalysis['keywords'] {
    const lower = text.toLowerCase();
    const result: SentimentAnalysis['keywords'] = [];

    for (const w of DANGER_WORDS) {
        if (lower.includes(w.toLowerCase()) && result.length < 6) {
            result.push({ word: w, type: 'danger' });
        }
    }
    for (const w of STRESS_WORDS) {
        if (lower.includes(w.toLowerCase()) && result.length < 6) {
            result.push({ word: w, type: 'warning' });
        }
    }
    for (const w of GRATITUDE_WORDS) {
        if (lower.includes(w.toLowerCase()) && result.length < 6) {
            result.push({ word: w, type: 'safe' });
        }
    }

    // Добавить типичные слова по категории если ничего не нашли
    if (result.length === 0) {
        if (type === 'Security/Scam') result.push({ word: 'мошенничество', type: 'danger' });
        else if (type === 'Transaction Problem') result.push({ word: 'транзакция', type: 'warning' });
        else if (type === 'Technical Issue') result.push({ word: 'проблема', type: 'warning' });
        else result.push({ word: 'запрос', type: 'safe' });
    }

    return result;
}

function generateSentiment(description: string, type: RequestType, priority: RequestPriority): SentimentAnalysis {
    const dangerCount = countMatches(description, DANGER_WORDS);
    const stressCount = countMatches(description, STRESS_WORDS);
    const frustrationCount = countMatches(description, FRUSTRATION_WORDS);
    const gratitudeCount = countMatches(description, GRATITUDE_WORDS);
    const aggressionCount = countMatches(description, AGGRESSION_WORDS);
    const manipulationCount = countMatches(description, MANIPULATION_TRIGGERS);

    // Базовые значения по типу кейса
    const baseMap: Record<RequestType, { stress: number; urgency: number; manip: number; churn: number }> = {
        'Security/Scam':        { stress: 60, urgency: 70, manip: 50, churn: 55 },
        'Transaction Problem':  { stress: 40, urgency: 50, manip: 5,  churn: 40 },
        'Technical Issue':      { stress: 20, urgency: 25, manip: 2,  churn: 20 },
        'General Inquiry':      { stress: 5,  urgency: 8,  manip: 1,  churn: 5  },
    };
    const base = baseMap[type];

    const stress       = clamp(base.stress + stressCount * 8 + dangerCount * 5);
    const aggression   = clamp(aggressionCount * 20 + dangerCount * 5);
    const disappointment = clamp(frustrationCount * 18 + (priority === 'HIGH' ? 15 : 0));
    const gratitude    = clamp(gratitudeCount * 25);
    const sarcasm      = clamp(frustrationCount * 8);
    const joy          = clamp(gratitudeCount * 20 - stressCount * 5);

    const urgencyIndex    = clamp(base.urgency + stressCount * 5 + dangerCount * 7 + (priority === 'URGENT' ? 15 : priority === 'HIGH' ? 8 : 0));
    const manipulationRisk = clamp(base.manip + manipulationCount * 22 + dangerCount * 8);
    const churnProbability = clamp(base.churn + aggressionCount * 10 + frustrationCount * 8 + (priority === 'URGENT' ? 15 : 0));

    // Факты vs Эмоции: чем больше эмоциональных слов, тем больше эмоций
    const emotionSignals = stressCount + aggressionCount + frustrationCount + gratitudeCount;
    const emotionsRatio  = clamp(15 + emotionSignals * 12);
    const factsRatio     = 100 - emotionsRatio;

    // Краткое резюме
    const summaryMap: Record<RequestType, string> = {
        'Security/Scam':       `Клиент сообщает о признаках мошенничества. Обнаружены сигналы стресса и давления. ${manipulationRisk >= 60 ? 'Высокий риск социальной инженерии.' : 'Возможная попытка манипуляции.'} Требуется срочная проверка счёта.`,
        'Transaction Problem':  `Клиент столкнулся с проблемой транзакции. ${frustrationCount > 0 ? 'Присутствует разочарование из-за задержки или ошибки.' : 'Тон деловой, факты преобладают.'} Случай не связан с мошенничеством.`,
        'Technical Issue':      `Клиент обращается с технической проблемой. ${stressCount > 0 ? 'Есть признаки лёгкого беспокойства.' : 'Тон спокойный, запрос информационный.'} Стандартная техническая поддержка.`,
        'General Inquiry':      `Информационный запрос клиента. ${gratitudeCount > 0 ? 'Позитивный настрой, высокая вовлечённость.' : 'Нейтральный тон, деловой стиль.'} Хороший кандидат для допродажи.`,
    };

    return {
        aggression,
        joy,
        stress,
        disappointment,
        gratitude,
        sarcasm,
        urgencyIndex,
        manipulationRisk,
        churnProbability,
        factsRatio,
        emotionsRatio,
        keywords: extractKeywords(description, type),
        aiSummaryRu: summaryMap[type],
    };
}

// ──────────────────────────────────────────────
// Основной анализ (keyword-based, синхронный)
// ──────────────────────────────────────────────

interface AnalyzeInput {
    name: string;
    phone: string;
    accountType: AccountType;
    description: string;
    caseTheme?: RequestType;
}

export function analyzeRequest(input: AnalyzeInput): BankRequest {
    const { name, phone, accountType, description, caseTheme } = input;

    const classification = classifyText(description);

    let finalType = caseTheme || classification.type;
    let finalPriority = classification.priority;

    if (classification.type === 'Security/Scam') {
        finalType = 'Security/Scam';
        finalPriority = 'URGENT';
    }

    if (caseTheme === 'Security/Scam' && finalPriority !== 'URGENT') {
        finalPriority = 'HIGH';
    }

    const matchedRule = CLASSIFICATION_RULES.find(r => r.type === finalType) || CLASSIFICATION_RULES[3];

    const suggestedActions: AiAction[] = matchedRule.actions.map((label, i) => ({
        id: `act-${Date.now()}-${i}`,
        label,
        checked: false,
    }));

    const reasoningQuotes: AiReasoning[] = classification.matchedKeywords
        .slice(0, 4)
        .map(match => ({
            quote: match.sentence,
            keyword: match.keyword,
            explanation: CLASSIFICATION_RULES[match.ruleIndex].explanationTemplate(match.keyword),
        }));

    if (reasoningQuotes.length === 0) {
        const typeLabels: Record<RequestType, string> = {
            'Security/Scam': 'Безопасность / Мошенничество',
            'Transaction Problem': 'Проблема с транзакцией',
            'Technical Issue': 'Техническая проблема',
            'General Inquiry': 'Общий вопрос',
        };
        reasoningQuotes.push({
            quote: description.substring(0, 100),
            keyword: '',
            explanation: `Клиент вручную выбрал категорию «${typeLabels[finalType]}». Специфические ключевые слова риска не обнаружены.`,
        });
    }

    const summary = generateSummary(finalType, description, classification.matchedKeywords.map(m => m.keyword));

    return {
        id: generateId(),
        type: finalType,
        priority: finalPriority,
        status: 'Unread',
        customerData: { name, phone, accountType },
        description,
        createdAt: new Date(),
        aiResponse: { summary, suggestedActions, reasoningQuotes },
        sentiment: generateSentiment(description, finalType, finalPriority),
    };
}

// ──────────────────────────────────────────────
// LLM анализ (асинхронный)
// ──────────────────────────────────────────────

export async function analyzeRequestWithLLM(
    input: AnalyzeInput,
    llmSettings: LLMSettings,
): Promise<BankRequest> {
    const { name, phone, accountType, description, caseTheme } = input;

    try {
        const llmResult = await callLLM(llmSettings, description);

        const validTypes: RequestType[] = ['General Inquiry', 'Technical Issue', 'Transaction Problem', 'Security/Scam'];
        const validPriorities: RequestPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

        const finalType: RequestType = validTypes.includes(llmResult.type) ? llmResult.type : (caseTheme || 'General Inquiry');
        const finalPriority: RequestPriority = validPriorities.includes(llmResult.priority) ? llmResult.priority : 'MEDIUM';

        const suggestedActions: AiAction[] = (llmResult.suggestedActions || []).map((label: string, i: number) => ({
            id: `act-${Date.now()}-${i}`,
            label,
            checked: false,
        }));

        const reasoningQuotes: AiReasoning[] = (llmResult.reasoning || []).map((r: any) => ({
            quote: r.quote || '',
            keyword: r.keyword || '',
            explanation: r.explanation || '',
        }));

        if (reasoningQuotes.length === 0) {
            reasoningQuotes.push({
                quote: description.substring(0, 100),
                keyword: '',
                explanation: 'ИИ не выделил конкретных ключевых фраз в обращении.',
            });
        }

        return {
            id: generateId(),
            type: finalType,
            priority: finalPriority,
            status: 'Unread',
            customerData: { name, phone, accountType },
            description,
            createdAt: new Date(),
            aiResponse: {
                summary: llmResult.summary || 'Обращение проанализировано ИИ.',
                suggestedActions,
                reasoningQuotes,
            },
            sentiment: generateSentiment(description, finalType, finalPriority),
        };
    } catch (error) {
        console.error('LLM ошибка, используется fallback:', error);
        // Fallback на keywords если LLM не сработал
        return analyzeRequest(input);
    }
}
