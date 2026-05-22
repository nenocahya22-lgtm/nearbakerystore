import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Database connection - set DB_URL in .env file
const DB_URL = process.env.DB_URL || "";

if (!DB_URL) {
  console.warn("⚠️ DB_URL not set. API endpoints will return errors. Set DB_URL in .env file.");
}

const pool = new Pool({
  connectionString: DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Serve product images from the Near_Bakery_Pos/uploads folder
  const uploadsPath = path.join(process.cwd(), "..", "uploads");
  app.use("/uploads", express.static(uploadsPath));

  // API to fetch products from Near Bakery DB
  app.get("/api/products", async (req, res) => {
    try {
      const result = await pool.query("SELECT id, name, category, image_path, selling_price FROM recipe_master ORDER BY name ASC");
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
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // API to handle checkout and deduct stock
  app.post("/api/order", async (req, res) => {
    const { items, total, customerPhone } = req.body;
    const client = await pool.connect();
    
    try {
      await client.query("BEGIN");

      // 1. Record Sale in sales_log
      const saleResult = await client.query(
        "INSERT INTO sales_log (total_revenue, timestamp, payment_method, sale_channel) VALUES ($1, CURRENT_TIMESTAMP, $2, $3) RETURNING id",
        [total, "ONLINE", "WEBSITE"]
      );
      const salesId = saleResult.rows[0].id;

      // 2. Process each item
      for (const item of items) {
        const recipeId = parseInt(item.id);
        
        // Record in sales_items
        await client.query(
          "INSERT INTO sales_items (sales_id, recipe_id, item_name, qty, price, subtotal) VALUES ($1, $2, $3, $4, $5, $6)",
          [salesId, recipeId, item.name, item.quantity, item.price, item.price * item.quantity]
        );

        // Deduct Ingredients
        const ings = await client.query(
          "SELECT inventory_id, qty_pakai FROM recipe_ingredients WHERE recipe_id = $1",
          [recipeId]
        );

        for (const ing of ings.rows) {
          const totalDeduct = ing.qty_pakai * item.quantity;
          
          // Update Inventory Stock
          await client.query(
            "UPDATE inventory_master SET stock = stock - $1 WHERE id = $2",
            [totalDeduct, ing.inventory_id]
          );

          // Log stock movement
          await client.query(
            "INSERT INTO stock_movement_log (inventory_id, qty, type, reason) VALUES ($1, $2, $3, $4)",
            [ing.inventory_id, -totalDeduct, "OUT", `Website Order #${salesId}`]
          );
        }
      }

      // 3. Update Business Vault (add revenue)
      await client.query(
        "UPDATE business_vault SET current_balance = current_balance + $1",
        [total]
      );

      await client.query("COMMIT");
      res.status(201).json({ 
        success: true, 
        message: "Order processed and stock deducted",
        orderId: salesId
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Order processing error:", error);
      res.status(500).json({ error: "Failed to process order" });
    } finally {
      client.release();
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Near Bakery Server running on http://localhost:${PORT}`);
  });
}

startServer();

