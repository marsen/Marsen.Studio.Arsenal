// 管理員帳號 seed（CLI；用 node --env-file=.env.local 執行）
// 明碼僅存在於此腳本執行時的環境變數，DB 只存 bcrypt hash。重跑不會覆蓋既有帳號（idempotent）。
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  console.error('[seed] DATABASE_URL is required（請設定 .env.local）');
  process.exit(1);
}
if (!process.env.SEED_ADMIN_USERNAME || !process.env.SEED_ADMIN_PASSWORD) {
  console.error(
    '[seed] SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD is required（請設定 .env.local，僅用於本次建立帳號，不會存進程式碼或版控）'
  );
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME;
  const hash = bcrypt.hashSync(process.env.SEED_ADMIN_PASSWORD, 10);

  await sql`
    INSERT INTO admin_users (username, password_hash, enabled)
    VALUES (${username}, ${hash}, true)
    ON CONFLICT (username) DO NOTHING
  `;
  console.log(`✓ ${username}`);
  console.log('seed done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
