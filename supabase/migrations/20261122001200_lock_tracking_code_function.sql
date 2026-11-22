-- only the server (service role) issues tracking codes
revoke execute on function public.studio_generate_tracking_code() from authenticated;
