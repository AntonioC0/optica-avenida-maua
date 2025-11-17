import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, ownerProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  upsertUser,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllProducts,
  getProductsByCategory,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllSales,
  getSaleById,
  createSale,
  getSaleItems,
  createSaleItem,
  getTopSellingProducts,
  getBottomSellingProducts,
  getDailyRevenue,
  getMonthlyRevenue,
  getTodayRevenue,
  getMonthRevenue,
  getLowStockProducts,
  updateProductMinStock,
  createNotification,
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  notifyLowStock,
  notifySale,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  users: router({
    // Get all users (owner/manager only)
    list: ownerProcedure.query(async () => {
      return getAllUsers();
    }),
    // Create user (owner only)
    create: ownerProcedure.input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(['owner', 'manager', 'seller']),
    })).mutation(async ({ input }) => {
      // Generate a unique openId for the new user
      const openId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const result = await upsertUser({
        openId,
        name: input.name,
        email: input.email,
        role: input.role,
        loginMethod: 'local',
      });
      return { success: true, result };
    }),
    // Update user role (owner only)
    updateRole: ownerProcedure.input(z.object({
      userId: z.number(),
      role: z.enum(['owner', 'manager', 'seller']),
    })).mutation(async ({ input }) => {
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),
    // Delete user (owner only)
    delete: ownerProcedure.input(z.number()).mutation(async ({ input: userId }) => {
      await deleteUser(userId);
      return { success: true };
    }),
  }),

  categories: router({
    // Get all categories (protected)
    list: protectedProcedure.query(async () => {
      return getAllCategories();
    }),
    // Get category by ID (protected)
    get: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getCategoryById(input);
    }),
    // Create category (owner/manager only)
    create: ownerProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    })).mutation(async ({ input }) => {
      const result = await createCategory(input);
      return { success: true, result };
    }),
    // Update category (owner/manager only)
    update: ownerProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
    })).mutation(async ({ input }) => {
      await updateCategory(input.id, {
        name: input.name,
        description: input.description,
      });
      return { success: true };
    }),
    // Delete category (owner/manager only)
    delete: ownerProcedure.input(z.number()).mutation(async ({ input: id }) => {
      await deleteCategory(id);
      return { success: true };
    }),
  }),

  products: router({
    // Get all products (protected)
    list: protectedProcedure.query(async () => {
      return getAllProducts();
    }),
    // Get products by category (protected)
    byCategory: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getProductsByCategory(input);
    }),
    // Get product by ID (protected)
    get: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getProductById(input);
    }),
    // Get product by barcode (protected)
    byBarcode: protectedProcedure.input(z.string()).query(async ({ input }) => {
      return getProductByBarcode(input);
    }),
    // Create product (owner/manager only)
    create: ownerProcedure.input(z.object({
      categoryId: z.number(),
      name: z.string().min(1),
      barcode: z.string().optional(),
      price: z.number().int().min(0),
      quantity: z.number().int().min(0),
    })).mutation(async ({ input }) => {
      const result = await createProduct(input);
      return { success: true, result };
    }),
    // Update product (owner/manager only)
    update: ownerProcedure.input(z.object({
      id: z.number(),
      categoryId: z.number().optional(),
      name: z.string().min(1).optional(),
      barcode: z.string().optional(),
      price: z.number().int().min(0).optional(),
      quantity: z.number().int().min(0).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      const product = await getProductById(id);
      await updateProduct(id, data);
      
      // Check if quantity is now at or below 5 units
      if (data.quantity !== undefined && data.quantity <= 5 && data.quantity > 0 && product) {
        await notifyLowStock(id, product.name, data.quantity);
      }
      
      return { success: true };
    }),
    // Delete product (owner/manager only)
    delete: ownerProcedure.input(z.number()).mutation(async ({ input: id }) => {
      await deleteProduct(id);
      return { success: true };
    }),
  }),

  sales: router({
    // Get all sales (protected)
    list: protectedProcedure.query(async () => {
      return getAllSales();
    }),
    // Get sale by ID (protected)
    get: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getSaleById(input);
    }),
    // Get sale items (protected)
    items: protectedProcedure.input(z.number()).query(async ({ input }) => {
      return getSaleItems(input);
    }),
    // Create sale (protected)
    create: protectedProcedure.input(z.object({
      totalAmount: z.number().int().min(0),
      itemCount: z.number().int().min(1),
    })).mutation(async ({ input, ctx }) => {
      const result = await createSale({
        sellerId: ctx.user!.id,
        totalAmount: input.totalAmount,
      });
      
      // Notify about new sale
      await notifySale(ctx.user!.name || 'Vendedor', input.totalAmount, input.itemCount);
      
      return { success: true, insertId: (result as any)?.insertId };
    }),
    // Add item to sale (protected)
    addItem: protectedProcedure.input(z.object({
      saleId: z.number(),
      productId: z.number(),
      quantity: z.number().int().min(1),
      unitPrice: z.number().int().min(0),
      subtotal: z.number().int().min(0),
    })).mutation(async ({ input }) => {
      const result = await createSaleItem(input);
      
      // Get product to check stock after sale
      const product = await getProductById(input.productId);
      if (product) {
        const newQuantity = product.quantity - input.quantity;
        
        // Update product quantity
        await updateProduct(input.productId, { quantity: newQuantity });
        
        // Check if quantity is now at or below 5 units
        if (newQuantity <= 5 && newQuantity > 0) {
          await notifyLowStock(input.productId, product.name, newQuantity);
        }
      }
      
      return { success: true, result };
    }),
  }),

  analytics: router({
    // Get top selling products (protected)
    topProducts: protectedProcedure.input(z.object({
      limit: z.number().int().min(1).max(20).optional(),
    }).optional()).query(async ({ input }) => {
      return getTopSellingProducts(input?.limit || 5);
    }),
    // Get bottom selling products (protected)
    bottomProducts: protectedProcedure.input(z.object({
      limit: z.number().int().min(1).max(20).optional(),
    }).optional()).query(async ({ input }) => {
      return getBottomSellingProducts(input?.limit || 5);
    }),
    // Get daily revenue (protected)
    dailyRevenue: protectedProcedure.input(z.object({
      days: z.number().int().min(1).max(365).optional(),
    }).optional()).query(async ({ input }) => {
      return getDailyRevenue(input?.days || 30);
    }),
    // Get monthly revenue (protected)
    monthlyRevenue: protectedProcedure.input(z.object({
      months: z.number().int().min(1).max(60).optional(),
    }).optional()).query(async ({ input }) => {
      return getMonthlyRevenue(input?.months || 12);
    }),
    // Get today revenue (protected)
    todayRevenue: protectedProcedure.query(async () => {
      return getTodayRevenue();
    }),
    // Get month revenue (protected)
    monthRevenue: protectedProcedure.query(async () => {
      return getMonthRevenue();
    }),
  }),

  alerts: router({
    // Get low stock products (protected)
    lowStock: protectedProcedure.query(async () => {
      return getLowStockProducts();
    }),
    // Update product minimum stock (owner/manager only)
    updateMinStock: ownerProcedure.input(z.object({
      productId: z.number(),
      minStock: z.number().int().min(0),
    })).mutation(async ({ input }) => {
      await updateProductMinStock(input.productId, input.minStock);
      return { success: true };
    }),
  }),

  notifications: router({
    // Get user notifications (protected)
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserNotifications(ctx.user!.id);
    }),
    // Get unread count (protected)
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return getUnreadNotificationsCount(ctx.user!.id);
    }),
    // Mark as read (protected)
    markAsRead: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      await markNotificationAsRead(input);
      return { success: true };
    }),
    // Mark all as read (protected)
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsAsRead(ctx.user!.id);
      return { success: true };
    }),
    // Delete notification (protected)
    delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
      await deleteNotification(input);
      return { success: true };
    }),
    // Delete all notifications (protected)
    deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
      await deleteAllNotifications(ctx.user!.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
