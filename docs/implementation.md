# Implementation guide

This application implements the payment list challenge with payment ID search, currency filtering, combined filters, pagination, and loading and error states. This guide describes the current implementation and the trade-offs to discuss during review.

## Running the application

Use Node.js 24, as specified in `.nvmrc`, and npm. From the repository root:

```sh
npm ci
npm run dev
```

Vite is configured to serve on port 3000. Open the address printed by Vite. Development mode starts Mock Service Worker (MSW) before mounting React, so the application can run without a backend or API credentials.

Useful validation commands after installing dependencies:

```sh
npx vitest run
npm run lint
npm run build
```

`npm test` currently runs `npm install` before Vitest. The direct Vitest command avoids reinstalling dependencies. `npm run test:coverage` produces V8 coverage reports. The `test:step1` through `test:step8` scripts select individual challenge steps and can be given `-- --run` to run once. `npm run format` writes Prettier formatting across the repository. The Husky pre-commit hook runs linting.

`npm run build` type-checks and bundles the application into `dist`. `npm run preview` serves that build locally. MSW is enabled only in development, so the production build needs a backend serving `/api/payments`, or a separately implemented, explicit mock demo mode. Static hosting by itself does not supply that endpoint.

## Technology and package choices

Most application packages were already available in the starter. The implementation uses them where they address a specific requirement. Prettier and Husky were added for formatting and commit checks.

| Technology                          | Use in this solution                                               | Reason and trade-off                                                                                                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19 and TypeScript 5.7         | Components, local state, payment models and request/response types | Function components keep the UI straightforward. Strict TypeScript catches incompatible values and missing fields during development, but does not validate API JSON at runtime.                                                               |
| TanStack Query 5                    | Fetching and caching payment results                               | Provides request lifecycle state and caches each filter/page combination. This avoids maintaining separate local copies of results, loading state and request errors. It adds a dependency and requires deliberate cache and refetch policies. |
| Axios 1                             | HTTP requests in `fetchPayments`                                   | Supports query parameter serialization, typed response access, HTTP error inspection and `AbortSignal`. The browser Fetch API could handle this endpoint too. Axios is already part of the supplied stack.                                     |
| styled-components 6                 | Payment page layout, form controls, table, badges and feedback     | Keeps presentation in reusable named primitives and supports status-dependent styling. Tailwind remains in the application shell, so styling currently spans two systems.                                                                      |
| Tailwind CSS 3                      | Outer application layout and header                                | Reuses the starter shell. Consolidating styles could simplify conventions if the application grows.                                                                                                                                            |
| date-fns 4                          | Parsing ISO dates and formatting table dates                       | Keeps the requested date format explicit in one helper. Output uses the browser's local timezone.                                                                                                                                              |
| MSW 2                               | Browser and test API simulation                                    | Both environments reuse the same HTTP handlers and fixtures, allowing the real request path to run without a backend. Mock behaviour needs to stay aligned with the intended API contract.                                                     |
| Vite 6                              | Development server and production bundling                         | Uses the supplied React tooling for local iteration and static build output.                                                                                                                                                                   |
| Vitest 3, Testing Library and JSDOM | UI integration tests                                               | Exercise rendering and user interactions against mocked HTTP responses. Browser layout, visual appearance and keyboard focus still benefit from real-browser checks.                                                                           |
| ESLint 9, Prettier 3 and Husky 9    | Linting, formatting and a pre-commit check                         | Automate routine consistency checks. The current hook runs linting only.                                                                                                                                                                       |

## Component architecture

| File                              | Responsibility                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `src/main.tsx`                    | Initializes development mocks and mounts the application under React Strict Mode.                                   |
| `src/App.tsx`                     | Provides a shared `QueryClient`, the application header and the main content region.                                |
| `src/components/PaymentsPage.tsx` | Owns search/filter/page state, constructs query parameters, runs the query, and renders the form and result states. |
| `src/components/components.tsx`   | Defines styled HTML primitives for controls, table structure, status badges, pagination and feedback.               |
| `src/api/payments-api.ts`         | Sends the payment request and returns its response body.                                                            |
| `src/types/payment.ts`            | Defines payment and response interfaces, status values and column identifiers.                                      |
| `src/constants/`                  | Defines the endpoint, available currencies and shared UI text.                                                      |
| `src/helpers/datetime.ts`         | Formats payment timestamps for display.                                                                             |
| `src/mocks/`                      | Contains payment fixtures and HTTP handlers shared between browser development and tests.                           |

`PaymentsPage` uses internal render helpers for the search form, options, headers, rows, table, loading indicator and error feedback. These helpers share the component's state through their enclosing scope. They are ordinary functions within the page, rather than independently reusable React components.

Keeping one page component is proportionate to a single-screen exercise. If the page grows, the form, table and pagination can become separate components with explicit props, improving independent reuse and testing.

Table headers come from an ordered `PAYMENT_COLUMNS` definition with `PaymentColumn` enum identifiers and labels from `I18N`. Payment statuses use a string enum matching the API values. Completed badges are green, pending badges are amber, and other statuses currently share the red fallback.

The form uses native inputs, a select and buttons with accessible names. Headers use `scope="col"`, and errors use `role="alert"`. Controls stack below 768px and align horizontally at larger widths. The table wrapper permits horizontal scrolling. The loading spinner currently has no accessible status label, and uncached queries replace the table and pagination while loading, which can affect keyboard focus.

## State management and request flow

