import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib.mjs';

const [slug, title = 'Новый прототип'] = process.argv.slice(2);
if (!slug || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 60) {
  console.error('Использование: npm run prototype:new -- my-screen "Название". ID: латиница, цифры, дефис; до 60 символов.');
  process.exit(1);
}
const folder = path.join(root, 'src/prototypes', slug);
if (fs.existsSync(folder)) { console.error(`Прототип ${slug} уже существует; выберите новый ID.`); process.exit(1); }
fs.mkdirSync(folder);
fs.writeFileSync(path.join(folder, 'index.tsx'), `import { Collection } from '../../recipes/Collection';

export const meta = { title: ${JSON.stringify(title)}, description: 'Новый вариант на компонентах Dais', category: 'Черновик' };

export default function Prototype() {
  return <Collection title={${JSON.stringify(title)}} storageKey={${JSON.stringify('dais-prototype:' + slug + ':v1')}} />;
}
`);
console.log(`Создан src/prototypes/${slug}/index.tsx. Адрес: /#/${slug}. Галерея подхватит его автоматически.`);
