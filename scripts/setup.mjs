import { requireNode, npm, root } from './lib.mjs';
import { writeAgentConfigs } from './write-agent-configs.mjs';
import { syncSkills } from './sync-skills.mjs';

try {
  requireNode();
  console.log('Устанавливаем зависимости из package-lock.json…');
  npm(['ci', '--no-audit', '--no-fund']);
  await writeAgentConfigs(root);
  syncSkills(root);
  npm(['run', 'doctor']);
  npm(['run', 'mcp:check']);
  console.log('\nГотово. Перезапустите агент в этой папке и разрешите подключение dais-ui MCP.');
  console.log('Запуск: npm run dev. Запрос агенту: «Собери новый макет по этому PNG».');
} catch (error) { console.error(error.message); process.exitCode = 1; }
