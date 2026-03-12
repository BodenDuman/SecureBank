import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLLMSettings, LLMProvider as LLMProviderType } from "@/store/llmStore";
import { Shield, Key, Brain, ArrowLeft, Check, Eye, EyeOff, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const PROVIDERS: { value: LLMProviderType; label: string; placeholder: string; models: string[] }[] = [
    {
        value: "openai",
        label: "OpenAI",
        placeholder: "sk-...",
        models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"],
    },
    {
        value: "anthropic",
        label: "Anthropic",
        placeholder: "sk-ant-...",
        models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"],
    },
];

const SettingsPage = () => {
    const navigate = useNavigate();
    const { settings, updateSettings, isConfigured } = useLLMSettings();
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    const currentProvider = PROVIDERS.find(p => p.value === settings.provider) || PROVIDERS[0];

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Шапка */}
            <header className="border-b bg-card">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-foreground tracking-tight">SecureBank</h1>
                            <p className="text-xs text-muted-foreground">Настройки ИИ</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="w-4 h-4" />
                        Назад
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex items-start justify-center px-4 py-10">
                <div className="w-full max-w-lg space-y-6 animate-fade-in">
                    {/* Заголовок */}
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Settings2 className="w-7 h-7 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Настройки ИИ-движка</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Подключите LLM для интеллектуальной классификации обращений
                        </p>
                    </div>

                    {/* Статус */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${isConfigured
                            ? 'bg-success/5 border-success/20'
                            : 'bg-muted/50 border-border'
                        }`}>
                        <Brain className={`w-5 h-5 ${isConfigured ? 'text-success' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                                {isConfigured ? 'ИИ-движок подключён' : 'ИИ-движок не настроен'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isConfigured
                                    ? `${currentProvider.label} • ${settings.model}`
                                    : 'Используется встроенный классификатор на основе ключевых слов'}
                            </p>
                        </div>
                        <Badge variant={isConfigured ? 'default' : 'secondary'} className={isConfigured ? 'bg-success' : ''}>
                            {isConfigured ? 'Активен' : 'Выкл'}
                        </Badge>
                    </div>

                    {/* Форма */}
                    <div className="bg-card border rounded-xl p-6 space-y-5">
                        {/* Включить / выключить */}
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Использовать LLM</Label>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={settings.enabled}
                                onClick={() => updateSettings({ enabled: !settings.enabled })}
                                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}
                `}
                            >
                                <span
                                    className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                                />
                            </button>
                        </div>

                        {/* Провайдер */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Brain className="w-3.5 h-3.5 text-muted-foreground" />
                                Провайдер
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {PROVIDERS.map((provider) => (
                                    <button
                                        key={provider.value}
                                        onClick={() => updateSettings({ provider: provider.value })}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${settings.provider === provider.value
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-background border-border text-muted-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        {provider.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* API ключ */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Key className="w-3.5 h-3.5 text-muted-foreground" />
                                API ключ
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showKey ? "text" : "password"}
                                    placeholder={currentProvider.placeholder}
                                    value={settings.apiKey}
                                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                                    className="h-11 pr-10 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Ключ хранится локально в браузере и не передаётся на сервер
                            </p>
                        </div>

                        {/* Модель */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Модель</Label>
                            <select
                                value={settings.model}
                                onChange={(e) => updateSettings({ model: e.target.value })}
                                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                {currentProvider.models.map((model) => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>

                        <Button onClick={handleSave} className="w-full h-11 gap-2">
                            {saved ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Сохранено
                                </>
                            ) : (
                                <>
                                    <Key className="w-4 h-4" />
                                    Сохранить настройки
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        Без настроенного LLM система использует встроенный классификатор на основе ключевых слов.
                        При подключении LLM классификация станет более точной и гибкой.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
