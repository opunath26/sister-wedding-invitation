create or replace function public.consume_rate_limit(_key text, _limit int, _window_seconds int)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare n int;
begin
  perform pg_advisory_xact_lock(hashtextextended(_key, 0));
  delete from public.rate_limits where key = _key and at < now() - make_interval(secs => _window_seconds);
  select count(*) into n from public.rate_limits where key = _key;
  if n >= _limit then return false; end if;
  insert into public.rate_limits(key) values (_key);
  return true;
end $$;
revoke all on function public.consume_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, int, int) to service_role;

alter table public.wedding_rsvps add column if not exists email_token_hash text;