/**
 * Тестирует сохранение настроек при повторном setup, обработку повреждённых конфигов
 * и защиту при создании вариантов. Запуск: npm test, в том числе в GitHub Actions.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse as parseToml } from 'smol-toml';
import { parse as parseJsonc } from 'jsonc-parser';
import { writeAgentConfigs } from '../scripts/write-agent-configs.mjs';
import { root } from '../scripts/lib.mjs';

test('повторная настройка сохраняет другие MCP, настройки и пользовательские макеты', async () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'dais-config-test-'));
  try {
    fs.mkdirSync(path.join(folder, '.codex'), { recursive: true });
    fs.mkdirSync(path.join(folder, 'src/prototypes/custom'), { recursive: true });
    fs.writeFileSync(path.join(folder, 'src/prototypes/custom/index.tsx'), 'user content');
    fs.writeFileSync(path.join(folder, '.codex/config.toml'), 'model = "user-model"\n[mcp_servers.other]\ncommand = "other-server"\n');
    fs.writeFileSync(path.join(folder, '.mcp.json'), '{"mcpServers":{"other":{"command":"other-server"}},"custom":true}');
    await writeAgentConfigs(folder);
    await writeAgentConfigs(folder);
    const toml = parseToml(fs.readFileSync(path.join(folder, '.codex/config.toml'), 'utf8'));
    assert.equal(toml.model, 'user-model');
    assert.equal(toml.mcp_servers.other.command, 'other-server');
    assert.equal(toml.mcp_servers['dais-ui'].cwd, folder);
    const json = parseJsonc(fs.readFileSync(path.join(folder, '.mcp.json'), 'utf8'));
    assert.equal(json.mcpServers.other.command, 'other-server');
    assert.equal(json.custom, true);
    assert.equal(fs.readFileSync(path.join(folder, 'src/prototypes/custom/index.tsx'), 'utf8'), 'user content');
  } finally { fs.rmSync(folder, { recursive: true, force: true }); }
});

test('повреждённые конфиги не приводят к частичной перезаписи', async () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'dais-bad-config-'));
  try {
    fs.writeFileSync(path.join(folder, '.mcp.json'), '{bad');
    await assert.rejects(writeAgentConfigs(folder), /синтаксис/);
    assert.equal(fs.existsSync(path.join(folder, '.codex/config.toml')), false);
    assert.equal(fs.readFileSync(path.join(folder, '.mcp.json'), 'utf8'), '{bad');
  } finally { fs.rmSync(folder, { recursive: true, force: true }); }
});

test('создание варианта не перезаписывает существующий и не выходит из своей папки', () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'dais-new-test-'));
  try {
    fs.mkdirSync(path.join(folder, 'scripts'));
    fs.mkdirSync(path.join(folder, 'src/prototypes'), { recursive: true });
    for (const name of ['lib.mjs', 'new-prototype.mjs']) fs.copyFileSync(path.join(root, 'scripts', name), path.join(folder, 'scripts', name));
    const run = (...args) => spawnSync(process.execPath, [path.join(folder, 'scripts/new-prototype.mjs'), ...args], { encoding: 'utf8' });
    assert.equal(run('../outside').status, 1);
    assert.equal(run('my-screen', 'Название "с кавычками"').status, 0);
    const file = path.join(folder, 'src/prototypes/my-screen/index.tsx');
    fs.writeFileSync(file, 'user changed');
    assert.equal(run('my-screen').status, 1);
    assert.equal(fs.readFileSync(file, 'utf8'), 'user changed');
  } finally { fs.rmSync(folder, { recursive: true, force: true }); }
});
