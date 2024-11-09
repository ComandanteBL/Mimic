import * as sqlite3 from "sqlite3"; // Updated import
import * as fs from "fs";

let database: sqlite3.Database | null = null;

/**
 * Creates or loads a new sqlite database.
 */
export async function create() {
    const existed = fs.existsSync("database.db");

    // Open the database connection
    database = new sqlite3.Database("database.db");

    if (!existed) {
        await new Promise<void>((resolve, reject) => {
            database!.exec(`
                CREATE TABLE IF NOT EXISTS conduit_instances (
                    code TEXT PRIMARY KEY,
                    public_key TEXT
                );
            `, (err: Error | null) => {  // Added type for err
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

/**
 * Generates a new unique code for the specified public key and returns that key.
 */
export async function generateCode(pubkey: string): Promise<string> {
    if (!database) throw new Error("Database not loaded yet.");

    const existing = await new Promise<{ code: string } | undefined>((resolve, reject) => {
        database!.get(`SELECT * FROM conduit_instances WHERE public_key = ? LIMIT 1`, [pubkey], (err: Error | null, row: any) => {  // Typed err and row
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (existing) return existing.code;

    let code: string;
    while (true) {
        code = (Math.floor(Math.random() * 900000) + 100000).toString();

        const existed = await new Promise<{ count: number }>((resolve, reject) => {
            database!.get(`SELECT COUNT(*) as count FROM conduit_instances WHERE code = ?`, [code], (err: Error | null, row: any) => { // Typed err and row
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existed.count === 0) break;
    }

    await new Promise<void>((resolve, reject) => {
        database!.run(`INSERT INTO conduit_instances VALUES (?, ?)`, [code, pubkey], (err: Error | null) => {  // Typed err
            if (err) reject(err);
            else resolve();
        });
    });

    return code;
}

/**
 * Looks up the public key belonging to the specified code.
 */
export async function lookup(code: string): Promise<{ public_key: string, code: string } | null> {
    if (!database) throw new Error("Database not loaded yet.");

    const entry = await new Promise<{ public_key: string, code: string } | null>((resolve, reject) => {
        database!.get(`SELECT * FROM conduit_instances WHERE code = ? LIMIT 1`, [code], (err: Error | null, row: any) => { // Typed err and row
            if (err) reject(err);
            else resolve(row || null);
        });
    });

    return entry;
}

/**
 * Checks if the specified code is still a valid entry.
 */
export async function potentiallyUpdate(code: string, pubkey: string): Promise<boolean> {
    if (!database) throw new Error("Database not loaded yet.");

    const existed = await new Promise<{ count: number }>((resolve, reject) => {
        database!.get(`SELECT COUNT(*) as count FROM conduit_instances WHERE code = ?`, [code], (err: Error | null, row: any) => { // Typed err and row
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (existed.count === 0) return false;

    await new Promise<void>((resolve, reject) => {
        database!.run(`UPDATE conduit_instances SET public_key = ? WHERE code = ?`, [pubkey, code], (err: Error | null) => { // Typed err
            if (err) reject(err);
            else resolve();
        });
    });

    return true;
}
