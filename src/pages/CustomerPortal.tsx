import { useState } from "react";
import { Shield, CheckCircle2, Phone, User, FileText, Building2, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useRequestStore } from "@/store/requestStore";
import { useLLMSettings } from "@/store/llmStore";
import { analyzeRequest, analyzeRequestWithLLM } from "@/hooks/useAnalyzeRequest";
import { RequestType, AccountType } from "@/types/alerts";

const CASE_THEMES: { value: RequestType; label: string; icon: string }[] = [
  { value: "General Inquiry", label: "Общий вопрос", icon: "💬" },
  { value: "Technical Issue", label: "Техническая проблема", icon: "🔧" },
  { value: "Transaction Problem", label: "Проблема с транзакцией", icon: "💳" },
  { value: "Security/Scam", label: "Безопасность / Мошенничество", icon: "🛡️" },
];

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "Personal", label: "Личный" },
  { value: "Business", label: "Бизнес" },
];

const MAX_DESCRIPTION_LENGTH = 2000;

const CustomerPortal = () => {
  const navigate = useNavigate();
  const { addRequest } = useRequestStore();
  const { settings, isConfigured } = useLLMSettings();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    description: "",
    caseTheme: "General Inquiry" as RequestType,
    accountType: "Personal" as AccountType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let request;

      if (isConfigured) {
        // Используем LLM для анализа
        request = await analyzeRequestWithLLM(
          {
            name: form.name,
            phone: form.phone,
            accountType: form.accountType,
            description: form.description,
            caseTheme: form.caseTheme,
          },
          settings,
        );
      } else {
        // Используем keyword-based анализ
        request = analyzeRequest({
          name: form.name,
          phone: form.phone,
          accountType: form.accountType,
          description: form.description,
          caseTheme: form.caseTheme,
        });
      }

      addRequest(request);
      setCaseId(request.id);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setForm({
          name: "",
          phone: "",
          description: "",
          caseTheme: "General Inquiry",
          accountType: "Personal",
        });
      }, 5000);
    } catch (error) {
      console.error('Ошибка при отправке:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const descLength = form.description.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Шапка */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">SecureBank</h1>
              <p className="text-xs text-muted-foreground">Центр поддержки клиентов</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => navigate("/dashboard")}
          >
            Вход для менеджера
          </Button>
        </div>
      </header>

      {/* Контент */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Чем мы можем помочь?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
              Отправьте ваш запрос ниже. Наша ИИ-система автоматически классифицирует и приоритизирует вашу заявку для максимально быстрого решения.
            </p>
          </div>

          {submitted ? (
            <div className="bg-card border rounded-xl p-8 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Заявка отправлена</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Ваш запрос принят и классифицирован. Менеджер рассмотрит вашу заявку в ближайшее время.
              </p>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-mono font-semibold">
                Номер заявки: {caseId}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 sm:p-8 space-y-5">
              {/* ФИО */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  ФИО
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="Введите ваше полное имя"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-11"
                />
              </div>

              {/* Телефон */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  Номер телефона
                </Label>
                <Input
                  id="phone"
                  required
                  type="tel"
                  placeholder="+7 (700) 000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-11"
                />
              </div>

              {/* Тип счёта */}
              <div className="space-y-2">
                <Label htmlFor="accountType" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Тип счёта
                </Label>
                <select
                  id="accountType"
                  value={form.accountType}
                  onChange={(e) => setForm({ ...form, accountType: e.target.value as AccountType })}
                  className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Тема обращения */}
              <div className="space-y-2">
                <Label htmlFor="caseTheme" className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  Тема обращения
                </Label>
                <select
                  id="caseTheme"
                  value={form.caseTheme}
                  onChange={(e) => setForm({ ...form, caseTheme: e.target.value as RequestType })}
                  className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {CASE_THEMES.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                      {theme.icon} {theme.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Описание */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="desc" className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    Описание проблемы
                  </Label>
                  <span className={`text-xs font-mono ${descLength > MAX_DESCRIPTION_LENGTH * 0.9
                      ? 'text-destructive'
                      : descLength > MAX_DESCRIPTION_LENGTH * 0.7
                        ? 'text-warning'
                        : 'text-muted-foreground'
                    }`}>
                    {descLength}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="desc"
                  required
                  placeholder="Опишите вашу проблему подробно. Чем больше деталей вы предоставите, тем быстрее мы сможем помочь..."
                  rows={5}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="resize-none"
                />
              </div>

              <Button type="submit" className="w-full h-11 font-medium gap-2" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Анализ ИИ...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Отправить заявку
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Все обращения зашифрованы и обрабатываются конфиденциально.
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerPortal;
