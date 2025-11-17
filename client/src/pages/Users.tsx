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
import { Loader2, Trash2, Edit2, Plus, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserFormData {
  name: string;
  email: string;
  role: "owner" | "manager" | "seller";
}

/**
 * Users management page for owner/manager
 */
export default function Users() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "seller",
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "manager" | "seller">("all");

  // Queries
  const usersQuery = trpc.users.list.useQuery();
  const createUserMutation = trpc.users.create.useMutation();
  const updateUserMutation = trpc.users.updateRole.useMutation();
  const deleteUserMutation = trpc.users.delete.useMutation();

  useEffect(() => {
    if (!loading && user && user.role !== 'owner' && user.role !== 'manager') {
      setLocation('/sales');
    }
  }, [user, loading, setLocation]);

  // Check if user is owner (only owner can manage users)
  const isOwner = user?.role === 'owner';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido");
      return;
    }

    try {
      if (editingId) {
        await updateUserMutation.mutateAsync({
          userId: editingId,
          role: formData.role,
        });
        toast.success("Usuário atualizado com sucesso");
      } else {
        await createUserMutation.mutateAsync({
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });
        toast.success("Usuário criado com sucesso");
      }

      setFormData({
        name: "",
        email: "",
        role: "seller",
      });
      setEditingId(null);
      setShowForm(false);
      usersQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar usuário");
    }
  };

  const handleEdit = (userData: any) => {
    setEditingId(userData.id);
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      role: userData.role || "seller",
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteUserMutation.mutateAsync(deleteId);
      toast.success("Usuário deletado com sucesso");
      setDeleteId(null);
      usersQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar usuário");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      email: "",
      role: "seller",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter users by role
  const filteredUsers = usersQuery.data?.filter(u => {
    if (roleFilter === "all") return true;
    return u.role === roleFilter;
  }) || [];

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: "Proprietário",
      manager: "Gerente",
      seller: "Vendedor",
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: "bg-primary text-primary-foreground",
      manager: "bg-accent text-accent-foreground",
      seller: "bg-secondary text-secondary-foreground",
    };
    return colors[role] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
          {!isOwner && (
            <span className="ml-auto text-sm bg-primary-foreground/20 px-3 py-1 rounded-full">
              Visualização apenas
            </span>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Permission Warning for Manager */}
          {!isOwner && (
            <Card className="border-l-4 border-l-accent bg-accent/10">
              <CardContent className="pt-6">
                <p className="text-sm text-foreground">
                  <strong>Acesso Restrito:</strong> Apenas proprietários podem adicionar, editar ou remover usuários. Você pode visualizar a lista de usuários do sistema.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Form Card */}
          {showForm && isOwner && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle>
                  {editingId ? "Editar Usuário" : "Novo Usuário"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nome Completo *
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: João Silva"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        disabled={editingId !== null}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        placeholder="Ex: joao@optica.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={editingId !== null}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tipo de Acesso *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as "owner" | "manager" | "seller",
                        })
                      }
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="seller">Vendedor - Acesso a vendas e estoque</option>
                      <option value="manager">Gerente - Acesso total ao sistema</option>
                      <option value="owner">Proprietário - Acesso total ao sistema</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formData.role === "seller" &&
                        "Pode registrar vendas e visualizar estoque"}
                      {formData.role === "manager" &&
                        "Acesso completo: gestão de usuários, produtos, categorias e vendas"}
                      {formData.role === "owner" &&
                        "Acesso completo: gestão de usuários, produtos, categorias e vendas"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground"
                      disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    >
                      {createUserMutation.isPending || updateUserMutation.isPending ? (
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
          {!showForm && isOwner && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          )}

          {/* Filter Buttons */}
          {isOwner && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={roleFilter === "all" ? "default" : "outline"}
                onClick={() => setRoleFilter("all")}
                className={roleFilter === "all" ? "bg-primary text-primary-foreground" : ""}
              >
                Todos ({usersQuery.data?.length || 0})
              </Button>
              <Button
                variant={roleFilter === "owner" ? "default" : "outline"}
                onClick={() => setRoleFilter("owner")}
                className={roleFilter === "owner" ? "bg-primary text-primary-foreground" : ""}
              >
                Proprietários ({usersQuery.data?.filter(u => u.role === "owner").length || 0})
              </Button>
              <Button
                variant={roleFilter === "manager" ? "default" : "outline"}
                onClick={() => setRoleFilter("manager")}
                className={roleFilter === "manager" ? "bg-primary text-primary-foreground" : ""}
              >
                Gerentes ({usersQuery.data?.filter(u => u.role === "manager").length || 0})
              </Button>
              <Button
                variant={roleFilter === "seller" ? "default" : "outline"}
                onClick={() => setRoleFilter("seller")}
                className={roleFilter === "seller" ? "bg-primary text-primary-foreground" : ""}
              >
                Vendedores ({usersQuery.data?.filter(u => u.role === "seller").length || 0})
              </Button>
            </div>
          )}

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Usuários {roleFilter !== "all" && `- ${getRoleLabel(roleFilter)}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin w-6 h-6 text-primary" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-2">
                  {filteredUsers.map((userData) => (
                    <div
                      key={userData.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {userData.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {userData.email}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userData.role)}`}>
                            {getRoleLabel(userData.role)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Criado em:{" "}
                          {new Date(userData.createdAt).toLocaleDateString("pt-BR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </p>
                      </div>
                      {isOwner && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(userData)}
                            disabled={user?.id === userData.id}
                            title={user?.id === userData.id ? "Você não pode editar sua própria conta" : ""}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(userData.id)}
                            disabled={user?.id === userData.id}
                            title={user?.id === userData.id ? "Você não pode deletar sua própria conta" : ""}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Deletar Usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita e o usuário não poderá mais acessar o sistema.
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
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
