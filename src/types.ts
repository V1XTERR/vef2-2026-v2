export type Todo = {
  id: number;
  title: string;
  finished: boolean;
  created: Date;
};

export type ValidationResult =
  | { ok: true; data: { title: string } }
  | { ok: false; error: string };
