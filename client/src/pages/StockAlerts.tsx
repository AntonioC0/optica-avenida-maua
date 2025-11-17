import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, AlertTriangle, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Stock Alerts page for owner/manager
 */
export default function StockAlerts() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingMinStock, setEditingMinStock] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Queries
  const lowStockQuery = trpc.alerts.lowStock.useQuery();
  const updateMinStockMutation = trpc.alerts.updateMinStock.useMutation();

  useEffect(() => {
    if (!loading && user && user.role !== 'owner' && user.role !== 'manager') {
      setLocation('/sales');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  const handleEditMinStock = (productId: number, currentMinStock: number) => {
    setEditingId(productId);
    setEditingMinStock(currentMinStock.toString());
  };

  const handleSaveMinStock = async () => {
    if (!editingId) return;

    const minStock = parseInt(editingMinStock);
    if (isNaN(minStock) || minStock < 0) {
      toast.error("Valor inválido para estoque mínimo");
      return;
    }

    try {
      await updateMinStockMutation.mutateAsync({
        productId: editingId,
        minStock,
      });
      toast.success("Estoque mínimo atualizado com sucesso");
      setEditingId(null);
      setEditingMinStock("");
      lowStockQuery.refetch();
    } catch (error) {
      toast.error("Erro ao atualizar estoque mínimo");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingMinStock("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  const lowStockProducts = lowStockQuery.data || [];
  const criticalCount = lowStockProducts.filter(p => p.quantity === 0).length;
  const warningCount = lowStockProducts.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length;

  return (
    <div className="min-h-screen bg-background pb-24 pt-0">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Alertas de Estoque
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Low Stock */}
            <Card className="border-l-4 border-l-accent">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Produtos com Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {lowStockQuery.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    lowStockProducts.length
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Abaixo do limite mínimo</p>
              </CardContent>
            </Card>

            {/* Critical Stock */}
            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sem Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {lowStockQuery.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    criticalCount
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Quantidade zerada</p>
              </CardContent>
            </Card>

            {/* Warning Stock */}
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aviso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {lowStockQuery.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    warningCount
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Próximo ao limite</p>
              </CardContent>
            </Card>
          </div>

          {/* Products List */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos com Estoque Baixo</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin w-6 h-6 text-primary" />
                </div>
              ) : lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition ${
                        product.quantity === 0
                          ? 'border-destructive bg-destructive/5'
                          : 'border-yellow-500 bg-yellow-500/5'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Preço: {formatCurrency(product.price)}
                            </p>
                          </div>
                          {product.quantity === 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
                              SEM ESTOQUE
                            </span>
                          )}
                          {product.quantity > 0 && product.quantity <= product.minStock && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-yellow-900">
                              AVISO
                            </span>
                          )}
                        </div>
                        <div className="flex gap-6 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Quantidade atual: </span>
                            <span className="font-semibold text-foreground">{product.quantity}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Estoque mínimo: </span>
                            <span className="font-semibold text-foreground">{product.minStock}</span>
                          </div>
                        </div>
                      </div>

                      {editingId === product.id ? (
                        <div className="flex gap-2 items-center ml-4">
                          <Input
                            type="number"
                            min="0"
                            value={editingMinStock}
                            onChange={(e) => setEditingMinStock(e.target.value)}
                            className="w-20"
                            placeholder="Min"
                          />
                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground"
                            onClick={handleSaveMinStock}
                            disabled={updateMinStockMutation.isPending}
                          >
                            {updateMinStockMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Salvar'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditMinStock(product.id, product.minStock)}
                          className="ml-4"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-lg font-semibold mb-2">Todos os produtos estão com estoque adequado!</div>
                  <p>Nenhum produto abaixo do nível mínimo de estoque.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
