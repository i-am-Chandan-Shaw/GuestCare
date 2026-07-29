import {
  CellStyleModule,
  ClientSideRowModelModule,
  EventApiModule,
  InfiniteRowModelModule,
  ModuleRegistry,
  RowApiModule,
  ValidationModule,
  provideGlobalGridOptions,
  themeQuartz,
} from "ag-grid-community";

ModuleRegistry.registerModules([
  InfiniteRowModelModule,
  ClientSideRowModelModule,
  CellStyleModule,
  RowApiModule,
  EventApiModule,
  ...(import.meta.env.DEV ? [ValidationModule] : []),
]);

provideGlobalGridOptions({
  theme: themeQuartz.withParams({
    headerBackgroundColor: "var(--color-grid-header-bg)",
    borderColor: "var(--color-grid-divider)",
    wrapperBorderRadius: 12,
    fontFamily: "var(--font-sans)",
  }),
});
