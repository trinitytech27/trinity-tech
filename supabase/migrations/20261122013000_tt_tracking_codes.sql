-- Trinity Tech tracking IDs: TT-001, TT-002, ... (older SXD- codes stay valid)
create or replace function public.studio_generate_tracking_code()
returns text language plpgsql security definer set search_path = '' as $$
declare
  seq_val bigint;
begin
  select nextval('public.studio_enquiry_seq') into seq_val;
  if seq_val < 1000 then
    return 'TT-' || lpad(seq_val::text, 3, '0');
  end if;
  return 'TT-' || seq_val::text;
end;
$$;

revoke all on function public.studio_generate_tracking_code() from public, anon, authenticated;
grant execute on function public.studio_generate_tracking_code() to service_role;
