import * as fs from 'fs';
import * as path from 'path';

describe('Database backup script', () => {
  const scriptPath = path.resolve(__dirname, '../../../scripts/backup_db.sh');

  it('should exist in scripts folder', () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it('should include required backup workflow commands', () => {
    const script = fs.readFileSync(scriptPath, 'utf8');

    expect(script).toContain('BACKUP_DIR="./backups"');
    expect(script).toContain('CONTAINER_NAME="surplus_db"');
    expect(script).toContain('docker exec -t $CONTAINER_NAME pg_dump -c -U surplus_admin -d surplus_db > $BACKUP_FILE');
    expect(script).toContain('if [ $? -eq 0 ]; then');
    expect(script).toContain('tail -n +6');
    expect(script).toContain('exit 1');
  });
});
