import { BankRequest, PRIORITY_WEIGHT, RequestType } from "@/types/alerts";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Inbox, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef, useCallback, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface AlertSidebarProps {
  requests: BankRequest[];
  selectedId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  URGENT: "bg-destructive text-destructive-foreground",
  HIGH: "bg-warning text-warning-foreground",
  MEDIUM: "bg-primary/15 text-primary",
  LOW: "bg-muted text-muted-foreground",
};

const priorityLabels: Record<string, string> = {
  URGENT: "СРОЧНО",
  HIGH: "ВЫСОКИЙ",
  MEDIUM: "СРЕДНИЙ",
  LOW: "НИЗКИЙ",
};

const typeIcons: Record<RequestType, string> = {
  "Security/Scam": "🛡️",
  "Transaction Problem": "💳",
  "Technical Issue": "🔧",
  "General Inquiry": "💬",
};

// ──────────────────────────────────────────────
// Swipeable Item
// ──────────────────────────────────────────────

interface SwipeableItemProps {
  request: BankRequest;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SwipeableItem({ request, isSelected, onSelect, onDelete }: SwipeableItemProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDeleteRevealed, setIsDeleteRevealed] = useState(false);
  const offsetRef = useRef(0);
  const revealedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch refs
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isVerticalRef = useRef(false);

  const DELETE_THRESHOLD = 70;

  const updateOffset = useCallback((v: number) => {
    const clamped = Math.min(0, Math.max(-DELETE_THRESHOLD - 20, v));
    offsetRef.current = clamped;
    setOffsetX(clamped);
  }, []);

  const updateRevealed = useCallback((v: boolean) => {
    revealedRef.current = v;
    setIsDeleteRevealed(v);
  }, []);

  const snapToFinal = useCallback(() => {
    if (Math.abs(offsetRef.current) > DELETE_THRESHOLD * 0.35) {
      offsetRef.current = -DELETE_THRESHOLD;
      setOffsetX(-DELETE_THRESHOLD);
      updateRevealed(true);
    } else {
      offsetRef.current = 0;
      setOffsetX(0);
      updateRevealed(false);
    }
    isDraggingRef.current = false;
  }, [updateRevealed]);

  // ── Trackpad (wheel) handler ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scroll (trackpad swipe)
      if (Math.abs(e.deltaX) < 2) return;
      // If mostly vertical, skip
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) * 1.5) return;

      e.preventDefault();
      e.stopPropagation();

      const newOffset = offsetRef.current - e.deltaX;
      updateOffset(newOffset);

      // Reset snap timer on each scroll tick
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      snapTimerRef.current = setTimeout(() => {
        snapToFinal();
      }, 150);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, [updateOffset, snapToFinal]);

  // ── Touch handlers (mobile) ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = false;
    isVerticalRef.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startXRef.current;
    const deltaY = e.touches[0].clientY - startYRef.current;

    if (!isDraggingRef.current && !isVerticalRef.current) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
        isVerticalRef.current = true;
        return;
      }
      if (Math.abs(deltaX) > 5) isDraggingRef.current = true;
    }
    if (isVerticalRef.current || !isDraggingRef.current) return;
    e.preventDefault();

    if (revealedRef.current) {
      updateOffset(deltaX - DELETE_THRESHOLD);
    } else {
      updateOffset(deltaX);
    }
  }, [updateOffset]);

  const handleTouchEnd = useCallback(() => {
    if (isVerticalRef.current) { isVerticalRef.current = false; return; }
    snapToFinal();
  }, [snapToFinal]);

  const handleClick = useCallback(() => {
    if (isDraggingRef.current) return;
    if (isDeleteRevealed) {
      updateOffset(0);
      updateRevealed(false);
      return;
    }
    onSelect();
  }, [isDeleteRevealed, onSelect, updateOffset, updateRevealed]);

  const handleDelete = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onDelete();
  }, [onDelete]);

  return (
    <div ref={containerRef} className="relative rounded-lg" style={{ overflow: 'clip' }}>
      {/* Delete button — only rendered when card is offset */}
      {(offsetX !== 0 || isDeleteRevealed) && (
        <div
          className="absolute inset-y-0 right-0 flex items-center z-0"
          style={{ pointerEvents: isDeleteRevealed ? 'auto' : 'none' }}
        >
          <button
            onClick={handleDelete}
            onTouchEnd={handleDelete}
            className="h-full w-[70px] bg-destructive flex items-center justify-center text-destructive-foreground hover:bg-destructive/90 transition-colors rounded-r-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Swipeable card */}
      <div
        className={`relative z-10 p-3 rounded-lg cursor-pointer select-none transition-transform duration-200 ${isSelected
            ? "border border-primary/20 shadow-sm"
            : "border border-transparent hover:brightness-95"
          } ${request.priority === 'URGENT' && request.status !== 'Resolved' ? 'border-l-[3px] border-l-destructive' : ''}`}
        style={{
          transform: `translateX(${offsetX}px)`,
          backgroundColor: isSelected ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--card))',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
            <span>{typeIcons[request.type]}</span>
            {request.customerData.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {request.status === "Unread" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
              </span>
            )}
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 font-medium ${priorityColors[request.priority]}`}
            >
              {priorityLabels[request.priority]}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed select-none">
          {request.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-muted-foreground font-mono">{request.id}</span>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(request.createdAt, { addSuffix: true, locale: ru })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────

export function AlertSidebar({ requests, selectedId, onSelect, onDelete }: AlertSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = requests
    .filter(
      (r) =>
        r.customerData.name.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.type.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);

  const urgentCount = requests.filter(r => r.priority === 'URGENT' && r.status !== 'Resolved').length;
  const highCount = requests.filter(r => r.priority === 'HIGH' && r.status !== 'Resolved').length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Очередь заявок</h2>
          <div className="flex gap-1.5">
            {urgentCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-destructive/15 text-destructive px-2 py-0.5 rounded-full">
                🔴 {urgentCount}
              </span>
            )}
            {highCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-warning/15 text-warning-foreground px-2 py-0.5 rounded-full">
                🟡 {highCount}
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заявок..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Нет заявок</p>
            <p className="text-xs text-muted-foreground mt-1">
              Новые обращения клиентов появятся здесь
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filtered.map((request) => (
              <SwipeableItem
                key={request.id}
                request={request}
                isSelected={selectedId === request.id}
                onSelect={() => onSelect(request.id)}
                onDelete={() => onDelete(request.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
