import {
  createPropertyFn,
  deletePropertyFn,
  getPropertyFn,
  listPropertiesFn,
  updatePropertyFn,
} from "@/features/directory/properties.functions";
import type {
  DirectoryProperty,
  PropertyListItem,
} from "@/features/directory/lib/map-property-row";
import type {
  CreatePropertyInput,
  UpdatePropertyInput,
} from "@/features/directory/validations/property-form.schema";

export type PropertiesQuery = {
  customerId: string;
  page: number;
  limit: number;
  search?: string;
};

export type PaginatedProperties = {
  data: PropertyListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getPropertiesPaginated(query: PropertiesQuery): Promise<PaginatedProperties> {
  return listPropertiesFn({ data: query });
}

export async function getPropertyById(id: string): Promise<DirectoryProperty> {
  return getPropertyFn({ data: { id } });
}

export async function createProperty(input: CreatePropertyInput): Promise<DirectoryProperty> {
  return createPropertyFn({ data: input });
}

export async function updateProperty(input: UpdatePropertyInput): Promise<DirectoryProperty> {
  return updatePropertyFn({ data: input });
}

export async function deleteProperty(id: string): Promise<{ id: string }> {
  return deletePropertyFn({ data: { id } });
}
