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
import { createProperty } from "@/features/directory/api/properties.api";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import {
  parsePropertySheet,
  type ParsedPropertyRow,
  type SkippedPropertyRow,
} from "@/features/directory/lib/parse-property-sheet";
import { cn } from "@/lib/utils";

type Step = "pick" | "review";

export function PropertyBulkUploadDialog({
  open,
  customerId,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  customerId: string;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("pick");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedPropertyRow[]>([]);
  const [skipped, setSkipped] = useState<SkippedPropertyRow[]>([]);
  const [duplicateNames, setDuplicateNames] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    if (open) return;
    setStep("pick");
    setParsing(false);
    setSaving(false);
    setFileName(null);
    setRows([]);
    setSkipped([]);
    setDuplicateNames([]);
    setSelectedIds(new Set());
    setProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open]);

  const selectedCount = selectedIds.size;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setParsing(true);
    try {
      const result = await parsePropertySheet(file);
      if (result.rows.length === 0 && result.skipped.length === 0) {
        toast.error("No property rows found in this sheet.");
        return;
      }
      setFileName(file.name);
      setRows(result.rows);
      setSkipped(result.skipped);
      setDuplicateNames(result.duplicateNames);
      setSelectedIds(new Set(result.rows.map((row) => row.id)));
      setStep("review");
      if (result.rows.length === 0) {
        toast.error("No valid properties to import. Check skipped rows.");
      }
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to read the sheet."));
    } finally {
      setParsing(false);
    }
  };

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(rows.map((row) => row.id)));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const handleSave = async () => {
    const toCreate = rows.filter((row) => selectedIds.has(row.id));
    if (toCreate.length === 0) {
      toast.error("Select at least one property to save.");
      return;
    }

    setSaving(true);
    setProgress({ done: 0, total: toCreate.length });
    let created = 0;
    let failed = 0;

    for (const row of toCreate) {
      try {
        await createProperty({
          ...row.payload,
          customerId,
          houseRules: row.payload.houseRules ?? [],
        });
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
          ? `Created ${created} of ${toCreate.length} properties.`
          : `Created ${created} ${created === 1 ? "property" : "properties"}.`,
      );
      onOpenChange(false);
      return;
    }

    toast.error("Could not create any properties. Check the sheet and try again.");
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
              ? "Upload a property sheet (.xlsx or .csv). Each column maps to one field — we won’t split or rewrite cell text."
              : "Review property names, then save the ones you want."}
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
                  Columns: PROPERTY NAME, Type, address, CHECK-IN, WIFI, HOUSE RULES, LAUNDRY…
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
            <div className="space-y-4">
              {fileName ? (
                <p className="truncate text-[12px] font-medium text-text-secondary">
                  File: <span className="text-text-primary">{fileName}</span>
                </p>
              ) : null}

              {duplicateNames.length > 0 ? (
                <p className="rounded-md border border-border-color bg-app-bg px-3 py-2 text-[12px] text-text-secondary">
                  Duplicate names in sheet: {duplicateNames.join(", ")}. You can uncheck extras
                  before saving.
                </p>
              ) : null}

              {rows.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-text-primary">
                      Properties ({selectedCount} of {rows.length} selected)
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-[12px] font-semibold text-brand-primary hover:underline"
                        onClick={selectAll}
                        disabled={saving}
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        className="text-[12px] font-semibold text-text-secondary hover:underline"
                        onClick={selectNone}
                        disabled={saving}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <ul className="divide-y divide-border-color overflow-hidden rounded-[var(--kn-radius-lg)] border border-border-color">
                    {rows.map((row) => {
                      const checked = selectedIds.has(row.id);
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
                              onChange={() => toggleId(row.id)}
                            />
                            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-text-primary">
                              {row.name}
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
              onClick={() => {
                setStep("pick");
                setRows([]);
                setSkipped([]);
                setDuplicateNames([]);
                setSelectedIds(new Set());
                setFileName(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
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
              disabled={selectedCount === 0 || saving}
              onClick={() => void handleSave()}
            >
              Save selected ({selectedCount})
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