Local React state holds four UI values:

- `draftSearch` is the text currently being edited.
- `appliedSearch` is the trimmed search term submitted with the form.
- `currency` is the selected option, initially `I18N.EMPTY_CURRENCY`.
- `page` is the current page, initially 1.

Separating draft and applied search means typing does not send a request on every keystroke. Submitting the form applies the text and resets the page to 1. Selecting a currency applies it immediately and also resets the page. Clearing filters resets both search values, the currency and pagination.

The dropdown's empty selection is represented by an em dash in local state. `currencyFilter` converts that value to an empty string for the API. `QueryParams` groups the applied search, normalized currency, page and fixed page size of 5.

The same parameter object is used in both places:

```tsx
useQuery({
  queryKey: ["payments", params],
  queryFn: ({ signal }) => fetchPayments(params, signal),
});
```

TanStack Query identifies cached results by the complete query key. Changing an applied filter or page selects a different cache entry and fetches as needed. Recreating an equivalent parameter object during rendering does not create a different key, because key matching is based on its contents.

The query owns the response and request lifecycle. The component reads `data`, `isPending`, `isError` and `error` directly. It does not duplicate payment results in React state. The shared query client disables automatic retries, as required by the starter tests. Other cache and refetch settings use the library defaults, so cached results can be displayed while a refetch occurs. There is currently no separate background-fetch indicator.

Pagination uses `total` and `pageSize` from the response to calculate the last page with `Math.ceil(total / pageSize)`. `total` counts all matching payments before pagination. `payments.length` counts only the rows returned for the current page. Previous is disabled on page 1, and Next is disabled when the current page equals the calculated last page.

## API integration

`fetchPayments(params, signal)` sends `GET /api/payments` through Axios and returns `response.data` as `PaymentSearchResponse`. The function accepts the query's cancellation signal, allowing TanStack Query to cancel an obsolete request through Axios when appropriate.

| Request parameter | Current client value                               |
| ----------------- | -------------------------------------------------- |
| `search`          | Submitted, trimmed search text, or an empty string |
| `currency`        | Selected currency code, or an empty string         |
| `page`            | Current page number, starting at 1                 |
| `pageSize`        | 5                                                  |

For example, a combined search on the first page sends:

```text
GET /api/payments?search=pay_205&currency=USD&page=1&pageSize=5
```

The response includes `payments`, `total`, `page` and `pageSize`. Payment rows display ID, formatted date, amount, customer name, currency and status. Amounts use `toFixed(2)` for the challenge's fixed two-decimal display. This is a presentation choice rather than a full currency-specific formatting policy.

The current mock handler searches payment ID, status and currency case-insensitively, then combines that result with an exact currency filter. Although the assignment README mentions customer-name search, the handler does not currently implement it. The client always sends a page size of 5, while the handler defaults to 10 if that parameter is omitted.

The mock returns 404 when no payments match. A page beyond the matching results can instead return a successful response with an empty `payments` array. The UI currently renders that as an empty table.

`QueryParams` currently lives in `PaymentsPage.tsx` and is imported by the API module. Moving it into a shared type module would remove the API layer's dependency on the page component. Also, `CURRENCIES` currently infers as `string[]`, so `(typeof CURRENCIES)[number]` resolves to `string`. A literal currency union would need a readonly literal definition and a type that also permits the empty API filter.

## Error handling and observability

Axios rejects unsuccessful HTTP responses. The API function lets these errors propagate to TanStack Query, and the page checks them with `axios.isAxiosError` before reading the response status.

| Condition                                     | Displayed feedback           |
| --------------------------------------------- | ---------------------------- |
| Query pending with no available data          | Animated spinner             |
| HTTP 404                                      | `I18N.PAYMENT_NOT_FOUND`     |
| HTTP 500                                      | `I18N.INTERNAL_SERVER_ERROR` |
| Other query error, including network failures | `I18N.SOMETHING_WENT_WRONG`  |
| Successful query                              | Payment table and pagination |

The form stays available during loading and errors so the user can change or clear filters. Error messages use shared UI constants rather than exposing the server response body. Automatic retries are disabled, and there is no dedicated retry button.

Development mock initialization logs success or failure to the console. If starting the worker fails, the application still mounts. There is currently no payment-request telemetry, external error reporting or timing instrumentation. A production extension could record operation name, HTTP status, duration and a correlation identifier, while avoiding search terms, customer details and payment payloads in logs.

## Testing and review considerations

The supplied `App.test.tsx` suite covers initial rendering, search controls and submission, clearing filters, 404 and 500 feedback, currency and combined filters, pagination controls, and Previous being disabled on the first page. Tests use Testing Library with the Node MSW server and the same handlers as development. Vitest is configured to write verbose and JUnit results, with optional V8 coverage reports.

Useful additions would verify page navigation and filter resets from a later page, assert currency values within table rows, test cancellation and generic errors, and cover date and amount formatting. Accessible loading announcements, focus retention and narrow-screen layouts also need review. This document does not claim that these additional checks are implemented.

Dates use `parseISO` followed by `format` with `dd/MM/yyyy, HH:mm:ss`. The browser's timezone determines the output, so `2024-04-15T10:00:00Z` displays as `15/04/2024, 11:00:00` in Europe/London. A fixed reporting timezone would need to be defined explicitly and tested.

The current scope is a mocked, single-page frontend. Runtime response validation, production monitoring, a production API integration, a deployed demo configuration and broader regression coverage remain future work.
