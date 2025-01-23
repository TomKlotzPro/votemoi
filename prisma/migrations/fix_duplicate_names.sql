-- Delete duplicate users keeping the one with the most votes
WITH DuplicateUsers AS (
  SELECT id, name,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY (
      SELECT COUNT(*) FROM "Vote" WHERE "userId" = "User".id
    ) DESC) as rn
  FROM "User"
)
DELETE FROM "User"
WHERE id IN (
  SELECT id FROM DuplicateUsers WHERE rn > 1
);
