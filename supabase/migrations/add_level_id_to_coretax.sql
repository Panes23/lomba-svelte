-- 1. Tambah kolom level_id (tanpa constraint NOT NULL dulu)
ALTER TABLE coretax 
ADD COLUMN level_id UUID REFERENCES privilage(id);

-- 2. Pastikan semua level yang diperlukan ada di tabel privilage
INSERT INTO privilage (id, level, akses, created_at, updated_at)
SELECT 
  uuid_generate_v4(), -- Generate UUID baru
  level, -- Level dari coretax
  ARRAY['list users']::text[], -- Default akses minimal
  NOW(), -- Created at
  NOW() -- Updated at
FROM (
  SELECT DISTINCT level 
  FROM coretax c
  WHERE NOT EXISTS (
    SELECT 1 FROM privilage p 
    WHERE p.level = c.level
  )
) AS unique_levels;

-- 3. Update data yang sudah ada
UPDATE coretax c
SET level_id = p.id
FROM privilage p
WHERE LOWER(c.level) = LOWER(p.level);

-- 4. Verifikasi tidak ada NULL values
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM coretax WHERE level_id IS NULL) THEN
    RAISE EXCEPTION 'Masih ada level_id yang NULL';
  END IF;
END $$;

-- 5. Setelah yakin tidak ada NULL, baru set NOT NULL constraint
ALTER TABLE coretax 
ALTER COLUMN level_id SET NOT NULL;

-- 6. Tambahkan index untuk mempercepat query
CREATE INDEX idx_coretax_level_id ON coretax(level_id); 