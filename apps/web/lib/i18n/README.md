# AceStudio i18n

All new UI copy should be added to `dictionaries.ts` first, then rendered through
`useLanguage().t`.

The dictionary shape is type-checked:

- Add the English key under `dictionaries.en`.
- Add the matching Chinese key under `dictionaries.zh`.
- TypeScript fails if the Chinese dictionary is missing a key.

Example:

```tsx
const { t } = useLanguage();

return <h1>{t.landing.hero.headline}</h1>;
```

`LanguageProvider` does not scan or mutate page text. It only owns the active
locale and exposes the matching dictionary. If a page needs translation, move
its visible UI copy into `dictionaries.ts` and read it through `useLanguage().t`.
