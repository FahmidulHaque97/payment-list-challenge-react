import {
  Container,
  ErrorBox,
  Spinner,
  StatusBadge,
  Table,
  TableBodyWrapper,
  TableCell,
  TableHeader,
  TableHeaderRow,
  TableHeaderWrapper,
  TableRow,
  TableWrapper,
} from "./components";
import {
  Payment,
  PaymentColumn,
  PaymentSearchResponse,
} from "../types/payment";
import { I18N } from "../constants/i18n";
import axios from "axios";
import { API_URL } from "../constants";
import { useQuery } from "@tanstack/react-query";
import { formatPaymentDate } from "../helpers/datetime";

type ColumnDefinition = {
  id: PaymentColumn;
  label: string;
};

const PAYMENT_COLUMNS: readonly ColumnDefinition[] = [
  { id: PaymentColumn.PaymentID, label: I18N.TABLE_HEADER_PAYMENT_ID },
  { id: PaymentColumn.Date, label: I18N.TABLE_HEADER_DATE },
  { id: PaymentColumn.Amount, label: I18N.TABLE_HEADER_AMOUNT },
  { id: PaymentColumn.Customer, label: I18N.TABLE_HEADER_CUSTOMER },
  { id: PaymentColumn.Currency, label: I18N.TABLE_HEADER_CURRENCY },
  { id: PaymentColumn.Status, label: I18N.TABLE_HEADER_STATUS },
];

export function PaymentsPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["payments", { search: "", currency: "", page: 1 }],
    queryFn: () => fetchPayments("", "", 1),
  });

  async function fetchPayments(
    search = "",
    currency = "",
    page = 1,
  ): Promise<PaymentSearchResponse> {
    const response = await axios.get<PaymentSearchResponse>(API_URL, {
      params: {
        search,
        currency,
        page,
        pageSize: 5,
      },
    });

    return response.data;
  }

  function renderTableHeaders() {
    const headers = (
      <>
        {PAYMENT_COLUMNS.map(({ id, label }) => (
          <TableHeader key={id} scope="col">
            {label}
          </TableHeader>
        ))}
      </>
    );
    return headers;
  }

  function renderPaymentRows() {
    return data?.payments.map((payment: Payment) => (
      <TableRow key={payment.id}>
        <TableCell>{payment.id}</TableCell>
        <TableCell>{formatPaymentDate(payment.date)}</TableCell>
        <TableCell>{payment.amount.toFixed(2)}</TableCell>
        <TableCell>{payment.customerName}</TableCell>
        <TableCell>{payment.currency}</TableCell>
        <TableCell>
          <StatusBadge status={payment.status}>{payment.status}</StatusBadge>
        </TableCell>
      </TableRow>
    ));
  }

  function renderTable() {
    return (
      <>
        <Container>
          <h1>{I18N.PAGE_TITLE}</h1>
          <TableWrapper>
            <Table>
              <TableHeaderWrapper>
                <TableHeaderRow>{renderTableHeaders()}</TableHeaderRow>
              </TableHeaderWrapper>
              <TableBodyWrapper>{renderPaymentRows()}</TableBodyWrapper>
            </Table>
          </TableWrapper>
        </Container>
      </>
    );
  }

  function renderLoading() {
    return (
      <>
        <Spinner></Spinner>
      </>
    );
  }

  function renderError() {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    const message =
      status === 404
        ? I18N.PAYMENT_NOT_FOUND
        : status === 500
          ? I18N.INTERNAL_SERVER_ERROR
          : I18N.SOMETHING_WENT_WRONG;

    return <ErrorBox role="alert">{message}</ErrorBox>;
  }

  return isPending ? renderLoading() : isError ? renderError() : renderTable();
}
