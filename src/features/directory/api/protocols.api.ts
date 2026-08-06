import {
  createProtocolFn,
  deleteProtocolFn,
  getProtocolFn,
  linkProtocolToPropertiesFn,
  listProtocolsFn,
  updateProtocolFn,
} from "@/features/directory/protocols.functions";
import type {
  DirectoryProtocol,
  ProtocolListItem,
} from "@/features/directory/lib/map-protocol-row";
import type {
  CreateProtocolInput,
  DeleteProtocolInput,
  LinkProtocolToPropertiesInput,
  UpdateProtocolInput,
} from "@/features/directory/validations/protocol-form.schema";

export type ProtocolsQuery = {
  propertyId: string;
  page: number;
  limit: number;
  search?: string;
};

export type PaginatedProtocols = {
  data: ProtocolListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getProtocolsPaginated(query: ProtocolsQuery): Promise<PaginatedProtocols> {
  return listProtocolsFn({ data: query });
}

export async function getProtocolById(id: string): Promise<DirectoryProtocol> {
  return getProtocolFn({ data: { id } });
}

export async function createProtocol(input: CreateProtocolInput): Promise<DirectoryProtocol> {
  return createProtocolFn({ data: input });
}

export async function updateProtocol(input: UpdateProtocolInput): Promise<DirectoryProtocol> {
  return updateProtocolFn({ data: input });
}

export async function deleteProtocol(input: DeleteProtocolInput): Promise<{ id: string }> {
  return deleteProtocolFn({ data: input });
}

export async function linkProtocolToProperties(
  input: LinkProtocolToPropertiesInput,
): Promise<{ linked: number }> {
  return linkProtocolToPropertiesFn({ data: input });
}
