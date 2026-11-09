# 💳 Payment Search Challenge

Welcome to the Payment Search Challenge! This is a frontend coding challenge designed to assess your ability to implement a payment search feature using modern web technologies.

Your task is to build a payment search interface that allows users to:

- View payment details organised in a table
- Search for payments by payment ID & currency and clear filters
- Handle various edge cases and error states
- Implement pagination for the table

## 📑 Table of Contents

- [🛠️ Tech Stack](#️-tech-stack)
- [📡 API Documentation](#-api-documentation)
  - [Search Payments Endpoint](#search-payments-endpoint)
  - [Available Test Data](#available-test-data)
- [🌐 Localization (i18n)](#-localization-i18n)
- [📝 Evaluation Criteria](#-evaluation-criteria)
- [💡 Tips](#-tips)
- [📋 Implementation Steps](#-implementation-steps)
  - [Step 1: Basic Payment List](#step-1-basic-payment-list-)
  - [Step 2: Search by Payment ID](#step-2-search-by-payment-id-)
  - [Step 3: Clear Filters](#step-3-clear-filters-)
  - [Step 4: Handle Payment Not Found](#step-4-handle-payment-not-found-)
  - [Step 5: Handle Server Error](#step-5-handle-server-error-)
  - [Step 6: Currency Filter](#step-6-currency-filter-)
  - [Step 7: Combined Currency and Payment ID Filter](#step-7-combined-currency-and-payment-id-filter-)
  - [Step 8: Pagination](#step-8-pagination-)

> **Note**: We don't expect candidates to complete all steps. Please work your way through the steps incrementally, focusing on quality over quantity. Each step builds upon the previous one, so take your time to implement each feature properly.

## 🛠️ Tech Stack

The project comes with the following pre-configured technologies:

- **React 19** - For building the user interface
- **TypeScript** - For type safety and better developer experience
- **Tailwind CSS** - For styling and responsive design
- **MSW (Mock Service Worker)** - For API mocking
- **Vitest** - For testing
- **Testing Library** - For component testing

> **Note**: You are free to use additional libraries, packages, or technologies to solve this challenge. Feel free to install and use any dependencies that will help you implement the features more effectively or improve the user experience.

> **Important**: You'll discuss your implementation in a technical interview, including your architectural decisions, trade-offs, and alternative approaches you considered. Make sure you understand every line of code you submit.

## 📡 API Documentation

The project uses MSW to mock the payment search API. The API URL is defined in `src/constants/index.ts` as `API_URL = "/api/payments"`.

### Search Payments Endpoint

**Endpoint:** `GET /api/payments`

**Description:** Search and retrieve payments with filtering and pagination support.

#### Query Parameters

| Parameter  | Type   | Required | Default | Description                                                                                                |
| ---------- | ------ | -------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `search`   | string | No       | `""`    | Search term to filter payments (supports Payment ID, Status, Currency, Customer Name)                      |
| `currency` | string | No       | `""`    | Filter by currency code (`USD`, `EUR`, `GBP`, `AUD`, `CAD`, `ZAR`) - available in `src/constants/index.ts` |
| `page`     | number | No       | `1`     | Page number for pagination                                                                                 |
| `pageSize` | number | No       | `5`     | Number of payments per page                                                                                |

#### Request Examples

```bash
GET /api/payments?search=pay_134&currency=USD&page=1&pageSize=5
```

#### Response Format

**Success Response (200 OK):**

```json
{
  "payments": [
    {
      "id": "pay_123456789",
      "customerName": "John Doe",
      "amount": 150.0,
      "customerAddress": "123 Main St, City, Country",
      "currency": "USD",
      "status": "completed",
      "date": "2024-01-15T10:30:00Z",
      "description": "Payment for services",
      "clientId": "cli_123"
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 5
}
```

#### Available Test Data

The mock API includes the following payment IDs for testing:

- `pay_134_1`, `pay_134_2`, `pay_134_3`, `pay_134_4`, `pay_134_5` - Various payment statuses
- `pay_205_1`, `pay_205_2`, `pay_205_3`, `pay_205_4`, `pay_205_5` - Multiple payments with different currencies
- `pay_404` - Returns `404` error
- `pay_500` - Returns `500` error

## 🌐 Localization (i18n)

**Important**: Use the i18n constants for all user-facing text. All strings can be found in the constants files:

- **Main i18n strings**: `src/constants/i18n.ts` - Contains all user-facing text including labels, buttons, messages, and table headers

Import the i18n constants like this:

```typescript
import { I18N } from "./constants/i18n";
```

**Note**: These strings are used by our tests and scoring system, so using the exact i18n constants is required for your solution to pass validation.

## 📝 Evaluation Criteria

Your solution will be evaluated based on:

- 🧹 Clean, maintainable code
- 🔒 Proper TypeScript usage
- 🏗️ Well-structured components
- 🎯 Efficient state management

## 💡 Tips

- **Start with Step 1 and work through each step incrementally**
- Run tests after each step to verify your progress
- Keep accessibility in mind throughout development
- Use TypeScript effectively
- Test with the provided payment IDs to verify error handling
- Don't hesitate to install additional packages if they help you solve the problem more efficiently
- Consider using libraries for state management, form handling, or UI components if they improve your solution

## 📋 Implementation Steps

This challenge is designed to be completed incrementally. Each step builds upon the previous one, and you can run tests to verify your progress.

Good luck! 🚀

### Step 1: Basic Payment List ✅

**Goal**: Fetch and display payments in a table with proper formatting

**Requirements**:

- Fetch payments from the API with `page=1` and `pageSize=5`
- Display payments in a table with headers using i18n strings (see `src/constants/i18n.ts`)
- Format amounts and dates as per the example in the screenshot

![Payments Page](./docs/payments_page.png)
_The main payments interface showing the search form, filters, and payment table_

**Test to pass**: `App - Step 1: Basic Payment List`

**Command to run**: `npm run test:step1`

### Step 2: Search by Payment ID ✅

**Goal**: Add search functionality for payment IDs

**Requirements**:

- Add a search input with proper ARIA labels
- Add a search button
- Implement search functionality that queries the API
- Use the i18n strings for labels and placeholders (see `src/constants/i18n.ts`)

![Search by Payment ID](./docs/search_by_payment_id.png)
_Search input for payments by payment ID_
![Search by Payment ID](./docs/search_by_payment_id_with_search.png)
_Searching for payments by payment ID with results displayed in the table_

**Test to pass**: `App - Step 2: Search by Payment ID`

**Command to run**: `npm run test:step2`

### Step 3: Clear Filters ✅

**Goal**: Add ability to clear all active filters

**Requirements**:

- Show a "Clear Filters" button when any filter is active
- Reset the search input to empty
- Hide the clear button when no filters are active

![Clear Filters](./docs/clear_filters.png)
_Clear Filters button_

**Test to pass**: `App - Step 3: Clear Filters`

**Command to run**: `npm run test:step3`

### Step 4: Handle Payment Not Found ✅

**Goal**: Display appropriate error message when payment is not found

**Requirements**:

- Handle 404 responses from the API (use `pay_404` as the payment ID)
- Display the error message from i18n constants
- Show the error message in a user-friendly way

![Payment Not Found](./docs/payment_not_found.png)
_Error message displayed when a payment is not found (404 error)_

**Test to pass**: `App - Step 4: Handle Payment Not Found`

**Command to run**: `npm run test:step4`

### Step 5: Handle Server Error ✅

**Goal**: Display error message for server errors

**Requirements**:

- Handle 500 responses from the API (use `pay_500` as the payment ID)
- Display the appropriate error message from i18n
- Ensure the error is clearly visible to users

![Internal Server Error](./docs/internal_server_error.png)
_Error message displayed when a server error occurs (500 error)_

**Test to pass**: `App - Step 5: Handle Server Error`

**Command to run**: `npm run test:step5`

### Step 6: Currency Filter ✅

**Goal**: Add currency filtering functionality

**Requirements**:

- Add a currency dropdown with all available currencies
- Filter payments by selected currency
- Use proper ARIA labels for accessibility
- Include all currencies: USD, EUR, GBP, AUD, CAD, ZAR (see `src/constants/index.ts`)
- Clear all filters clicked should clear the currency filter

![Filter by Currency](./docs/filter_by_currency.png)
_Filtering payments by currency using the dropdown selector_

**Test to pass**: `App - Step 6: Currency Filter`

**Command to run**: `npm run test:step6`

### Step 7: Combined Currency and Payment ID Filter ✅

**Goal**: Ensure currency and payment ID filters work together

**Requirements**:

- Allow filtering by both currency and payment ID simultaneously
- Ensure the API receives both filter parameters
- Display results that match both criteria

![Filter by Payment ID and Currency](./docs/filter_by_payment_id_and_currency.png)
_Filtering payments by payment ID and currency_

**Test to pass**: `App - Step 7: Combined Currency and Payment ID Filter`

**Command to run**: `npm run test:step7`

### Step 8: Pagination ✅

**Goal**: Implement pagination functionality

**Requirements**:

- Display pagination controls (Previous/Next buttons) (use the [i18n strings for the buttons](./src/constants/i18n.ts) the icons are unicode characters in the i18n strings)
- Show current page number (e.g., "Page 1")
- Disable Previous button on first page
- Enable Previous button after navigating to next page
- Show different payments on different pages
- Allow navigation back to previous pages

### Pagination

![Paginate Payments](./docs/paginate_payments_page_1.png)
_Pagination controls allowing navigation between pages of results_

![Paginate Payments](./docs/paginate_payments_page_2.png)
_Pagination controls allowing navigation between pages of results_

**Test to pass**: `App - Step 8: Pagination`

**Command to run**: `npm run test:step8`
