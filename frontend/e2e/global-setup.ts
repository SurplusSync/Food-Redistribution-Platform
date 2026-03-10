/**
 * Playwright Global Setup
 *
 * Resets test user state before each E2E test run to ensure
 * a clean environment (avoids accumulated state from previous runs).
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
  const sqlFile = path.resolve(__dirname, '..', '..', 'scripts', 'reset-test-state.sql');
  try {
    execSync(
      `Get-Content "${sqlFile}" | docker exec -i surplus_db psql -U student -d surplus_db`,
      { shell: 'powershell.exe', stdio: 'pipe', timeout: 15_000 }
    );
    console.log('[globalSetup] Test DB state reset successfully');
  } catch (err: any) {
    console.warn('[globalSetup] Failed to reset DB state (tests may still work):', err.message);
  }
}
