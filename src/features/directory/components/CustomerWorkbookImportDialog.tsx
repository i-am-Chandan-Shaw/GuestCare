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
import { createCustomer } from "@/features/directory/api/customers.api";
import { createProperty } from "@/features/directory/api/properties.api";
import { createProtocol } from "@/features/directory/api/protocols.api";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import {
  parseCustomerWorkbook,
  type ParsedCustomerWorkbook,
} from "@/features/directory/lib/parse-customer-workbook";
import { Input } from "@/shared/components/FloatingLabelField";

type Step = "form" | "review";

function isValidEmail(value: string) {
  return value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function CustomerWorkbookImportDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedCustomerWorkbook | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setStep("form");
    setName("");
    setEmail("");
    setNameError(undefined);
    setEmailError(undefined);
    setParsing(false);
    setSaving(false);
    setFileName(null);
    setParsed(null);
    setProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open]);

  const validateBasics = () => {
    const nextNameError = name.trim() ? undefined : "Name is required.";
    const nextEmailError = isValidEmail(email.trim()) ? undefined : "A valid email is required.";
    setNameError(nextNameError);
    setEmailError(nextEmailError);
    return !nextNameError && !nextEmailError;
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!validateBasics()) {
      toast.error("Enter customer name and a valid email before uploading.");
      return;
    }

    setParsing(true);
    try {
      const result = await parseCustomerWorkbook(file);
      setFileName(file.name);
      setParsed(result);
      setStep("review");
      if (
        result.properties.length === 0 &&
        result.protocols.length === 0 &&
        result.contacts.length === 0 &&
        result.guestVerificationSteps.length === 0 &&
        !result.pmsUrl &&
        !result.pmsUsername
      ) {
        toast.error("No importable data found in this workbook.");
      }
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to read the workbook."));
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parsed) return;
    if (!validateBasics()) return;

    setSaving(true);
    setProgress("Creating customer…");

    let customerId: string | null = null;
    let propertiesCreated = 0;
    let protocolsCreated = 0;
    let propertyFailures = 0;
    let protocolFailures = 0;

    try {
      const customer = await createCustomer({
        name: name.trim(),
        email: email.trim() || undefined,
        contacts: parsed.contacts,
        pmsUrl: parsed.pmsUrl,
        pmsUsername: parsed.pmsUsername,
        pmsPassword: parsed.pmsPassword,
        guestVerificationSteps: parsed.guestVerificationSteps,
      });
      customerId = customer.id;

      const propertyIds: string[] = [];
      for (let i = 0; i < parsed.properties.length; i += 1) {
        const row = parsed.properties[i]!;
        setProgress(`Creating properties… ${i + 1}/${parsed.properties.length}`);
        try {
          const property = await createProperty({
            ...row.payload,
            customerId: customer.id,
          });
          propertyIds.push(property.id);
          propertiesCreated += 1;
        } catch {
          propertyFailures += 1;
        }
      }

      const totalProtocols = propertyIds.length * parsed.protocols.length;
      let done = 0;
      for (const propertyId of propertyIds) {
        for (const protocol of parsed.protocols) {
          done += 1;
          setProgress(
            totalProtocols > 0
              ? `Creating protocols… ${done}/${totalProtocols}`
              : "Creating protocols…",
          );
          try {
            await createProtocol({
              ...protocol.payload,
              propertyId,
            });
            protocolsCreated += 1;
          } catch {
            protocolFailures += 1;
          }
        }
      }

      const parts = [
        "Customer created",
        `${propertiesCreated} propert${propertiesCreated === 1 ? "y" : "ies"}`,
        `${protocolsCreated} protocol${protocolsCreated === 1 ? "" : "s"}`,
        `${parsed.contacts.length} contact${parsed.contacts.length === 1 ? "" : "s"}`,
      ];
      toast.success(parts.join(" · "));

      if (propertyFailures > 0 || protocolFailures > 0) {
        toast.error(
          `Some rows failed (${propertyFailures} properties, ${protocolFailures} protocols).`,
        );
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getClientErrorMessage(
          error,
          customerId
            ? "Customer was created, but later import steps failed."
            : "Failed to create customer.",
        ),
      );
      if (customerId) onSaved();
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 border-b border-border-color px-5 py-4">
          <DialogTitle>Import customer from Excel</DialogTitle>
          <DialogDescription>
            Enter name and email, then upload a multi-sheet workbook (Property Info, Protocol,
            Emergency Contact, System details + steps).
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === "form" ? (
            <div className="space-y-4">
              <Input
                label="Customer name"
                value={name}
                onChange={setName}
                error={nameError}
                disabled={parsing}
              />
              <Input
                label="Email"
                value={email}
                onChange={setEmail}
                error={emailError}
                disabled={parsing}
              />

              <div
                className="flex flex-col items-center justify-center gap-3 rounded-[var(--kn-radius-lg)] border border-dashed border-border-color bg-app-bg/50 px-4 py-10 text-center"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void handleFile(event.dataTransfer.files?.[0]);
                }}
              >
                <FileSpreadsheet className="h-8 w-8 text-text-muted" strokeWidth={1.75} />
                <div>
                  <p className="text-[13px] font-semibold text-text-primary">
                    Drop workbook here, or choose a file
                  </p>
                  <p className="mt-1 text-[12px] text-text-muted">.xlsx / .xls / .csv</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={parsing}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" strokeWidth={2} />
                  {parsing ? "Reading…" : "Choose file"}
                </Button>
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
            </div>
          ) : parsed ? (
            <div className="space-y-4">
              <div className="rounded-md border border-border-color bg-app-bg px-3 py-2.5 text-[13px]">
                <p className="font-semibold text-text-primary">{name.trim()}</p>
                {email.trim() ? (
                  <p className="mt-0.5 text-[12px] text-text-secondary">{email.trim()}</p>
                ) : null}
                {fileName ? (
                  <p className="mt-1 truncate text-[12px] text-text-muted">File: {fileName}</p>
                ) : null}
              </div>

              <ul className="grid grid-cols-2 gap-2 text-[12px]">
                <li className="rounded-md border border-border-color px-3 py-2">
                  <span className="text-text-muted">Properties</span>
                  <p className="text-[16px] font-semibold text-text-primary">
                    {parsed.properties.length}
                  </p>
                </li>
                <li className="rounded-md border border-border-color px-3 py-2">
                  <span className="text-text-muted">Protocols</span>
                  <p className="text-[16px] font-semibold text-text-primary">
                    {parsed.protocols.length}
                  </p>
                  {parsed.properties.length > 0 && parsed.protocols.length > 0 ? (
                    <p className="mt-0.5 text-[11px] text-text-muted">
                      → {parsed.properties.length * parsed.protocols.length} copies
                    </p>
                  ) : null}
                </li>
                <li className="rounded-md border border-border-color px-3 py-2">
                  <span className="text-text-muted">Contacts</span>
                  <p className="text-[16px] font-semibold text-text-primary">
                    {parsed.contacts.length}
                  </p>
                </li>
                <li className="rounded-md border border-border-color px-3 py-2">
                  <span className="text-text-muted">Verification steps</span>
                  <p className="text-[16px] font-semibold text-text-primary">
                    {parsed.guestVerificationSteps.length}
                  </p>
                </li>
              </ul>

              {(parsed.pmsUrl || parsed.pmsUsername) && (
                <p className="text-[12px] text-text-secondary">
                  PMS: {[parsed.pmsUrl, parsed.pmsUsername].filter(Boolean).join(" · ")}
                </p>
              )}

              {parsed.warnings.length > 0 ? (
                <div className="space-y-1 rounded-md border border-border-color bg-app-bg px-3 py-2">
                  <p className="text-[12px] font-semibold text-text-primary">Notes</p>
                  <ul className="list-inside list-disc text-[12px] text-text-secondary">
                    {parsed.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {parsed.skipped.length > 0 ? (
                <div className="space-y-1 rounded-md border border-border-color bg-app-bg px-3 py-2">
                  <p className="text-[12px] font-semibold text-text-primary">
                    Skipped ({parsed.skipped.length})
                  </p>
                  <ul className="max-h-32 space-y-1 overflow-y-auto text-[12px] text-text-secondary">
                    {parsed.skipped.slice(0, 20).map((row, index) => (
                      <li key={`${row.sheet}-${row.sheetRow ?? index}-${row.reason}`}>
                        {row.sheet}
                        {row.sheetRow ? ` row ${row.sheetRow}` : ""}
                        {row.name ? ` (${row.name})` : ""}: {row.reason}
                      </li>
                    ))}
                    {parsed.skipped.length > 20 ? (
                      <li>…and {parsed.skipped.length - 20} more</li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {progress ? (
                <p className="text-[12px] font-medium text-brand-primary">{progress}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-border-color px-5 py-3">
          {step === "review" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => {
                  setStep("form");
                  setParsed(null);
                  setFileName(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Back
              </Button>
              <Button type="button" disabled={saving || !parsed} onClick={() => void handleImport()}>
                {saving ? "Importing…" : "Import"}
              </Button>
            </>
          ) : (
            <Button type="button" variant="ghost" disabled={parsing} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
