import {
  ClearButton,
  Container,
  ErrorBox,
  FilterRow,
  PaginationButton,
  PaginationRow,
  SearchButton,
  SearchInput,
  Select,
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
  Title,
} from "./components";
import {
  Payment,
  PaymentColumn,
  PaymentSearchResponse,
} from "../types/payment";
import { I18N } from "../constants/i18n";
import axios from "axios";
import { API_URL, CURRENCIES } from "../constants";
import { useQuery } from "@tanstack/react-query";
import { formatPaymentDate } from "../helpers/datetime";
import { useState } from "react";

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

async function fetchPayments(
  search = "",
  currency: (typeof CURRENCIES)[number] = I18N.EMPTY_CURRENCY,
  page: number,
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

export function PaymentsPage() {
  const [draftSearch, setDraftSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currency, setCurrency] = useState<string>(I18N.EMPTY_CURRENCY);
  const currencyFilter = currency === I18N.EMPTY_CURRENCY ? "" : currency;
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error } = useQuery({
    queryKey: [
      "payments",
      { search: appliedSearch, currency: currencyFilter, page: page },
    ],
    queryFn: () => fetchPayments(appliedSearch, currencyFilter, page),
  });



  function handleClearFilters() {
    setDraftSearch("");
    setAppliedSearch("");
    setCurrency(I18N.EMPTY_CURRENCY);
    setPage(1);
  }

  function handleSelect(value: string) {
    setCurrency(value);
    setPage(1);
  }

  function renderSearchForm() {
    return (
      <FilterRow
        as="form"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setAppliedSearch(draftSearch.trim());
        }}
      >
        <SearchInput
          type="search"
          aria-label={I18N.SEARCH_LABEL}
          placeholder={I18N.SEARCH_PLACEHOLDER}
          value={draftSearch}
          onChange={(event) => setDraftSearch(event.target.value)}
        />
        <Select
          name="currency"
          aria-label={I18N.CURRENCY_FILTER_LABEL}
          value={currency}
          onChange={(event) => handleSelect(event.target.value)}
        >
          {renderSelectOptions()}
        </Select>
        <SearchButton type="submit">{I18N.SEARCH_BUTTON}</SearchButton>
        {renderClearButton()}
      </FilterRow>
    );
  }

  function renderClearButton() {
    if (appliedSearch == "" && currency == I18N.EMPTY_CURRENCY) return null;
    return (
      <ClearButton type="button" onClick={handleClearFilters}>
        {I18N.CLEAR_FILTERS}
      </ClearButton>
    );
  }

  function renderSelectOptions() {
    const options = (
      <>
        <option value={I18N.EMPTY_CURRENCY}>{I18N.CURRENCIES_OPTION}</option>
        {CURRENCIES.map((currency: string) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </>
    );
    return options;
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
      <TableWrapper>
        <Table>
          <TableHeaderWrapper>
            <TableHeaderRow>{renderTableHeaders()}</TableHeaderRow>
          </TableHeaderWrapper>
          <TableBodyWrapper>{renderPaymentRows()}</TableBodyWrapper>
        </Table>
        <PaginationRow>
          <PaginationButton
            type="button"
            onClick={() => handlePagination("prev")}
            disabled={page == 1}
          >
            {I18N.PREVIOUS_BUTTON}
          </PaginationButton>
          {I18N.PAGE_LABEL} {page}
          <PaginationButton
            type="button"
            onClick={() => handlePagination("next")}
            disabled={isNextDisabled()}
          >
            {I18N.NEXT_BUTTON}
          </PaginationButton>
        </PaginationRow>
      </TableWrapper>
    );
  }

  const isNextDisabled = () => {
    if (!data) return true;
    return page == Math.ceil(data.total / data.pageSize);
  };

  function handlePagination(direction: "next" | "prev") {
    if (direction === "prev") {
      if (page == 1) return;
      const prevPage = page - 1
      setPage(prevPage)
    }
    if (direction === "next") {
      const nextPage = page + 1
      setPage(nextPage)
    }
  }

  function renderLoading() {
    return <Spinner></Spinner>;
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

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      {renderSearchForm()}
      {isPending ? renderLoading() : isError ? renderError() : renderTable()}
    </Container>
  );
}
