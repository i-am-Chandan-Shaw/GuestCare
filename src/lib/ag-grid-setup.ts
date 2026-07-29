import type { Module } from "ag-grid-community";
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

export const AG_GRID_MODULES: Module[] = [
  InfiniteRowModelModule,
  ClientSideRowModelModule,
  CellStyleModule,
  RowApiModule,
  EventApiModule,
  ...(import.meta.env.DEV ? [ValidationModule] : []),
];

ModuleRegistry.registerModules(AG_GRID_MODULES);

provideGlobalGridOptions({
  theme: themeQuartz.withParams({
    headerBackgroundColor: "var(--color-grid-header-bg)",
    borderColor: "var(--color-grid-divider)",
    wrapperBorderRadius: 12,
    fontFamily: "var(--font-sans)",
  }),
});
