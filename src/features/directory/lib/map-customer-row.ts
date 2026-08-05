import type {
  CustomerContact,
  CustomerPms,
  OrderedStepItem,
} from "@/shared/types";

export type CustomerRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  image_url: string | null;
  pms_url: string | null;
  pms_username: string | null;
  pms_password: string | null;
  guest_verification_steps: unknown;
  created_at: string;
  updated_at: string;
};

export type CustomerContactRow = {
  id: string;
  customer_id: string;
  label: string;
  name: string;
  phone: string;
  position: number;
};

export type DirectoryCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  imageUrl?: string;
  contacts: CustomerContact[];
  pms: CustomerPms;
  guestVerificationSteps: OrderedStepItem[];
  createdAt: string;
  updatedAt: string;
};

export type CustomerListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactsCount: number;
  propertyCount: number;
  imageUrl?: string;
  createdAt: string;
};

function mapSteps(raw: unknown): OrderedStepItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id : `step-${index}`;
    const label = typeof row.label === "string" ? row.label : "";
    const hint = typeof row.hint === "string" ? row.hint : undefined;
    const position = typeof row.position === "number" ? row.position : index;
    return [{ id, label, hint, position }];
  });
}

export function mapContactRow(row: CustomerContactRow): CustomerContact {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    phone: row.phone,
    position: row.position,
  };
}

export function mapCustomerRow(
  row: CustomerRow,
  contacts: CustomerContactRow[] = [],
): DirectoryCustomer {
  const sorted = [...contacts].sort((a, b) => a.position - b.position);
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    imageUrl: row.image_url ?? undefined,
    contacts: sorted.map(mapContactRow),
    pms: {
      url: row.pms_url ?? undefined,
      username: row.pms_username ?? undefined,
      password: row.pms_password ?? undefined,
    },
    guestVerificationSteps: mapSteps(row.guest_verification_steps),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toCustomerListItem(
  customer: DirectoryCustomer,
  propertyCount = 0,
): CustomerListItem {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    contactsCount: customer.contacts.length,
    propertyCount,
    imageUrl: customer.imageUrl,
    createdAt: customer.createdAt,
  };
}
