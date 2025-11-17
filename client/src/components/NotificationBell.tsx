import { useState, useEffect } from "react";
import { Bell, Trash2, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const notificationsQuery = trpc.notifications.list.useQuery();
  const unreadCountQuery = trpc.notifications.unreadCount.useQuery();
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation();
  const deleteAllMutation = trpc.notifications.deleteAll.useMutation();
  const deleteNotificationMutation = trpc.notifications.delete.useMutation();

  const notifications = notificationsQuery.data || [];
  const unreadCount = unreadCountQuery.data || 0;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      await unreadCountQuery.refetch();
      toast.success("Todas as notificações marcadas como lidas");
    } catch (error) {
      toast.error("Erro ao marcar notificações como lidas");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllMutation.mutateAsync();
      await notificationsQuery.refetch();
      toast.success("Todas as notificações deletadas");
    } catch (error) {
      toast.error("Erro ao deletar notificações");
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await deleteNotificationMutation.mutateAsync(id);
      await notificationsQuery.refetch();
      toast.success("Notificação deletada");
    } catch (error) {
      toast.error("Erro ao deletar notificação");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-foreground hover:bg-secondary/20 rounded-lg transition-colors"
        title="Notificações"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
          <Card className="border-0 shadow-none">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Notificações</h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="space-y-2 p-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.isRead === 0
                          ? "bg-primary/10 border-primary/30"
                          : "bg-secondary/10 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Nenhuma notificação</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t border-border flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Ler Todas
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 text-xs"
                  onClick={handleDeleteAll}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Excluir Todas
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
