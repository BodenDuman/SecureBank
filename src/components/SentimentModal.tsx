import { Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SentimentAnalysis } from "@/types/alerts";

// ─── Gauge — fixed: number on arc, label clearly below ───────────────────────
function GaugeChart({ value }: { value: number }) {
  const R = 72;
  const CX = 100;
  const CY = 95;
  const STROKE = 18;

  function polarToXY(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) };
  }

  const bgStart = polarToXY(180, R);
  const bgEnd   = polarToXY(0,   R);

  // clamp fillAngle so the arc never disappears
  const fillAngle = 180 - Math.max(2, (value / 100) * 180);
  const fillEnd   = polarToXY(fillAngle, R);
  // A semi-circle is exactly 180 degrees, so we NEVER need the large arc flag
  const largeArc  = 0;

  const isCritical = value >= 70;
  const isModerate = value >= 40;
  const color = isCritical ? "#ef4444" : isModerate ? "#f59e0b" : "#22c55e";

  const needle = polarToXY(fillAngle, R - 12);

  const label = isCritical ? "Критично" : isModerate ? "Умеренно" : "Норма";
  const labelBg = isCritical
    ? "#fef2f2" : isModerate
    ? "#fffbeb" : "#f0fdf4";
  const labelCol = isCritical
    ? "#ef4444" : isModerate
    ? "#d97706" : "#16a34a";

  return (
    <svg width="200" height="142" viewBox="0 0 200 142">
      {/* Background arc */}
      <path
        d={`M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 0 1 ${bgEnd.x} ${bgEnd.y}`}
        fill="none" stroke="#e2e8f0" strokeWidth={STROKE} strokeLinecap="round"
      />
      {/* Filled arc */}
      {value > 0 && (
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`}
          fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round"
        />
      )}
      {/* Needle */}
      <line x1={CX} y1={CY} x2={needle.x} y2={needle.y}
        stroke="#1e293b" strokeWidth={3} strokeLinecap="round" />
      <circle cx={CX} cy={CY} r={6} fill="#1e293b" />

      {/* Value: centred ABOVE the pivot — in the open space of the arc */}
      <text x={CX} y={CY - 16}
        textAnchor="middle" fontSize="28" fontWeight="800" fill="#1e293b">
        {value}
      </text>

      {/* Label badge: clearly BELOW the pivot, given ample vertical space */}
      <rect x={CX - 36} y={CY + 16} width={72} height={22} rx={11} fill={labelBg} />
      <text x={CX} y={CY + 31}
        textAnchor="middle" fontSize="11" fontWeight="700" fill={labelCol}>
        {label}
      </text>
    </svg>
  );
}

// ─── Keyword badge colours ────────────────────────────────────────────────────
const KW_STYLE: Record<string, string> = {
  danger:  "bg-destructive/10 text-destructive border border-destructive/20",
  warning: "bg-warning/10 text-warning-foreground border border-warning/20",
  safe:    "bg-success/10 text-success border border-success/20",
};

interface SentimentModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string;
  sentiment: SentimentAnalysis;
}

export function SentimentModal({ open, onClose, caseId, sentiment }: SentimentModalProps) {

  // ── Radar: floor of 15 so the polygon is always visible ──────────────────
  const MIN_RADAR = 15;
  const radarData = [
    { axis: "Агрессия",      value: Math.max(MIN_RADAR, sentiment.aggression) },
    { axis: "Радость",       value: Math.max(MIN_RADAR, sentiment.joy) },
    { axis: "Стресс",        value: Math.max(MIN_RADAR, sentiment.stress) },
    { axis: "Разочарование", value: Math.max(MIN_RADAR, sentiment.disappointment) },
    { axis: "Благодарность", value: Math.max(MIN_RADAR, sentiment.gratitude) },
    { axis: "Сарказм",       value: Math.max(MIN_RADAR, sentiment.sarcasm) },
  ];

  // ── Donut ─────────────────────────────────────────────────────────────────
  const risk = sentiment.manipulationRisk;
  const donutFill =
    risk >= 60 ? "#ef4444" : risk >= 30 ? "#f59e0b" : "#22c55e";
  const donutBg =
    risk >= 60 ? "#fee2e2" : risk >= 30 ? "#fef3c7" : "#dcfce7";
  const manipLabel =
    risk >= 60 ? "Высокий риск" : risk >= 30 ? "Средний риск" : "Низкий риск";
  const badgeBg =
    risk >= 60 ? "bg-destructive text-white" : risk >= 30 ? "bg-warning text-warning-foreground" : "bg-success/10 text-success";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/*  ← wider modal: max-w-5xl, bigger padding  */}
      <DialogContent className="max-w-5xl w-full max-h-[92vh] overflow-y-auto p-0 gap-0">

        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-row items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6"  y1="20" x2="6"  y2="14" />
          </svg>
          <DialogTitle className="text-base font-semibold text-foreground m-0">
            ИИ-анализ настроения и рисков
          </DialogTitle>
          <span className="ml-2 text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-md border">
            {caseId}
          </span>
        </DialogHeader>

        <div className="p-6 space-y-5">

          {/* ── Row 1: 3 cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* Эмоциональный профиль */}
            <div className="bg-background border rounded-xl p-4 flex flex-col items-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Эмоциональный профиль
              </p>
              {/* Taller + generous margins so all 6 labels fit */}
              <div className="w-full" style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={radarData}
                    margin={{ top: 28, right: 48, bottom: 28, left: 48 }}
                  >
                    <PolarGrid gridType="polygon" stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }}
                      tickSize={5}
                    />
                    <Radar
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.25}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#3b82f6" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {/* Top-2 emotions */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[...radarData]
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 2)
                  .map(d => (
                    <span
                      key={d.axis}
                      className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-semibold"
                    >
                      {d.axis} — {d.value}
                    </span>
                  ))}
              </div>
            </div>

            {/* Индекс срочности */}
            <div className="bg-background border rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Индекс срочности
              </p>
              <GaugeChart value={sentiment.urgencyIndex} />
            </div>

            {/* Риск манипуляции — pure SVG donut, center is exact */}
            <div className="bg-background border rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Риск манипуляции
              </p>
              {/* Outer container — position:relative so the overlay can anchor to it */}
              <div style={{ position: "relative", width: 200, height: 200 }}>
                {/* SVG: only the donut ring, no text inside */}
                {(() => {
                  const r = 70;
                  const circumference = 2 * Math.PI * r;
                  const filled = (risk / 100) * circumference;
                  return (
                    <svg width="200" height="200" viewBox="0 0 200 200">
                      {/* Track */}
                      <circle cx="100" cy="100" r={r} fill="none" stroke={donutBg} strokeWidth="24" />
                      {/* Filled arc — starts from top */}
                      <circle
                        cx="100" cy="100" r={r}
                        fill="none"
                        stroke={donutFill}
                        strokeWidth="24"
                        strokeLinecap="round"
                        strokeDasharray={`${filled} ${circumference}`}
                        transform="rotate(-90 100 100)"
                      />
                    </svg>
                  );
                })()}

                {/* Central overlay — perfectly centred via CSS transform */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  zIndex: 10,
                  pointerEvents: "none",
                }}>
                  {/* Shield icon — lucide, amber color, small */}
                  <Shield size={20} color="#D97706" strokeWidth={2} />
                  {/* Percentage — dark gray, bold, slightly larger */}
                  <span style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#1F2937",
                    lineHeight: 1,
                  }}>
                    {risk}%
                  </span>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeBg}`}>
                {manipLabel}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Социальная инженерия
              </span>
            </div>
          </div>

          {/* ── Row 2: 2 cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Структура сообщения */}
            <div className="bg-background border rounded-xl p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Структура сообщения
              </p>
              <div className="relative h-7 rounded-full overflow-hidden flex mb-3">
                <div className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${sentiment.factsRatio}%` }} />
                <div className="h-full bg-destructive transition-all duration-700"
                  style={{ width: `${sentiment.emotionsRatio}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-3 px-0.5">
                {[0, 25, 50, 75, 100].map(n => <span key={n}>{n}</span>)}
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-primary">
                  <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                  Факты: {sentiment.factsRatio}%
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-destructive">
                  <span className="w-3 h-3 rounded-full bg-destructive inline-block" />
                  Эмоции: {sentiment.emotionsRatio}%
                </span>
              </div>
            </div>

            {/* Вероятность оттока */}
            <div className="bg-background border rounded-xl p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Вероятность оттока
              </p>
              <div className="relative w-full h-7 rounded-full overflow-hidden bg-muted mb-2">
                <div className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(to right, #22c55e, #f59e0b, #ef4444)" }} />
                <div className="absolute inset-y-0 right-0 bg-muted rounded-r-full transition-all duration-700"
                  style={{ width: `${100 - sentiment.churnProbability}%` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white drop-shadow-sm">
                    {sentiment.churnProbability}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Низкий риск</span>
                <span>Высокий риск</span>
              </div>
            </div>
          </div>

          {/* ── Keywords ─────────────────────────────────────────────────────── */}
          <div className="bg-background border rounded-xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Ключевые слова
            </p>
            <div className="flex flex-wrap gap-2">
              {sentiment.keywords.map((kw, i) => (
                <span
                  key={i}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium ${KW_STYLE[kw.type]}`}
                >
                  {kw.word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
