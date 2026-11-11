/**
 * После экспорта проверяет, что dist-html содержит только index.html, и выводит размер.
 * Вызывается командой npm run export:html; поведение интерфейса и сетевые запросы не проверяет.
 */
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib.mjs';

const output = path.join(root, 'dist-html');
const files = fs.readdirSync(output);
if (files.length !== 1 || files[0] !== 'index.html') {
  throw new Error(`Экспорт содержит дополнительные файлы: ${files.join(', ')}. Встройте ресурсы в HTML (не используйте public/ для автономного экспорта).`);
}
const size = fs.statSync(path.join(output, 'index.html')).size;
console.log(`Готово: dist-html/index.html (${(size / 1024 / 1024).toFixed(2)} МБ). Передайте этот один файл. Откройте файл в браузере для просмотра.`);
