import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CategoryManagerProps {
  onCategoryCreated?: () => void;
}

export default function CategoryManager({ onCategoryCreated }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const categoriesQuery = trpc.categories.list.useQuery();
  const createMutation = trpc.categories.create.useMutation();
  const updateMutation = trpc.categories.update.useMutation();
  const deleteMutation = trpc.categories.delete.useMutation();

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: categoryName,
        });
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync({
          name: categoryName,
        });
        toast.success("Categoria criada com sucesso!");
      }

      setCategoryName("");
      setEditingId(null);
      categoriesQuery.refetch();
      onCategoryCreated?.();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
    }
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setCategoryName(name);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar esta categoria?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Categoria deletada com sucesso!");
      categoriesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao deletar categoria");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCategoryName("");
    setEditingId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-black text-primary hover:bg-black/90 font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Categorias
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciador de Categorias</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form */}
          <div className="space-y-4 border-b pb-6">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input
                id="category-name"
                placeholder="Ex: Lentes, Armações, Acessórios..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : editingId ? (
                  "Atualizar Categoria"
                ) : (
                  "Criar Categoria"
                )}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCategoryName("");
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Categorias Existentes</h3>
            {categoriesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin w-4 h-4" />
              </div>
            ) : categoriesQuery.data && categoriesQuery.data.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {categoriesQuery.data.map((category) => (
                  <Card key={category.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4 flex items-center justify-between">
                      <span className="font-medium text-foreground">{category.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category.id, category.name)}
                          className="text-primary border-primary hover:bg-primary/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma categoria criada ainda
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
