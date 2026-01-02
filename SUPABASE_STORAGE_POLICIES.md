# Supabase Storage Bucket Policies

This document describes the required security policies for Supabase Storage buckets used by AssignMate.

## Buckets Overview

| Bucket | Purpose | Public Read | Auth Write |
|--------|---------|-------------|------------|
| `portfolios` | Writer portfolio samples | ✅ Yes | ✅ Owner only |
| `avatars` | User profile pictures | ✅ Yes | ✅ Owner only |
| `chat-files` | Files shared in chat | ❌ No | ✅ Participants |
| `verification` | ID cards for verification | ❌ No | ✅ Owner only |

---

## Required RLS Policies (Set in Supabase Dashboard)

### 1. `portfolios` Bucket

**Policy: Public Read**
```sql
-- Allow anyone to view portfolios (they are public samples)
CREATE POLICY "Public can view portfolios"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');
```

**Policy: Owner Write**
```sql
-- Only the owner can upload/delete their portfolio items
CREATE POLICY "Users can upload own portfolios"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own portfolios"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 2. `avatars` Bucket

**Policy: Public Read**
```sql
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**Policy: Owner Write**
```sql
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 3. `chat-files` Bucket

**Policy: Authenticated Read (for now, stricter requires backend)**
```sql
-- Authenticated users can read chat files
-- Note: Stricter policy requires checking chat participants via backend/function
CREATE POLICY "Authenticated can view chat files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-files'
  AND auth.role() = 'authenticated'
);
```

**Policy: Authenticated Write**
```sql
CREATE POLICY "Authenticated can upload chat files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-files'
  AND auth.role() = 'authenticated'
);
```

---

### 4. `verification` Bucket (Most Secure)

**Policy: Owner Only (No Public Access)**
```sql
-- Only the owner can view their ID card
CREATE POLICY "Users can view own verification"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Only the owner can upload their ID card
CREATE POLICY "Users can upload own verification"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## File Size Limits

Set in Supabase Dashboard under Storage > Policies:

| Bucket | Max Size |
|--------|----------|
| `portfolios` | 5MB |
| `avatars` | 2MB |
| `chat-files` | 10MB |
| `verification` | 5MB |

---

## How to Apply These Policies

1. Go to your Supabase Dashboard
2. Navigate to **Storage** > **Policies**
3. For each bucket, click **New Policy**
4. Use the SQL snippets above to create proper RLS policies
5. Make sure buckets are set to the correct **Public/Private** setting

---

## Important Notes

- ⚠️ `chat-files` bucket requires backend validation for strict participant checking
- ⚠️ `verification` bucket contains sensitive ID cards - never make public
- ⚠️ Ensure all buckets have RLS enabled (default in Supabase)
