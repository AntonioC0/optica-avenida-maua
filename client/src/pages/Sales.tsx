import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Loader2, LogOut, ShoppingCart, History, Plus, Minus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * Sales page for sellers and managers
 */
export default function Sales() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Queries
  const categoriesQuery = trpc.categories.list.useQuery();
  const productsQuery = trpc.products.list.useQuery();
  const salesQuery = trpc.sales.list.useQuery();
  const createSaleMutation = trpc.sales.create.useMutation();
  const addItemMutation = trpc.sales.addItem.useMutation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/');
    }
  }, [user, loading, setLocation]);

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  // Get products for selected category
  const filteredProducts = selectedCategory
    ? productsQuery.data?.filter(p => p.categoryId === parseInt(selectedCategory)) || []
    : [];

  // Get selected product details
  const selectedProductData = productsQuery.data?.find(
    p => p.id === parseInt(selectedProduct)
  );

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error("Selecione um produto e quantidade válida");
      return;
    }

    if (!selectedProductData) {
      toast.error("Produto não encontrado");
      return;
    }

    if (selectedProductData.quantity < quantity) {
      toast.error("Quantidade insuficiente em estoque");
      return;
    }

    // Check if product already in cart
    const existingItem = saleItems.find(item => item.productId === selectedProductData.id);
    if (existingItem) {
      if (existingItem.quantity + quantity > selectedProductData.quantity) {
        toast.error("Quantidade insuficiente em estoque");
        return;
      }
      setSaleItems(
        saleItems.map(item =>
          item.productId === selectedProductData.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.unitPrice,
              }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          productId: selectedProductData.id,
          productName: selectedProductData.name,
          quantity,
          unitPrice: selectedProductData.price,
          subtotal: selectedProductData.price * quantity,
        },
      ]);
    }

    // Check for low stock alert
    const remainingStock = selectedProductData.quantity - quantity;
    const minStock = selectedProductData.minStock || 5;
    
    if (remainingStock <= minStock && remainingStock > 0) {
      toast.warning(
        `Aviso: ${selectedProductData.name} com estoque baixo! Apenas ${remainingStock} unidades restantes.`,
        { duration: 5000 }
      );
    } else if (remainingStock === 0) {
      toast.error(
        `Alerta: ${selectedProductData.name} ficará SEM ESTOQUE após esta venda!`,
        { duration: 5000 }
      );
    }

    setSelectedProduct("");
    setQuantity(1);
    toast.success("Produto adicionado à venda");
  };

  const handleBarcodeRead = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      const product = productsQuery.data?.find(p => p.barcode === barcodeInput.trim());
      if (product) {
        setSelectedCategory(product.categoryId.toString());
        setSelectedProduct(product.id.toString());
        setBarcodeInput("");
        toast.success("Produto encontrado via código de barras");
      } else {
        toast.error("Código de barras não encontrado");
        setBarcodeInput("");
      }
    }
  };

  const handleRemoveItem = (productId: number) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
    toast.success("Produto removido da venda");
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const product = productsQuery.data?.find(p => p.id === productId);
    if (product && newQuantity > product.quantity) {
      toast.error("Quantidade insuficiente em estoque");
      return;
    }

    setSaleItems(
      saleItems.map(item =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.unitPrice,
            }
          : item
      )
    );
  };

  const totalAmount = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleFinalizeSale = async () => {
    if (saleItems.length === 0) {
      toast.error("Adicione produtos à venda");
      return;
    }

    try {
      // Create sale
      const saleResult = await createSaleMutation.mutateAsync({
        totalAmount: Math.round(totalAmount),
        itemCount: saleItems.length,
      });

      // Get the sale ID from the result
      const saleId = saleResult.insertId || 0;
      if (!saleId) {
        throw new Error('Erro ao criar venda');
      }

      // Add items to sale
      for (const item of saleItems) {
        await addItemMutation.mutateAsync({
          saleId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        });
      }

      toast.success("Venda finalizada com sucesso!");
      setSaleItems([]);
      setSelectedCategory("");
      setSelectedProduct("");
      salesQuery.refetch();
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error("Erro ao finalizar venda");
    }
  };

  const handleCancel = () => {
    setSaleItems([]);
    setSelectedCategory("");
    setSelectedProduct("");
    setQuantity(1);
    toast.info("Venda cancelada");
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
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vendas</h1>
            <p className="text-sm opacity-90">Bem-vindo, {user?.name || 'Usuário'}</p>
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
        <Tabs defaultValue="new-sale" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-background border-2 border-primary/30 rounded-lg p-1">
            <TabsTrigger value="new-sale" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Nova Venda</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* New Sale Tab */}
          <TabsContent value="new-sale" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Registrar Nova Venda</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Seller Info */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Vendedor
                      </label>
                      <div className="p-3 bg-secondary/20 rounded-md text-foreground font-medium">
                        {user?.name || 'Usuário'}
                      </div>
                    </div>

                    {/* Barcode Input */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Código de Barras
                      </label>
                      <Input
                        type="text"
                        placeholder="Escaneie o código de barras..."
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        onKeyDown={handleBarcodeRead}
                        className="w-full"
                      />
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Categoria
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedProduct("");
                        }}
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

                    {/* Product Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Produto
                      </label>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                        disabled={!selectedCategory}
                      >
                        <option value="">Selecione um produto...</option>
                        {filteredProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - R$ {(product.price / 100).toFixed(2)} (Est: {product.quantity})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Quantidade
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="flex-1 text-center"
                        />
                        <Button
                          variant="outline"
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Add Button */}
                    <Button
                      onClick={handleAddItem}
                      className="w-full bg-primary text-primary-foreground"
                      disabled={!selectedProduct}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Section */}
              <div className="space-y-6">
                <Card className="border-2 border-primary/50">
                  <CardHeader>
                    <CardTitle>Resumo da Venda</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Low Stock Warning */}
                    {saleItems.some(item => {
                      const product = productsQuery.data?.find(p => p.id === item.productId);
                      return product && (product.quantity - item.quantity) <= (product.minStock || 5);
                    }) && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500 rounded-md">
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                          ⚠️ Aviso: Um ou mais produtos terão estoque baixo após esta venda
                        </p>
                      </div>
                    )}

                    {/* Critical Stock Warning */}
                    {saleItems.some(item => {
                      const product = productsQuery.data?.find(p => p.id === item.productId);
                      return product && (product.quantity - item.quantity) === 0;
                    }) && (
                      <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                        <p className="text-sm font-medium text-destructive">
                          🚨 Crítico: Um ou mais produtos ficarão SEM ESTOQUE após esta venda
                        </p>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {saleItems.length > 0 ? (
                        saleItems.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between p-2 bg-secondary/10 rounded-md"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">
                                {item.productName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity}x R$ {(item.unitPrice / 100).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="font-semibold text-primary text-sm">
                                  R$ {(item.subtotal / 100).toFixed(2)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.productId)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhum produto adicionado
                        </p>
                      )}
                    </div>

                    {/* Divider */}
                    {saleItems.length > 0 && <div className="border-t border-border" />}

                    {/* Total */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-foreground font-medium">Subtotal:</span>
                        <span className="text-foreground">R$ {(totalAmount / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-lg font-bold text-foreground">Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          R$ {(totalAmount / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancel}
                        disabled={saleItems.length === 0}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="flex-1 bg-primary text-primary-foreground"
                        onClick={() => setShowConfirmDialog(true)}
                        disabled={saleItems.length === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Finalizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                {salesQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin w-6 h-6 text-primary" />
                  </div>
                ) : salesQuery.data && salesQuery.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="text-left py-2 px-2 font-medium text-foreground">Data</th>
                          <th className="text-left py-2 px-2 font-medium text-foreground">Vendedor</th>
                          <th className="text-right py-2 px-2 font-medium text-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesQuery.data.map((sale) => (
                          <tr key={sale.id} className="border-b border-border hover:bg-secondary/50">
                            <td className="py-2 px-2 text-foreground">
                              {new Date(sale.createdAt).toLocaleDateString('pt-BR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-2 px-2 text-foreground">ID: {sale.sellerId}</td>
                            <td className="py-2 px-2 text-right font-semibold text-primary">
                              R$ {(sale.totalAmount / 100).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma venda registrada
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirmar Venda</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-2">
              <p>Tem certeza que deseja finalizar esta venda?</p>
              <div className="bg-secondary/20 p-3 rounded-md">
                <p className="font-semibold text-foreground">
                  Total: R$ {(totalAmount / 100).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {saleItems.length} produto(s)
                </p>
              </div>
            </div>
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalizeSale}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={createSaleMutation.isPending}
            >
              {createSaleMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                "Confirmar Venda"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
