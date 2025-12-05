import pkg from "pg";
const { Pool } = pkg;

// Prefer DATABASE_URL (common on Vercel) but allow individual PG* vars.
const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl:
        process.env.PGSSLMODE === "require" || process.env.PGSSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    })
  : new Pool({
      user: process.env.PGUSER || "postgres",
      host: process.env.PGHOST || "localhost",
      database: process.env.PGDATABASE || "mern_ecommerce_store",
      password: process.env.PGPASSWORD || "123456",
      port: Number(process.env.PGPORT) || 5432,
      ssl:
        process.env.PGSSLMODE === "require" || process.env.PGSSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });

// Warm the pool once so cold starts surface errors in logs without crashing.
try {
  const client = await pool.connect();
  client.release();
  console.log("Connected to the database successfully");
} catch (error) {
  console.error("Database connection failed:", error);
  // Do not exit in serverless; allow handler to return 500 while logs capture the issue.
}

export default pool;
