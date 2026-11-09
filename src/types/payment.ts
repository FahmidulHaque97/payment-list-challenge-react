import { CURRENCIES } from "../constants";

export interface Payment {
  id: string;
  amount: number;
  customerName: string;
  customerAddress: string;
  currency: (typeof CURRENCIES)[number];
  status: Status;
  date: string;
  description: string;
}

export interface PaymentSearchResponse {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
}

export enum PaymentColumn {
  PaymentID = "paymentId",
  Date = "date",
  Amount = "amount",
  Customer = "customer",
  Currency = "currency",
  Status = "status",
}

export enum Status {
  Pending = "pending",
  Completed = "completed",
  Failed = "failed",
  Refunded = "refunded",
}
