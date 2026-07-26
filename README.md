# Finance Tracker — Frontend

A simple, modern React frontend for the Finance Tracker API (Spring Boot backend).

## Stack

- React 18 + Vite
- react-router-dom for routing
- recharts for the pie / bar charts
- Plain CSS (no framework) — small design system in `src/index.css`
- JWT stored in `localStorage`, attached to every request via a thin `fetch` wrapper

## Getting started

1. Make sure your backend is running at `http://localhost:8080` (or update `.env`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173`.

## Project structure

```
src/
  api/client.js          fetch wrapper: auth header, error handling, 401 -> redirect to /login
  context/AuthContext.jsx login/signup/logout state, persisted to localStorage
  components/
    Sidebar.jsx           left nav + user + logout
    ProtectedRoute.jsx    redirects to /login if not authenticated
    SummaryCards.jsx      income / expense / balance / count cards
    CategoryPieChart.jsx  reusable pie chart (used for both income & expense)
    MonthlyTrendChart.jsx grouped bar chart, with a 3/6/12 month selector
    TransactionForm.jsx   modal for add/edit, loads categories filtered by type
    TransactionTable.jsx  sortable table
    Pagination.jsx        simple prev/next pager
    ConfirmDialog.jsx      generic confirm modal (used for delete)
  pages/
    Login.jsx / Signup.jsx
    Dashboard.jsx          summary + charts + PDF report download
    Transactions.jsx       filters, table, pagination, add/edit/delete
    Categories.jsx         view defaults, add custom categories
```

## Notes on API behavior handled in the UI

- Tokens expire after 24h and there's no refresh endpoint — a `401` anywhere clears the
  stored token and hard-redirects to `/login`.
- Category dropdown in the transaction form re-fetches whenever you switch
  Income/Expense, since a category belongs to exactly one type.
- Validation errors (`400` with `fieldErrors`) are shown inline under each field, on both
  auth forms and the transaction form.
- The monthly trend chart always renders a continuous axis (the API fills in zero months).
- "Download report" streams a PDF blob and triggers a browser download — no PDF viewer is
  built in.

## Configuration

Base URL is read from `VITE_API_BASE_URL` in `.env`. Change it if your backend runs
somewhere other than `http://localhost:8080`.
