const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : process.env.PGSSLMODE === "require"
      ? { rejectUnauthorized: false }
      : false
});

pool.on("error", (err) => {
  console.error("Error inesperado en PostgreSQL:", err);
});

module.exports = pool;
