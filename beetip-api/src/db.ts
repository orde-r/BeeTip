import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';


// Singleton Design Pattern
// This single db instance is exported to be used by all the other code components that have anything to do with database access.
const db = drizzle(process.env.DATABASE_URL!);

export default db;
