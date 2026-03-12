import { BankRequest, RequestType } from "@/types/alerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentModal } from "@/components/SentimentModal";
import { useState } from "react";
import {
  Shield,
  Brain,
  ListChecks,
  MessageSquareText,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  Clock,
  Lightbulb,
  Building2,
  Zap,
  BarChart2,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface CaseDetailProps {
  request: BankRequest;
  onToggleAction: (requestId: string, actionId: string) => void;
  onResolve: (requestId: string) => void;
}

const priorityConfig: Record<string, { label: string; className: string; borderClass: string }> = {
  URGENT: {
    label: "🔴 СРОЧНО — Безопасность",
    className: "bg-destructive text-destructive-foreground",
    borderClass: "border-t-destructive",
  },
  HIGH: {
    label: "🟡 ВЫСОКИЙ — Требуется действие",
    className: "bg-warning text-warning-foreground",
    borderClass: "border-t-warning",
  },
  MEDIUM: {
    label: "🔵 СРЕДНИЙ — Стандартный",
    className: "bg-primary/15 text-primary",
    borderClass: "border-t-primary",
  },
  LOW: {
    label: "⚪ НИЗКИЙ — Информационный",
    className: "bg-muted text-muted-foreground",
    borderClass: "border-t-muted-foreground/30",
  },
};

const typeConfig: Record<RequestType, { label: string; className: string }> = {
  "Security/Scam": {
    label: "Безопасность / Мошенничество",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  "Transaction Problem": {
    label: "Проблема с транзакцией",
    className: "bg-warning/10 text-warning-foreground border-warning/20",
  },
  "Technical Issue": {
    label: "Техническая проблема",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  "General Inquiry": {
    label: "Общий вопрос",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const statusLabels: Record<string, string> = {
  Unread: "Новая",
  "In Analysis": "На рассмотрении",
  "Action Required": "Требуется действие",
  Resolved: "Решено",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  Unread: { label: "Новая", className: "bg-destructive/10 text-destructive border-destructive/20" },
  "In Analysis": { label: "На рассмотрении", className: "bg-warning/10 text-warning-foreground border-warning/20" },
  "Action Required": { label: "Требуется действие", className: "bg-primary/10 text-primary border-primary/20" },
  Resolved: { label: "Решено", className: "bg-success/10 text-success border-success/20" },
};

function highlightKeyword(text: string, keyword: string): React.ReactNode {
  if (!keyword) return <span className="text-highlight font-medium">«{text}»</span>;

  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);

  if (index === -1) {
    return <span className="text-highlight font-medium">«{text}»</span>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + keyword.length);
  const after = text.slice(index + keyword.length);

  return (
    <span>
      «{before}
      <span className="bg-destructive/20 text-destructive font-bold px-0.5 rounded-sm border border-destructive/30">
        {match}
      </span>
      {after}»
    </span>
  );
}

export function CaseDetail({ request, onToggleAction, onResolve }: CaseDetailProps) {
  const priority = priorityConfig[request.priority];
  const type = typeConfig[request.type];
  const status = statusConfig[request.status];
  const [sentimentOpen, setSentimentOpen] = useState(false);

  const completedActions = request.aiResponse.suggestedActions.filter(a => a.checked).length;
  const totalActions = request.aiResponse.suggestedActions.length;

  return (
    <div className={`p-4 sm:p-6 max-w-6xl mx-auto animate-fade-in border-t-4 ${priority.borderClass}`} key={request.id}>
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Заявка {request.id}
          </h1>
          <Badge className={priority.className}>{priority.label}</Badge>
          <Badge variant="outline" className={type.className}>{type.label}</Badge>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            {request.sentiment && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => setSentimentOpen(true)}
              >
                <BarChart2 className="w-4 h-4" />
                Глубокий ИИ-анализ
              </Button>
            )}
            {request.status !== "Resolved" && (
              <Button
                onClick={() => onResolve(request.id)}
                className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
              >
                <CheckCircle2 className="w-4 h-4" />
                Обработать заявку
              </Button>
            )}
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Левая колонка: Обращение клиента */}
        <div className="space-y-4">
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquareText className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Обращение клиента</h2>
            </div>

            <div className="flex flex-col gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span className="font-medium text-foreground">{request.customerData.name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <span>{request.customerData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                <span>Счёт: <span className="font-medium text-foreground">
                  {request.customerData.accountType === 'Personal' ? 'Личный' : 'Бизнес'}
                </span></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{format(request.createdAt, "d MMM yyyy, HH:mm", { locale: ru })}</span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
          </div>
        </div>

        {/* Правая колонка: ИИ-аналитика */}
        <div className="space-y-4">
          {/* ИИ-Анализ ситуации (Sentiment Overview) */}
          {request.sentiment && (
            <SentimentOverview sentiment={request.sentiment} />
          )}

          {/* ИИ-обзор */}
          <div className="bg-card border rounded-xl p-5">

            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">ИИ-анализ</h2>
              <Badge variant="outline" className="text-[10px] ml-auto border-primary/30 text-primary">
                <Shield className="w-2.5 h-2.5 mr-1" /> ИИ-генерация
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{request.aiResponse.summary}</p>

            {/* Следующие шаги */}
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3 h-3 text-warning" />
                <span className="text-xs font-semibold text-foreground">Рекомендуемые шаги</span>
              </div>
              <ul className="space-y-1">
                {request.aiResponse.suggestedActions.slice(0, 3).map(action => (
                  <li key={action.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className={`w-1 h-1 rounded-full shrink-0 ${action.checked ? 'bg-success' : 'bg-warning'}`} />
                    <span className={action.checked ? 'line-through' : ''}>{action.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Рекомендованные действия */}
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Рекомендованные действия</h2>
              <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                {completedActions}/{totalActions} выполнено
              </span>
            </div>
            {/* Прогресс */}
            <div className="w-full h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-300"
                style={{ width: `${totalActions > 0 ? (completedActions / totalActions) * 100 : 0}%` }}
              />
            </div>
            <div className="space-y-3">
              {request.aiResponse.suggestedActions.map((action) => (
                <label
                  key={action.id}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={action.checked}
                    onCheckedChange={() => onToggleAction(request.id, action.id)}
                    className="mt-0.5"
                  />
                  <span
                    className={`text-sm transition-colors ${action.checked
                      ? "text-muted-foreground line-through"
                      : "text-foreground group-hover:text-primary"
                      }`}
                  >
                    {action.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ИИ-обоснование с выделением доказательств */}
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-semibold text-foreground">ИИ-обоснование и доказательства</h2>
            </div>
            <div className="space-y-4">
              {request.aiResponse.reasoningQuotes.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-warning mt-1 shrink-0" />
                    <p className="text-sm">
                      {highlightKeyword(item.quote, item.keyword)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно глубокого анализа */}
      {request.sentiment && (
        <SentimentModal
          open={sentimentOpen}
          onClose={() => setSentimentOpen(false)}
          caseId={request.id}
          sentiment={request.sentiment}
        />
      )}
    </div>
  );
}
