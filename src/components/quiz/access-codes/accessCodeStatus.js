export const getAccessCodeStatus = (code, now = new Date()) => {
  if (code.revoked_at) return "revoked";
  if (code.is_used) return "used";
  if (code.expires_at && new Date(code.expires_at) < now) return "expired";
  return "unused";
};
