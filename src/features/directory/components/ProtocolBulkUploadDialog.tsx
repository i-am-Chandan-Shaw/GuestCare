import { useEffect, useId, useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { getPropertiesPaginated } from "@/features/directory/api/properties.api";
import { createProtocol, linkProtocolToProperties } from "@/features/directory/api/protocols.api";
import { getClientErrorMessage } from "@/shared/lib/client-error";
import {
  parseProtocolSheet,
  type ParsedProtocolRow,
  type SkippedProtocolRow,
} from "@/features/directory/lib/parse-protocol-sheet";
import type { PropertyListItem } from "@/features/directory/lib/map-property-row";
import { cn } from "@/lib/utils";

type Step = "pick" | "review";
type PropertyMode = "this" | "all" | "selected";

async function loadAllProperties(customerId: string): Promise<PropertyListItem[]> {
  const limit = 100;
  let page = 1;
  let totalPages = 1;
  const all: PropertyListItem[] = [];

  while (page <= totalPages) {
    const result = await getPropertiesPaginated({ customerId, page, limit });
    all.push(...result.data);
    totalPages = Math.max(1, result.pagination.totalPages);
    page += 1;
  }

  return all;
}

export function ProtocolBulkUploadDialog({
  open,
  customerId,
  propertyId,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  customerId: string;
  propertyId: string;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("pick");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedProtocolRow[]>([]);
  const [skipped, setSkipped] = useState<SkippedProtocolRow[]>([]);
  const [duplicateNames, setDuplicateNames] = useState<string[]>([]);
  const [selectedProtocolIds, setSelectedProtocolIds] = useState<Set<string>>(new Set());
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [propertyMode, setPropertyMode] = useState<PropertyMode>("this");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(
    () => new Set([propertyId]),
  );
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    if (open) return;
    setStep("pick");
    setParsing(false);
    setSaving(false);
    setLoadingProperties(false);
    setFileName(null);
    setRows([]);
    setSkipped([]);
    setDuplicateNames([]);
    setSelectedProtocolIds(new Set());
    setProperties([]);
    setPropertyMode("this");
    setSelectedPropertyIds(new Set([propertyId]));
    setProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, propertyId]);

  useEffect(() => {
    if (!open || step !== "review") return;

    let cancelled = false;
    setLoadingProperties(true);
    void loadAllProperties(customerId)
      .then((list) => {
        if (cancelled) return;
        setProperties(list);
        setSelectedPropertyIds((prev) => {
          if (prev.size > 0) return prev;
          return new Set([propertyId]);
        });
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getClientErrorMessage(error, "Failed to load properties."));
      })
      .finally(() => {
        if (!cancelled) setLoadingProperties(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, step, customerId, propertyId]);

  const selectedProtocolCount = selectedProtocolIds.size;

  const targetPropertyIds = (() => {
    if (propertyMode === "this") return [propertyId];
    if (propertyMode === "all") return properties.map((p) => p.id);
    return properties.filter((p) => selectedPropertyIds.has(p.id)).map((p) => p.id);
  })();

  const targetPropertyCount = targetPropertyIds.length;
  const createTotal = selectedProtocolCount;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setParsing(true);
    try {
      const result = await parseProtocolSheet(file);
      if (result.rows.length === 0 && result.skipped.length === 0) {
        toast.error("No protocol rows found in this sheet.");
        return;
      }
      setFileName(file.name);
      setRows(result.rows);
      setSkipped(result.skipped);
      setDuplicateNames(result.duplicateNames);
      setSelectedProtocolIds(new Set(result.rows.map((row) => row.id)));
      setPropertyMode("this");
      setSelectedPropertyIds(new Set([propertyId]));
      setStep("review");
      if (result.rows.length === 0) {
        toast.error("No valid protocols to import. Check skipped rows.");
      }
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to read the sheet."));
    } finally {
      setParsing(false);
    }
  };

  const toggleProtocolId = (id: string) => {
    setSelectedProtocolIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePropertyId = (id: string) => {
    setSelectedPropertyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    const protocols = rows.filter((row) => selectedProtocolIds.has(row.id));
    if (protocols.length === 0) {
      toast.error("Select at least one protocol to save.");
      return;
    }
    if (targetPropertyIds.length === 0) {
      toast.error("Select at least one property.");
      return;
    }

    const total = protocols.length;
    setSaving(true);
    setProgress({ done: 0, total });
    let created = 0;
    let failed = 0;

    for (const row of protocols) {
      try {
        const [firstPropertyId, ...otherPropertyIds] = targetPropertyIds;
        const createdProtocol = await createProtocol({
          ...row.payload,
          propertyId: firstPropertyId!,
        });
        if (otherPropertyIds.length > 0) {
          await linkProtocolToProperties({
            protocolId: createdProtocol.id,
            propertyIds: otherPropertyIds,
          });
        }
        created += 1;
      } catch {
        failed += 1;
      } finally {
        setProgress((prev) =>
          prev ? { ...prev, done: Math.min(prev.done + 1, prev.total) } : prev,
        );
      }
    }

    setSaving(false);
    setProgress(null);

    if (created > 0) {
      onSaved();
      toast.success(
        failed > 0
          ? `Created ${created} of ${total} protocols (shared across ${targetPropertyIds.length} properties).`
          : `Created ${created} ${created === 1 ? "protocol" : "protocols"} shared across ${targetPropertyIds.length} ${targetPropertyIds.length === 1 ? "property" : "properties"}.`,
      );
      onOpenChange(false);
      return;
    }

    toast.error("Could not create any protocols. Check the sheet and try again.");
  };

  const resetToPick = () => {
    setStep("pick");
    setRows([]);
    setSkipped([]);
    setDuplicateNames([]);
    setSelectedProtocolIds(new Set());
    setFileName(null);
    setPropertyMode("this");
    setSelectedPropertyIds(new Set([propertyId]));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:rounded-xl"
        showCloseButton={!saving}
        onPointerDownOutside={(event) => {
          if (saving) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (saving) event.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 space-y-0 border-b border-border-color px-6 py-5 text-left">
          <DialogTitle className="text-[17px] font-[600] tracking-tight text-text-primary">
            Upload Excel
          </DialogTitle>
          <DialogDescription className="mt-1 text-[13px] text-text-secondary">
            {step === "pick"
              ? "Upload a protocol sheet (.xlsx or .csv). Each column maps to one field — we won’t split or rewrite cell text."
              : "Choose which protocols to import and which properties they apply to."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {step === "pick" ? (
            <div className="space-y-4">
              <label
                htmlFor={inputId}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--kn-radius-lg)] border border-dashed border-border-color bg-app-bg px-4 py-10 text-center transition-colors",
                  "hover:border-brand-primary/40 hover:bg-app-bg/80",
                  parsing && "pointer-events-none opacity-70",
                )}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-card-bg text-brand-primary shadow-sm">
                  {parsing ? (
                    <Upload className="h-5 w-5 animate-pulse" strokeWidth={2} />
                  ) : (
                    <FileSpreadsheet className="h-5 w-5" strokeWidth={2} />
                  )}
                </span>
                <span className="text-[14px] font-semibold text-text-primary">
                  {parsing ? "Reading sheet…" : "Choose Excel or CSV file"}
                </span>
                <span className="text-[12px] text-text-secondary">
                  Columns: Category, Issue, Reservation Verification, Troubleshooting…
                </span>
              </label>
              <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                className="sr-only"
                disabled={parsing}
                onChange={(event) => {
                  void handleFile(event.target.files?.[0]);
                }}
              />
            </div>
          ) : (
            <div className="space-y-5">
              {fileName ? (
                <p className="truncate text-[12px] font-medium text-text-secondary">
                  File: <span className="text-text-primary">{fileName}</span>
                </p>
              ) : null}

              {duplicateNames.length > 0 ? (
                <p className="rounded-md border border-border-color bg-app-bg px-3 py-2 text-[12px] text-text-secondary">
                  Duplicate issues in sheet: {duplicateNames.join(", ")}. You can uncheck extras
                  before saving.
                </p>
              ) : null}

              {rows.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-text-primary">
                      Protocols ({selectedProtocolCount} of {rows.length} selected)
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-[12px] font-semibold text-brand-primary hover:underline"
                        onClick={() => setSelectedProtocolIds(new Set(rows.map((r) => r.id)))}
                        disabled={saving}
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        className="text-[12px] font-semibold text-text-secondary hover:underline"
                        onClick={() => setSelectedProtocolIds(new Set())}
                        disabled={saving}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <ul className="divide-y divide-border-color overflow-hidden rounded-[var(--kn-radius-lg)] border border-border-color">
                    {rows.map((row) => {
                      const checked = selectedProtocolIds.has(row.id);
                      return (
                        <li key={row.id}>
                          <label
                            className={cn(
                              "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors",
                              checked ? "bg-card-bg" : "bg-app-bg/40",
                              saving && "pointer-events-none opacity-70",
                            )}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-[var(--kn-color-brand-primary,#00b189)]"
                              checked={checked}
                              disabled={saving}
                              onChange={() => toggleProtocolId(row.id)}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-medium text-text-primary">
                                {row.name}
                              </span>
                              <span className="block truncate text-[11px] text-text-muted">
                                {row.payload.category}
                                {row.sheetPriority ? ` · ${row.sheetPriority}` : ""}
                              </span>
                            </span>
                            <span className="shrink-0 text-[11px] text-text-muted">
                              Row {row.sheetRow}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {skipped.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[13px] font-semibold text-text-primary">
                    Skipped / needs fix ({skipped.length})
                  </p>
                  <ul className="space-y-1.5 rounded-[var(--kn-radius-lg)] border border-border-color bg-app-bg px-3 py-2">
                    {skipped.map((row) => (
                      <li
                        key={`${row.sheetRow}-${row.name}`}
                        className="text-[12px] text-text-secondary"
                      >
                        <span className="font-semibold text-text-primary">
                          {row.name || "(unnamed)"}
                        </span>
                        {" — "}
                        {row.reason} (row {row.sheetRow})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-text-primary">Apply to properties</p>
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      { id: "this", label: "This property only" },
                      { id: "all", label: "All properties for this customer" },
                      { id: "selected", label: "Selected properties" },
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-text-primary",
                        saving && "pointer-events-none opacity-70",
                      )}
                    >
                      <input
                        type="radio"
                        name="protocol-bulk-property-mode"
                        className="accent-[var(--kn-color-brand-primary,#00b189)]"
                        checked={propertyMode === option.id}
                        disabled={saving || loadingProperties}
                        onChange={() => {
                          setPropertyMode(option.id);
                          if (option.id === "this") {
                            setSelectedPropertyIds(new Set([propertyId]));
                          }
                          if (option.id === "all") {
                            setSelectedPropertyIds(new Set(properties.map((p) => p.id)));
                          }
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                {propertyMode === "selected" ? (
                  <div className="space-y-2 pt-1">
                    {loadingProperties ? (
                      <p className="text-[12px] text-text-secondary">Loading properties…</p>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-[12px] font-semibold text-brand-primary hover:underline"
                            disabled={saving}
                            onClick={() =>
                              setSelectedPropertyIds(new Set(properties.map((p) => p.id)))
                            }
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            className="text-[12px] font-semibold text-text-secondary hover:underline"
                            disabled={saving}
                            onClick={() => setSelectedPropertyIds(new Set())}
                          >
                            Clear
                          </button>
                        </div>
                        <ul className="max-h-48 divide-y divide-border-color overflow-y-auto rounded-[var(--kn-radius-lg)] border border-border-color">
                          {properties.map((property) => {
                            const checked = selectedPropertyIds.has(property.id);
                            return (
                              <li key={property.id}>
                                <label
                                  className={cn(
                                    "flex cursor-pointer items-center gap-3 px-3 py-2.5",
                                    checked ? "bg-card-bg" : "bg-app-bg/40",
                                    saving && "pointer-events-none opacity-70",
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-[var(--kn-color-brand-primary,#00b189)]"
                                    checked={checked}
                                    disabled={saving}
                                    onChange={() => togglePropertyId(property.id)}
                                  />
                                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-text-primary">
                                    {property.name}
                                    {property.id === propertyId ? " (current)" : ""}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </div>
                ) : null}

                <p className="text-[12px] text-text-secondary">
                  {loadingProperties
                    ? "Loading properties…"
                    : `Will create ${createTotal} protocol${createTotal === 1 ? "" : "s"} shared across ${targetPropertyCount} ${targetPropertyCount === 1 ? "property" : "properties"}.`}
                </p>
              </div>

              {progress ? (
                <p className="text-[12px] font-medium text-text-secondary">
                  Saving {progress.done} of {progress.total}…
                </p>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-3 border-t border-border-color bg-app-bg px-6 py-4 sm:flex-row sm:justify-end">
          {step === "review" ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={saving}
              onClick={resetToPick}
            >
              Choose another file
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={parsing || saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          )}
          {step === "review" ? (
            <Button
              type="button"
              size="lg"
              loading={saving}
              disabled={
                selectedProtocolCount === 0 ||
                targetPropertyCount === 0 ||
                saving ||
                loadingProperties
              }
              onClick={() => void handleSave()}
            >
              Save selected ({createTotal})
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
