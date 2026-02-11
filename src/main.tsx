import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { TodoPage } from './components/TodoPage.js';
import {
  init,
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  deleteFinishedTodos,
} from './lib/db.js';

await init();

export const app = new Hono();

app.use('/static/*', serveStatic({ root: './' }));

app.get('/', async (c) => {
  const todos = await listTodos();
  return c.html(<TodoPage todos={todos ?? []} />);
});

app.post('/add', async (c) => {
  const body = await c.req.parseBody();
  const title = body.title?.toString().trim();

  // validation: required + max lengthx
  if (!title || title.length > 255) {
    return c.redirect('/');
  }

  await createTodo(title);
  return c.redirect('/');
});

app.post('/toggle', async (c) => {
  const body = await c.req.parseBody();
  const id = Number(body.id);

  if (!Number.isFinite(id)) return c.redirect('/');

  const todos = await listTodos();
  const current = todos?.find((t) => t.id === id);
  if (!current) return c.redirect('/');

  await updateTodo(id, current.title, !current.finished);
  return c.redirect('/');
});

app.post('/delete', async (c) => {
  const body = await c.req.parseBody();
  const id = Number(body.id);

  if (!Number.isFinite(id)) return c.redirect('/');

  await deleteTodo(id);
  return c.redirect('/');
});

app.post('/delete-finished', async (c) => {
  await deleteFinishedTodos();
  return c.redirect('/');
});
