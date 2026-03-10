-- Reset test user state before E2E runs
UPDATE "user" SET "currentIntakeLoad" = 0, "karmaPoints" = 0 WHERE email IN ('donor@test.com', 'ngo@test.com', 'volunteer@test.com');
-- Clean up old E2E test donations to avoid interference
DELETE FROM donation WHERE name LIKE 'E2E-Test-Food-%';
DELETE FROM donation WHERE name LIKE 'RT-Test-%';
DELETE FROM donation WHERE name LIKE 'RT-Claim-%';
DELETE FROM donation WHERE name LIKE 'RT-Assign-%';
DELETE FROM donation WHERE name LIKE 'RT-Notif-%';
DELETE FROM donation WHERE name LIKE 'RT-Push-%';
