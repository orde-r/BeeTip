import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';


// Singleton Design Pattern
// This single db instance is exported and shared across all modules that need database access.
const db = drizzle(process.env.DATABASE_URL!);

export default db;
