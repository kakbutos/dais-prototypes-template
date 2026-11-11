# API компонентов установленной версии

Это короткие примеры композиции, а не замена API установленных пакетов. Перед применением сверяйте экспорты и свойства с локальными типами; используемые версии смотрите в package.json, package-lock.json и установленном пакете. После обновления зависимостей перепроверьте примеры.

## Где искать

Начинайте с публичных экспортов `node_modules/@daisforge/ui/index.d.ts`, `icons/index.d.ts` и `tokens/index.d.ts`. Реэкспорт может вести в `node_modules/@salutejs/sdds-finai/types/components/<Component>/`; базовые типы — в `@salutejs/plasma-new-hope/types/components/`. Читать эти файлы можно, импортировать в приложение следует через публичные модули Dais.

## TableCanvas и MCP

В проверенном `@daisforge/ui-mcp@0.2.10` карточка TableCanvas ошибочно связана с `TableCanvasLoggerFiltersProps`: props counts/onChange/value и minimalUsage относятся к фильтрам журнала, не основной таблице. Для таблицы используй `src/recipes/Collection.tsx` и локальные типы: `@daisforge/ui/components/TableCanvas/TableCanvas.d.ts`, `TableCanvas/types/column-config.type.d.ts`; для Canvas.* — `TableGlide/lib/canvas/components/index.d.ts` внутри пакета. Успех mcp:check подтверждает доступность сервера, не правильность карточки. После обновления MCP перепроверь оговорку.

## Окружение, цвета и размеры

- `src/AppProviders.tsx` подключает светлую тему и PopupProvider для обычного приложения и HTML. Повторная обёртка PopupProvider в прототипах не нужна; ToastProvider добавляется отдельно при использовании toast.
- Импорт токена проверяет его имя, но не назначение. Для светлого фона выбирай подходящий backgroundPrimary/surfaceSolidCard/surfaceSolidSecondary; surfaceSolidDefault не означает белый фон.
- В canvas передавай вычисленный цвет через `getTokenValue` из `@daisforge/ui/utils`, а не строку `var(...)`. Вычисляй после применения темы в браузере; при смене темы обновляй значение.
- Для явной пиксельной высоты TextArea передавай строку с единицей, например height="72px". Не предполагай, что числовой размер любого компонента означает пиксели; сверяй его контракт и результат.

## Tabs

Управление выбранной вкладкой и клавиатурным индексом задаётся явно. `value` у TabItem предназначен для отображаемого значения рядом с текстом, не используйте его как скрытый ID.

```tsx
const [index, setIndex] = useState(0);
<Tabs index={index} size="s">
  {['Общее', 'Детали'].map((label, itemIndex) => (
    <TabItem key={label} size="s" itemIndex={itemIndex}
      onIndexChange={setIndex} selected={index === itemIndex}
      aria-selected={index === itemIndex} onClick={() => setIndex(itemIndex)}>
      {label}
    </TabItem>
  ))}
</Tabs>
```

Контент активной панели переключайте тем же состоянием; свяжите вкладки с панелями через доступные ARIA-атрибуты. Проверьте клики, фокус и клавиатуру в готовом экране.

## NumberFormat

Разделитель задавайте явно по формату экрана. Пример для десятичной запятой:

```tsx
const [amount, setAmount] = useState('');
<NumberFormat label="План" value={amount}
  decimalSeparator="," decimalScale={2}
  onChange={event => setAmount(event?.target.value ?? '')} />
```

Строка ввода с запятой не является числом JavaScript. Перед расчётами отдельно нормализуйте разрешённые разделители. Проверьте сценарий `12,5`, очистку и нужное количество знаков. Не переносите правила числового поля в другие поля автоматически.

## DatePicker

Для строкового состояния и формата даты:

```tsx
const [date, setDate] = useState<string | undefined>();
<DatePicker label="Дата" value={date} format="DD.MM.YYYY"
  onChangeValue={(_event, value) => setDate(value)} />
```

Для новых сценариев используйте onChangeValue; onChange отмечен в базовых типах как устаревший. Проверьте ручной ввод и выбор даты календарём, если они нужны макету.

## Toast

Состояние показа и таймаут задаёт ToastProvider/useToast. timeout относится к showToast, а не к произвольному свойству самого Toast:

```tsx
function SaveAction() {
  const { showToast } = useToast();
  return <Button view="accent" size="s"
    onClick={() => showToast({ text: 'Сохранено', timeout: 3000 })}>
    Сохранить
  </Button>;
}
<ToastProvider><SaveAction /></ToastProvider>
```

Используйте это сообщение после фактического изменения состояния, а не вместо реализации сохранения.

## Иконки, кнопки и оформление

Ищите экспорт по смыслу в установленном наборе, не угадывайте суффиксы Mini/Fill/Outline. Например, IconSearch доступен через `@daisforge/ui/icons`; отсутствие IconSearchMini не означает отсутствия поиска. В примере Button используется view="accent"; его доступность, допустимые размеры и остальные значения сверяйте с типами установленного компонента. Не переносите варианты другого компонента.

Правила styled-components, токенов, типографики и пример IconButton находятся в dais-prototype. Проверяйте применение примеров через TypeScript в текущем проекте; браузерную работоспособность конкретного экрана проверяйте отдельно.
