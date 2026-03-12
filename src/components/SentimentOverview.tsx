import { Brain, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SentimentAnalysis } from "@/types/alerts";

interface SentimentOverviewProps {
  sentiment: SentimentAnalysis;
}

export function SentimentOverview({ sentiment }: SentimentOverviewProps) {
  const factsWidth = sentiment.factsRatio;
  const emotionsWidth = sentiment.emotionsRatio;

  return (
    <div className="bg-card border rounded-xl p-5">
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">ИИ-Анализ ситуации</h2>
        <Badge
          variant="outline"
          className="text-[10px] ml-auto border-primary/30 text-primary bg-primary/5 gap-1"
        >
          🧠 Создано ИИ
        </Badge>
      </div>

      {/* Резюме на русском */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {sentiment.aiSummaryRu}
      </p>

      {/* Индикатор Факты / Эмоции */}
      <div className="pt-3 border-t border-border/50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-foreground">Соотношение Факты / Эмоции</span>
        </div>
        <div className="relative w-full h-2.5 rounded-full overflow-hidden bg-muted flex">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${factsWidth}%` }}
          />
          <div
            className="h-full bg-destructive transition-all duration-500"
            style={{ width: `${emotionsWidth}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-primary font-medium flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
            Факты {factsWidth}%
          </span>
          <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-destructive" />
            Эмоции {emotionsWidth}%
          </span>
        </div>
      </div>

      {/* Компактные метрики */}
      <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className={`text-sm font-bold ${sentiment.urgencyIndex >= 70 ? 'text-destructive' : sentiment.urgencyIndex >= 40 ? 'text-warning' : 'text-success'}`}>
            {sentiment.urgencyIndex}
          </div>
          <div className="text-[10px] text-muted-foreground">Срочность</div>
        </div>
        <div className="text-center border-x border-border/50">
          <div className={`text-sm font-bold ${sentiment.manipulationRisk >= 60 ? 'text-destructive' : sentiment.manipulationRisk >= 30 ? 'text-warning' : 'text-success'}`}>
            {sentiment.manipulationRisk}%
          </div>
          <div className="text-[10px] text-muted-foreground">Манипуляция</div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-bold ${sentiment.churnProbability >= 60 ? 'text-destructive' : sentiment.churnProbability >= 30 ? 'text-warning' : 'text-success'}`}>
            {sentiment.churnProbability}%
          </div>
          <div className="text-[10px] text-muted-foreground">Отток</div>
        </div>
      </div>
    </div>
  );
}
