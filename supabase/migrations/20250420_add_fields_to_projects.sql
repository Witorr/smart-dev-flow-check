-- Adiciona campos extras à tabela projects
alter table projects
  add column if not exists attachments text[],
  add column if not exists is_team boolean default false,
  add column if not exists start_date date,
  add column if not exists end_date date;
