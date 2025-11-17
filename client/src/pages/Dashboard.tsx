import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useLocation } from "wouter";
import { Loader2, LogOut, BarChart3, Package, Users, ArrowRight } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * Dashboard page for owner/manager
 */
export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [location, setLocation] = useLocation();

  // Analytics queries
  const topProductsQuery = trpc.analytics.topProducts.useQuery({ limit: 5 });
  const bottomProductsQuery = trpc.analytics.bottomProducts.useQuery({ limit: 5 });
  const dailyRevenueQuery = trpc.analytics.dailyRevenue.useQuery({ days: 30 });
  const monthlyRevenueQuery = trpc.analytics.monthlyRevenue.useQuery({ months: 12 });
  const todayRevenueQuery = trpc.analytics.todayRevenue.useQuery();
  const monthRevenueQuery = trpc.analytics.monthRevenue.useQuery();
  const productsQuery = trpc.products.list.useQuery();
  const usersQuery = trpc.users.list.useQuery();

  useEffect(() => {
    // Redirect if not owner/manager
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

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  // Colors for charts
  const COLORS = ['#FCD34D', '#FBB040', '#F59E0B', '#D97706', '#B45309'];

  // Transform data for charts
  const topProductsData = topProductsQuery.data?.map((product) => ({
    name: product.productName || 'Sem nome',
    quantidade: product.totalQuantity || 0,
    faturamento: (product.totalRevenue || 0) / 100,
  })) || [];

  const bottomProductsData = bottomProductsQuery.data?.map((product) => ({
    name: product.productName || 'Sem nome',
    quantidade: product.totalQuantity || 0,
    faturamento: (product.totalRevenue || 0) / 100,
  })) || [];

  const dailyRevenueData = dailyRevenueQuery.data?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', {
      month: '2-digit',
      day: '2-digit',
    }),
    faturamento: (item.revenue || 0) / 100,
    vendas: item.count || 0,
  })).reverse() || [];

  const monthlyRevenueData = monthlyRevenueQuery.data?.map((item: any) => ({
    month: item.month,
    faturamento: (item.revenue || 0) / 100,
    vendas: item.count || 0,
  })).reverse() || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm opacity-90">Bem-vindo, {user?.name || 'Usuário'}</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Button
              variant="outline"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Daily Revenue Card */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Faturamento Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {todayRevenueQuery.isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      formatCurrency(todayRevenueQuery.data || 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">+0% em relação a ontem</p>
                </CardContent>
              </Card>

              {/* Monthly Revenue Card */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Faturamento Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {monthRevenueQuery.isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      formatCurrency(monthRevenueQuery.data || 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Até hoje</p>
                </CardContent>
              </Card>

              {/* Total Products Card */}
              <Card className="border-l-4 border-l-accent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Produtos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {productsQuery.isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      productsQuery.data?.length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Em estoque</p>
                </CardContent>
              </Card>

              {/* Total Users Card */}
              <Card className="border-l-4 border-l-secondary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Usuários Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {usersQuery.isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      usersQuery.data?.length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">No sistema</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Selling Products Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {topProductsQuery.isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : topProductsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topProductsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => {
                            if (typeof value === 'number') {
                              return value.toFixed(0);
                            }
                            return value;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="quantidade" fill="#FCD34D" name="Quantidade" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bottom Selling Products Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Menos Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {bottomProductsQuery.isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : bottomProductsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bottomProductsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => {
                            if (typeof value === 'number') {
                              return value.toFixed(0);
                            }
                            return value;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="quantidade" fill="#F59E0B" name="Quantidade" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Revenue Charts */}
            <div className="grid grid-cols-1 gap-6">
              {/* Daily Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Faturamento Diário (Últimos 30 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyRevenueQuery.isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : dailyRevenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => {
                            if (typeof value === 'number') {
                              return formatCurrency(value * 100);
                            }
                            return value;
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="faturamento"
                          stroke="#FCD34D"
                          name="Faturamento (R$)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Faturamento Mensal (Últimos 12 meses)</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyRevenueQuery.isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : monthlyRevenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => {
                            if (typeof value === 'number') {
                              return formatCurrency(value * 100);
                            }
                            return value;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="faturamento" fill="#FCD34D" name="Faturamento (R$)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestão de Produtos</CardTitle>
                <Button
                  onClick={() => setLocation('/products')}
                  className="bg-primary text-primary-foreground"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Gerenciar Produtos
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Acesse a página de gestão de produtos para:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Cadastrar novos produtos
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Adicionar código de barras
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Gerenciar quantidade em estoque
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Editar preços e informações
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestão de Categorias</CardTitle>
                <Button
                  onClick={() => setLocation('/categories')}
                  className="bg-primary text-primary-foreground"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Gerenciar Categorias
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Acesse a página de gestão de categorias para:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Criar novas categorias
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Editar informações de categorias
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Remover categorias
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Organizar produtos por categoria
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestão de Usuários</CardTitle>
                <Button
                  onClick={() => setLocation('/users')}
                  className="bg-primary text-primary-foreground"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Gerenciar Usuários
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Acesse a página de gestão de usuários para:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Criar novos usuários (Proprietário, Gerente, Vendedor)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Alterar permissões de usuários
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Remover usuários do sistema
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      Visualizar lista de usuários ativos
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

      </main>
    </div>
  );
}
