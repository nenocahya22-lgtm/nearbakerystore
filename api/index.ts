import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

const { Pool } = pg;

const DB_URL = process.env.DB_URL || "";

const pool = DB_URL ? new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
}) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url, method } = req;

  if (!pool) {
    return res.status(500).json({ error: "DB_URL not configured" });
  }

  // GET /api/products
  if (url?.startsWith('/api/products') && method === 'GET') {
    try {
      const result = await pool.query(
        "SELECT id, name, category, image_path, selling_price FROM recipe_master ORDER BY name ASC"
      );
      const products = result.rows.map(row => {
        let imageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80";
        if (row.image_path) {
          imageUrl = row.image_path.startsWith("http") ? row.image_path : `/${row.image_path}`;
        }
        return {
          id: row.id.toString(),
          name: row.name,
          category: (row.category || 'bread').toLowerCase(),
          price: parseFloat(row.selling_price) || 0,
          image: imageUrl,
          description: `Premium ${row.name} made with the finest ingredients.`
        };
      });
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  // POST /api/order
  if (url?.startsWith('/api/order') && method === 'POST') {
    const { items, total, customerPhone } = req.body;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const saleResult = await client.query(
        "INSERT INTO sales_log (total_revenue, timestamp, payment_method, sale_channel) VALUES ($1, CURRENT_TIMESTAMP, $2, $3) RETURNING id",
        [total, "ONLINE", "WEBSITE"]
      );
      const salesId = saleResult.rows[0].id;

      for (const item of items) {
        const recipeId = parseInt(item.id);

        await client.query(
          "INSERT INTO sales_items (sales_id, recipe_id, item_name, qty, price, subtotal) VALUES ($1, $2, $3, $4, $5, $6)",
          [salesId, recipeId, item.name, item.quantity, item.price, item.price * item.quantity]
        );

        const ings = await client.query(
          "SELECT inventory_id, qty_pakai FROM recipe_ingredients WHERE recipe_id = $1",
          [recipeId]
        );

        for (const ing of ings.rows) {
          const totalDeduct = ing.qty_pakai * item.quantity;

          await client.query(
            "UPDATE inventory_master SET stock = stock - $1 WHERE id = $2",
            [totalDeduct, ing.inventory_id]
          );

          await client.query(
            "INSERT INTO stock_movement_log (inventory_id, qty, type, reason) VALUES ($1, $2, $3, $4)",
            [ing.inventory_id, -totalDeduct, "OUT", `Website Order #${salesId}`]
          );
        }
      }

      await client.query(
        "UPDATE business_vault SET current_balance = current_balance + $1",
        [total]
      );

      await client.query("COMMIT");
      return res.status(201).json({
        success: true,
        message: "Order processed and stock deducted",
        orderId: salesId
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Order processing error:", error);
      return res.status(500).json({ error: "Failed to process order" });
    } finally {
      client.release();
    }
  }

  return res.status(404).json({ error: "Not found" });
}
