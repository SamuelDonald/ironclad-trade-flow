

## Add Christiannse04@gmail.com as Superadmin

### User Found
- **Email:** christiannse04@gmail.com
- **Name:** Christian Admin
- **User ID:** `d478a938-c7e2-47c9-ac7f-fd63562a1810`

### Action

Insert a row into the `admin_users` table:

```sql
INSERT INTO admin_users (user_id, email, role)
VALUES ('d478a938-c7e2-47c9-ac7f-fd63562a1810', 'christiannse04@gmail.com', 'superadmin');
```

This will grant full admin dashboard access when logging in with that email. No code changes are needed -- the existing `admin-check` edge function will automatically detect the new row and grant access.

