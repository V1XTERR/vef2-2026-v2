import pg from 'pg';
import type { Todo } from '../types.js';


let pool: pg.Pool | null = null;

/**
 * Sækir PostgreSQL tengipool.
 * @returns Tengipool
 */
function getPool(): pg.Pool {
  const { DATABASE_URL } = process.env;

  if (!DATABASE_URL) {
    console.error('DATABASE_URL ekki skilgreind');
    process.exit(1);
  }

  if (!pool) {
    pool = new pg.Pool({
      connectionString: DATABASE_URL,
    });

    pool.on('error', (err: Error) => {
      console.error('Óvænt villa í idle client', err);
      process.exit(-1);
    });
  }

  return pool;
}

/**
 
 * @param q SQL fyrirspurn
 * @param values Gildi fyrir parametrized query
 * @returns Niðurstaða eða null ef villa kemur upp
 */
async function query<T extends pg.QueryResultRow>(
  q: string,
  values: unknown[] = [],
): Promise<pg.QueryResult<T> | null> {
  try {
    const p = getPool();
    return await p.query<T>(q, values);
  } catch (err) {
    console.error('Villa í gagnagrunnsfyrirspurn', err);
    return null;
  }
}

type TodoRow = pg.QueryResultRow & {
  id: number;
  title: string;
  finished: boolean;
  created: Date;
};

/**
 * @returns true ef tókst, false annars
 */
export async function init(): Promise<boolean> {
  const sql = `
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      finished BOOLEAN NOT NULL DEFAULT false,
      created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const res = await query(sql);
  return res !== null;
}

/**
 * @returns Listi af verkefnum eða null ef villa
 */
export async function listTodos(): Promise<Todo[] | null> {
  const sql = `
    SELECT id, title, finished, created
    FROM todos
    ORDER BY finished ASC, created DESC
  `;

  const res = await query<TodoRow>(sql);
  if (!res) return null;

  return res.rows as unknown as Todo[];
}

/**
 * Býr til nýtt verkefni.
 * @param title Titill verkefnis
 * @returns Nýtt verkefni eða null ef villa
 */
export async function createTodo(title: string): Promise<Todo | null> {
  const sql = `
    INSERT INTO todos (title)
    VALUES ($1)
    RETURNING id, title, finished, created
  `;

  const res = await query<TodoRow>(sql, [title]);
  if (!res) return null;

  return (res.rows[0] ?? null) as unknown as Todo | null;
}

/**
 * Uppfærir verkefni.
 * @param id Auðkenni verkefnis
 * @param title Nýr titill
 * @param finished Ný staða (klárað eða ekki)
 * @returns Uppfært verkefni eða null ef villa
 */
export async function updateTodo(
  id: number,
  title: string,
  finished: boolean,
): Promise<Todo | null> {
  const sql = `
    UPDATE todos
    SET title = $1, finished = $2
    WHERE id = $3
    RETURNING id, title, finished, created
  `;

  const res = await query<TodoRow>(sql, [title, finished, id]);
  if (!res) return null;

  return (res.rows[0] ?? null) as unknown as Todo | null;
}

/**
 * Eyðir verkefni.
 * @param id Auðkenni verkefnis
 * @returns true ef eytt, false ef fannst ekki, null ef villa
 */
export async function deleteTodo(id: number): Promise<boolean | null> {
  const sql = `
    DELETE FROM todos
    WHERE id = $1
  `;

  const res = await query(sql, [id]);
  if (!res) return null;

  return (res.rowCount ?? 0) > 0;
}

/**
 * Eyðir öllum kláruðum verkefnum.
 * @returns Fjöldi eyddra verkefna eða null ef villa
 */
export async function deleteFinishedTodos(): Promise<number | null> {
  const sql = `
    DELETE FROM todos
    WHERE finished = true
  `;

  const res = await query(sql);
  if (!res) return null;

  return res.rowCount ?? 0;
}
