import { useState } from "react";
import { useRequestStore } from "@/store/requestStore";
import { AlertSidebar } from "@/components/AlertSidebar";
import { CaseDetail } from "@/components/CaseDetail";
import { Shield, Menu, X, Inbox, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { state, toggleAction, updateStatus, deleteRequest, setSelected, getSortedRequests } = useRequestStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sortedRequests = getSortedRequests();
  const selectedRequest = sortedRequests.find((r) => r.id === state.selectedId) || sortedRequests[0];

  const handleToggleAction = (requestId: string, actionId: string) => {
    toggleAction(requestId, actionId);
  };

  const handleResolve = (requestId: string) => {
    updateStatus(requestId, "Resolved");
  };

  const urgentCount = sortedRequests.filter(r => r.priority === 'URGENT' && r.status !== 'Resolved').length;
  const highCount = sortedRequests.filter(r => r.priority === 'HIGH' && r.status !== 'Resolved').length;
  const normalCount = sortedRequests.filter(r => (r.priority === 'MEDIUM' || r.priority === 'LOW') && r.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Верхняя панель */}
      <header className="h-14 border-b bg-card flex items-center px-4 gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground text-sm tracking-tight">
            SecureBank <span className="text-muted-foreground font-normal">— Центр операций</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {sortedRequests.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              {urgentCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  {urgentCount} Срочных
                </span>
              )}
              {highCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  {highCount} Высоких
                </span>
              )}
              {normalCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary/40" />
                  {normalCount} Обычных
                </span>
              )}
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} title="Настройки ИИ">
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            Портал клиента
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Боковая панель */}
        <div
          className={`
            fixed inset-y-14 left-0 z-30 w-80 bg-card border-r transform transition-transform duration-200
            lg:static lg:translate-x-0 lg:z-auto
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <AlertSidebar
            requests={sortedRequests}
            selectedId={state.selectedId}
            onSelect={(id) => {
              setSelected(id);
              setSidebarOpen(false);
            }}
            onDelete={(id) => deleteRequest(id)}
          />
        </div>

        {/* Затемнение */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-foreground/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Основной контент */}
        <main className="flex-1 overflow-y-auto">
          {selectedRequest ? (
            <CaseDetail
              request={selectedRequest}
              onToggleAction={handleToggleAction}
              onResolve={handleResolve}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Нет обращений</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Когда клиенты отправят свои обращения через портал, они автоматически появятся здесь с ИИ-классификацией и рекомендациями.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
