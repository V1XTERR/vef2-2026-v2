import type { Todo } from '../types.js';

type Props = {
  todos: Todo[];
};

export function TodoPage({ todos }: Props) {
  const hasFinished = todos.some((t) => t.finished);

  return (
    <html lang="is">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Todos</title>
        <link rel="stylesheet" href="/static/styles.css" />
      </head>
      <body>
        <main className="container">
          <header className="header">
            <h1>Verkefnalisti.</h1>
            <p className="muted">Ég fékk {todos.length} verkefni.</p>
          </header>

          <section className="card">
            <form method="post" action="/add" className="row">
              <input
                className="input"
                type="text"
                name="title"
                placeholder="Nýtt verkefni..."
                maxLength={255}
                required
              />
              <button className="btn" type="submit">
                Bæta við
              </button>
            </form>

            {todos.length === 0 ? (
              <p className="empty">Engin verkefni enn. Bættu við fyrsta </p>
            ) : (
              <ul className="list">
                {todos.map((todo) => (
                  <li key={todo.id} className="item">
                    <form method="post" action="/toggle">
                      <input type="hidden" name="id" value={todo.id} />
                      <button
                        type="submit"
                        className={`todo ${todo.finished ? 'done' : ''}`}
                        aria-label={`Toggle ${todo.title}`}
                      >
                        <span className="check">{todo.finished ? '✅' : '⬜️'}</span>
                        <span className="title">{todo.title}</span>
                      </button>
                    </form>

                    <form method="post" action="/delete">
                      <input type="hidden" name="id" value={todo.id} />
                      <button className="icon" type="submit" aria-label={`Delete ${todo.title}`}>
                        ❌
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <div className="footer">
              <form method="post" action="/delete-finished">
                <button className="btn secondary" type="submit" disabled={!hasFinished}>
                  Eyða kláruðum
                </button>
              </form>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
