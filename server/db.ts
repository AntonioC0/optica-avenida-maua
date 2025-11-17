import { eq, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, products, sales, saleItems, notifications, Category, Product, Sale, SaleItem, Notification, InsertCategory, InsertProduct, InsertSale, InsertSaleItem, InsertNotification } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email || `user-${Date.now()}@optica.local`,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'owner';
      updateSet.role = 'owner';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all users
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update user role
 */
export async function updateUserRole(userId: number, role: 'owner' | 'manager' | 'seller') {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

/**
 * Delete user
 */
export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where(eq(users.id, userId));
}

/**
 * Categories
 */
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(categories).values(data);
  return result;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) return;
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(categories).where(eq(categories.id, id));
}

/**
 * Products
 */
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(products.name);
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductByBarcode(barcode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.barcode, barcode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(products).where(eq(products.id, id));
}

/**
 * Sales
 */
export async function getAllSales() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sales).orderBy(desc(sales.createdAt));
}

export async function getSaleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSale(data: InsertSale) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(sales).values(data);
  // Extract the insert ID from the result
  const insertId = (result as any)?.[0]?.insertId || (result as any)?.insertId;
  return { insertId, ...result };
}

/**
 * Sale Items
 */
export async function getSaleItems(saleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
}

export async function createSaleItem(data: InsertSaleItem) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(saleItems).values(data);
  return result;
}

/**
 * Analytics
 */
export async function getTopSellingProducts(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      productId: saleItems.productId,
      productName: products.name,
      totalQuantity: sql<number>`SUM(${saleItems.quantity})`,
      totalRevenue: sql<number>`SUM(${saleItems.subtotal})`,
    })
    .from(saleItems)
    .leftJoin(products, eq(saleItems.productId, products.id))
    .groupBy(saleItems.productId, products.name)
    .orderBy(sql`SUM(${saleItems.quantity}) DESC`)
    .limit(limit);
  
  return result;
}

export async function getBottomSellingProducts(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      productId: saleItems.productId,
      productName: products.name,
      totalQuantity: sql<number>`SUM(${saleItems.quantity})`,
      totalRevenue: sql<number>`SUM(${saleItems.subtotal})`,
    })
    .from(saleItems)
    .leftJoin(products, eq(saleItems.productId, products.id))
    .groupBy(saleItems.productId, products.name)
    .orderBy(sql`SUM(${saleItems.quantity}) ASC`)
    .limit(limit);
  
  return result;
}

export async function getDailyRevenue(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(
      sql`SELECT DATE(createdAt) as date, COALESCE(SUM(totalAmount), 0) as revenue, COUNT(id) as count
          FROM sales
          WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
          GROUP BY DATE(createdAt)
          ORDER BY DATE(createdAt) DESC`
    ) as any;
    
    return result[0] || [];
  } catch (error) {
    console.error('[Database] Error in getDailyRevenue:', error);
    return [];
  }
}

export async function getMonthlyRevenue(months: number = 12) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(
      sql`SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COALESCE(SUM(totalAmount), 0) as revenue, COUNT(id) as count
          FROM sales
          WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)
          GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
          ORDER BY DATE_FORMAT(createdAt, '%Y-%m') DESC`
    ) as any;
    
    return result[0] || [];
  } catch (error) {
    console.error('[Database] Error in getMonthlyRevenue:', error);
    return [];
  }
}

export async function getTodayRevenue() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({
      total: sql<number>`SUM(${sales.totalAmount})`,
    })
    .from(sales)
    .where(
      sql`DATE(${sales.createdAt}) = CURDATE()`
    );
  
  return result[0]?.total || 0;
}

export async function getMonthRevenue() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({
      total: sql<number>`SUM(${sales.totalAmount})`,
    })
    .from(sales)
    .where(
      sql`YEAR(${sales.createdAt}) = YEAR(NOW()) AND MONTH(${sales.createdAt}) = MONTH(NOW())`
    );
  
  return result[0]?.total || 0;
}

// TODO: add feature queries here as your schema grows.


/**
 * Low Stock Alerts
 */
export async function getLowStockProducts() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: products.id,
      name: products.name,
      categoryId: products.categoryId,
      quantity: products.quantity,
      minStock: products.minStock,
      price: products.price,
      barcode: products.barcode,
    })
    .from(products)
    .where(sql`${products.quantity} <= ${products.minStock}`)
    .orderBy(sql`${products.quantity} ASC`);
  
  return result;
}

export async function updateProductMinStock(id: number, minStock: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ minStock }).where(eq(products.id, id));
}

// TODO: add feature queries here as your schema grows.


/**
 * Notifications
 */
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(notifications).values(data);
  return result;
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(notifications).where(eq(notifications.userId, userId) && eq(notifications.isRead, 0));
  return result[0]?.count || 0;
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.userId, userId));
}

export async function deleteNotification(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notifications).where(eq(notifications.id, id));
}

export async function deleteAllNotifications(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notifications).where(eq(notifications.userId, userId));
}


/**
 * Notify all owners/managers when a product reaches low stock
 */
export async function notifyLowStock(productId: number, productName: string, currentQuantity: number) {
  const db = await getDb();
  if (!db) return;

  try {
    // Get all owner and manager users
    const managers = await db
      .select()
      .from(users)
      .where(sql`${users.role} IN ('owner', 'manager')`);

    // Create notification for each manager
    for (const manager of managers) {
      await db.insert(notifications).values({
        userId: manager.id,
        type: 'stock_low',
        title: `Estoque Baixo: ${productName}`,
        message: `O produto "${productName}" atingiu ${currentQuantity} unidades em estoque.`,
        isRead: 0,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to notify low stock:", error);
  }
}

/**
 * Notify all owners/managers when a sale is made
 */
export async function notifySale(sellerName: string, totalAmount: number, itemCount: number) {
  const db = await getDb();
  if (!db) return;

  try {
    // Get all owner and manager users
    const managers = await db
      .select()
      .from(users)
      .where(sql`${users.role} IN ('owner', 'manager')`);

    // Create notification for each manager
    for (const manager of managers) {
      await db.insert(notifications).values({
        userId: manager.id,
        type: 'sale',
        title: `Nova Venda Registrada`,
        message: `${sellerName} registrou uma venda de ${itemCount} item(ns) no valor de ${(totalAmount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
        isRead: 0,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to notify sale:", error);
  }
}
