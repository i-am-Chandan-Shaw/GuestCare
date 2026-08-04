import {
  createCustomerFn,
  deleteCustomerFn,
  getCustomerFn,
  listCustomersFn,
  updateCustomerFn,
} from "@/features/directory/customers.functions";
import type {
  CustomerListItem,
  DirectoryCustomer,
} from "@/features/directory/lib/map-customer-row";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/features/directory/validations/customer-form.schema";

export type CustomersQuery = {
  page: number;
  limit: number;
  search?: string;
};

export type PaginatedCustomers = {
  data: CustomerListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getCustomersPaginated(query: CustomersQuery): Promise<PaginatedCustomers> {
  return listCustomersFn({ data: query });
}

export async function getCustomerById(id: string): Promise<DirectoryCustomer> {
  return getCustomerFn({ data: { id } });
}

export async function createCustomer(input: CreateCustomerInput): Promise<DirectoryCustomer> {
  return createCustomerFn({ data: input });
}

export async function updateCustomer(input: UpdateCustomerInput): Promise<DirectoryCustomer> {
  return updateCustomerFn({ data: input });
}

export async function deleteCustomer(id: string): Promise<{ id: string }> {
  return deleteCustomerFn({ data: { id } });
}
