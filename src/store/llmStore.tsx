import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ──────────────────────────────────────────────
// Типы
// ──────────────────────────────────────────────

export type LLMProvider = 'openai' | 'anthropic';

export interface LLMSettings {
    provider: LLMProvider;
    apiKey: string;
    model: string;
    enabled: boolean;
}

const STORAGE_KEY = 'securebank_llm_settings';

const DEFAULT_MODELS: Record<LLMProvider, string> = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-sonnet-4-20250514',
};

// ──────────────────────────────────────────────
// LocalStorage
// ──────────────────────────────────────────────

function loadSettings(): LLMSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { provider: 'openai', apiKey: '', model: 'gpt-4o-mini', enabled: false };
        return JSON.parse(raw);
    } catch {
        return { provider: 'openai', apiKey: '', model: 'gpt-4o-mini', enabled: false };
    }
}

function saveSettings(settings: LLMSettings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // ignore
    }
}

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────

interface LLMContextValue {
    settings: LLMSettings;
    updateSettings: (settings: Partial<LLMSettings>) => void;
    isConfigured: boolean;
}

const LLMContext = createContext<LLMContextValue | undefined>(undefined);

export function LLMProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<LLMSettings>(loadSettings);

    useEffect(() => {
        saveSettings(settings);
    }, [settings]);

    const updateSettings = (partial: Partial<LLMSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...partial };
            // Auto-set default model when provider changes
            if (partial.provider && partial.provider !== prev.provider && !partial.model) {
                updated.model = DEFAULT_MODELS[partial.provider];
            }
            return updated;
        });
    };

    const isConfigured = settings.enabled && settings.apiKey.length > 10;

    return (
        <LLMContext.Provider value={{ settings, updateSettings, isConfigured }}>
            {children}
        </LLMContext.Provider>
    );
}

export function useLLMSettings() {
    const context = useContext(LLMContext);
    if (!context) {
        throw new Error('useLLMSettings must be used within LLMProvider');
    }
    return context;
}

// ──────────────────────────────────────────────
// API call
// ──────────────────────────────────────────────

const SYSTEM_PROMPT = `Ты — интеллектуальный помощник банковской службы поддержки. Анализируй обращения клиентов и отвечай СТРОГО в формате JSON (без markdown).

Формат ответа:
{
  "type": "Security/Scam" | "Transaction Problem" | "Technical Issue" | "General Inquiry",
  "priority": "URGENT" | "HIGH" | "MEDIUM" | "LOW",
  "summary": "Краткое описание ситуации и рекомендации (2-3 предложения на русском)",
  "suggestedActions": ["действие 1", "действие 2", "действие 3", "действие 4"],
  "reasoning": [
    {
      "quote": "точная цитата из обращения",
      "keyword": "ключевое слово",
      "explanation": "почему это важно"
    }
  ]
}

Правила:
- Мошенничество/скам всегда URGENT
- Проблемы с транзакциями обычно HIGH
- Технические проблемы обычно MEDIUM
- Общие вопросы LOW
- Отвечай ТОЛЬКО на русском языке
- Дай 3-6 рекомендуемых действий
- Выдели 1-4 ключевые фразы из обращения`;

export async function callLLM(settings: LLMSettings, description: string): Promise<any> {
    if (settings.provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiKey}`,
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Обращение клиента:\n\n${description}` },
                ],
                temperature: 0.3,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI API ошибка: ${response.status} — ${err}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        return JSON.parse(content);
    }

    if (settings.provider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': settings.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: settings.model,
                max_tokens: 1000,
                system: SYSTEM_PROMPT,
                messages: [
                    { role: 'user', content: `Обращение клиента:\n\n${description}` },
                ],
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Anthropic API ошибка: ${response.status} — ${err}`);
        }

        const data = await response.json();
        const content = data.content?.[0]?.text || '';
        return JSON.parse(content);
    }

    throw new Error('Неизвестный провайдер');
}
