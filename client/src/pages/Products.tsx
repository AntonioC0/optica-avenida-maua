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
import { Loader2, Trash2, Edit2, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CategoryManager from "@/components/CategoryManager";

/**
 * Products management page for owner/manager
 */
export default function Products() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    barcode: "",
    price: "",
    quantity: 0,
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("");

  // Queries
  const categoriesQuery = trpc.categories.list.useQuery();
  const productsQuery = trpc.products.list.useQuery();
  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const deleteMutation = trpc.products.delete.useMutation();

  useEffect(() => {
    if (!loading && user && user.role !== 'owner' && user.role !== 'manager') {
      setLocation('/sales');
    }
  }, [user, loading, setLocation]);

  const handleBarcodeRead = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      setFormData({ ...formData, barcode: barcodeInput });
      setBarcodeInput("");
      toast.success("Código de barras lido com sucesso");
    }
  };

  const handleAddQuantity = () => {
    setFormData({ ...formData, quantity: formData.quantity + 1 });
  };

  const handleRemoveQuantity = () => {
    if (formData.quantity > 0) {
      setFormData({ ...formData, quantity: formData.quantity - 1 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.categoryId || !formData.price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const priceInCents = Math.round(parseFloat(formData.price) * 100);

      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          categoryId: parseInt(formData.categoryId),
          name: formData.name,
          barcode: formData.barcode || undefined,
          price: priceInCents,
          quantity: formData.quantity,
        });
        toast.success("Produto atualizado com sucesso");
      } else {
        await createMutation.mutateAsync({
          categoryId: parseInt(formData.categoryId),
          name: formData.name,
          barcode: formData.barcode || undefined,
          price: priceInCents,
          quantity: formData.quantity,
        });
        toast.success("Produto criado com sucesso");
      }

      setFormData({
        categoryId: "",
        name: "",
        barcode: "",
        price: "",
        quantity: 0,
      });
      setEditingId(null);
      setShowForm(false);
      productsQuery.refetch();
    } catch (error) {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      categoryId: product.categoryId.toString(),
      name: product.name,
      barcode: product.barcode || "",
      price: (product.price / 100).toFixed(2),
      quantity: product.quantity,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Produto deletado com sucesso");
      setDeleteId(null);
      productsQuery.refetch();
    } catch (error) {
      toast.error("Erro ao deletar produto");
    }
  };

  const handleCancel = () => {
    setFormData({
      categoryId: "",
      name: "",
      barcode: "",
      price: "",
      quantity: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gestão de Produtos</h1>
            <CategoryManager onCategoryCreated={() => categoriesQuery.refetch()} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Form Card */}
          {showForm && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle>
                  {editingId ? "Editar Produto" : "Novo Produto"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Categoria *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({ ...formData, categoryId: e.target.value })
                        }
                        className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="">Selecione uma categoria...</option>
                        {categoriesQuery.data?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nome do Produto *
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: Lente de Contato..."
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Valor (R$) *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Código de Barras
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Escaneie ou digite..."
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          onKeyDown={handleBarcodeRead}
                          className="flex-1"
                        />
                        {formData.barcode && (
                          <div className="flex items-center px-3 bg-secondary rounded-md text-sm text-foreground">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Quantidade
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveQuantity}
                        className="px-3"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: parseInt(e.target.value) || 0,
                          })
                        }
                        className="flex-1 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddQuantity}
                        className="px-3"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(editingId)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Add Button */}
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          )}

          {/* Products List */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              {productsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin w-6 h-6 text-primary" />
                </div>
              ) : productsQuery.data && productsQuery.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-2 px-2 font-medium text-foreground">
                          Produto
                        </th>
                        <th className="text-left py-2 px-2 font-medium text-foreground">
                          Valor
                        </th>
                        <th className="text-left py-2 px-2 font-medium text-foreground">
                          Quantidade
                        </th>
                        <th className="text-left py-2 px-2 font-medium text-foreground">
                          Código
                        </th>
                        <th className="text-right py-2 px-2 font-medium text-foreground">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsQuery.data.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-border hover:bg-secondary/50 transition"
                        >
                          <td className="py-2 px-2 text-foreground">
                            {product.name}
                          </td>
                          <td className="py-2 px-2 text-foreground">
                            R$ {(product.price / 100).toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-foreground">
                            {product.quantity}
                          </td>
                          <td className="py-2 px-2 text-muted-foreground text-xs">
                            {product.barcode || "-"}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteId(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum produto cadastrado
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Deletar Produto</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
