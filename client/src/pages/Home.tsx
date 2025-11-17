import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, ArrowRight } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useLocation } from "wouter";

/**
 * Home page - Shows dashboard for authenticated users, login page for guests
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const dailyRevenueQuery = trpc.analytics.dailyRevenue.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'owner' || user?.role === 'manager'),
  });

  const monthlyRevenueQuery = trpc.analytics.monthlyRevenue.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'owner' || user?.role === 'manager'),
  });

  const todayRevenueQuery = trpc.analytics.todayRevenue.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'owner' || user?.role === 'manager'),
  });

  const monthRevenueQuery = trpc.analytics.monthRevenue.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'owner' || user?.role === 'manager'),
  });

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const handleNavigateToDashboard = () => {
    if (user?.role === 'owner' || user?.role === 'manager') {
      setLocation('/dashboard');
    } else if (user?.role === 'seller') {
      setLocation('/sales');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-24 h-24" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">{APP_TITLE}</h1>
            <p className="text-lg text-muted-foreground">
              Sistema de Controle de Estoque e Vendas
            </p>
          </div>



          {/* Login Button */}
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-semibold"
          >
            Entrar no Sistema
          </Button>

          {/* Footer */}
          <p className="text-sm text-muted-foreground">
            © 2024 Ótica Avenida Mauá. Todos os direitos reservados.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated user dashboard
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bem-vindo, {user?.name || 'Usuário'}</h1>
            <p className="text-sm opacity-90">Visão geral do seu negócio</p>
          </div>
          <Button
            variant="outline"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayRevenueQuery.isLoading ? (
                <div className="flex items-center justify-center h-12">
                  <Loader2 className="animate-spin w-4 h-4" />
                </div>
              ) : (
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {(((todayRevenueQuery.data as number) || 0) / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Até o momento
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthRevenueQuery.isLoading ? (
                <div className="flex items-center justify-center h-12">
                  <Loader2 className="animate-spin w-4 h-4" />
                </div>
              ) : (
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {(((monthRevenueQuery.data as number) || 0) / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este mês
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Revenue Chart */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle>Faturamento Diário (Últimos 30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyRevenueQuery.isLoading ? (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="animate-spin w-4 h-4" />
                </div>
              ) : dailyRevenueQuery.data && dailyRevenueQuery.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyRevenueQuery.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: any) =>
                        ((value as number) / 100).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#FBBF24"
                      strokeWidth={2}
                      dot={{ fill: '#FBBF24', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Faturamento"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Revenue Chart */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle>Faturamento Mensal (Últimos 12 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyRevenueQuery.isLoading ? (
                <div className="flex items-center justify-center h-80">
                  <Loader2 className="animate-spin w-4 h-4" />
                </div>
              ) : monthlyRevenueQuery.data && monthlyRevenueQuery.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenueQuery.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: any) =>
                        ((value as number) / 100).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill="#FBBF24"
                      name="Faturamento"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleNavigateToDashboard}
            className="bg-primary text-primary-foreground hover:bg-primary/90 py-6 px-8 text-lg font-semibold"
          >
            Ir para Dashboard Completo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
