import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Trash2, Edit2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Categories management page for owner/manager
 */
export default function Categories() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Queries
  const categoriesQuery = trpc.categories.list.useQuery();
  const createMutation = trpc.categories.create.useMutation();
  const updateMutation = trpc.categories.update.useMutation();
  const deleteMutation = trpc.categories.delete.useMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          description: formData.description,
        });
        toast.success("Categoria atualizada com sucesso");
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
        });
        toast.success("Categoria criada com sucesso");
      }
      
      setFormData({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      categoriesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
    }
  };

  const handleEdit = (id: number, name: string, description?: string) => {
    setEditingId(id);
    setFormData({ name, description: description || "" });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Categoria deletada com sucesso");
      setDeleteId(null);
      categoriesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao deletar categoria");
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Gestão de Categorias</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Form Card */}
          {showForm && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle>
                  {editingId ? "Editar Categoria" : "Nova Categoria"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nome *
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Lentes, Armações..."
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Descrição
                    </label>
                    <Textarea
                      placeholder="Descrição da categoria..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full"
                      rows={3}
                    />
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
              Nova Categoria
            </Button>
          )}

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin w-6 h-6 text-primary" />
                </div>
              ) : categoriesQuery.data && categoriesQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {categoriesQuery.data.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-secondary/50 transition"
                    >
                      <div>
                        <h3 className="font-medium text-foreground">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEdit(
                              category.id,
                              category.name,
                              category.description || undefined
                            )
                          }
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma categoria cadastrada
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Deletar Categoria</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar esta categoria? Esta ação não pode ser desfeita.
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
