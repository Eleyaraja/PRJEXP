# ExpenseTrack - Setup & User Guide

## Overview
ExpenseTrack is a modern, full-featured expense tracking application built with Next.js, Supabase, and Recharts. It helps you manage, analyze, and control your spending with powerful analytics and budget management.

## Key Features

### Dashboard
- Quick statistics showing total expenses, balance, categories, and budgets
- Spending breakdown by category (pie chart)
- Recent expenses list
- Full expense management interface

### Expense Management
- Add, view, and delete expenses
- Categorize expenses with default or custom categories
- Track expenses across multiple accounts
- Filter expenses by category, account, and date range
- Support for descriptions and date tracking

### Analytics
- Category-based spending breakdown with bar charts
- Spending trends with daily and cumulative views
- Monthly comparison analysis
- Key metrics: total spent, average daily spending, highest category

### Budget Management
- Set spending limits by category
- Define budget periods (daily, weekly, monthly, yearly)
- Alert thresholds to track when approaching limits
- Visual progress bars showing budget usage
- Color-coded alerts (green/yellow/red)

### Settings
- **Profile**: Update name, email, and preferred currency
- **Accounts**: Add and manage multiple accounts (bank, credit card, cash, digital wallet, savings)
- **Categories**: Create custom expense and income categories with custom colors

## Database Schema

The application uses 7 main tables:
- `profiles`: User profile information
- `categories`: Expense/income categories
- `accounts`: Bank accounts and payment methods
- `expenses`: Individual expense transactions
- `budgets`: Budget limits and alerts
- `notifications`: User notifications
- `recurring_expenses`: Templates for recurring transactions

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Getting Started

### 1. Authentication
- Navigate to `/auth/login` to log in
- New users can sign up at `/auth/sign-up`
- Email confirmation is required (check inbox)
- After confirmation, you'll be redirected to the dashboard

### 2. Initial Setup
1. **Profile**: Update your name and currency preference in Settings
2. **Accounts**: Add your bank accounts or payment methods
3. **Categories**: The app creates default categories on signup, add custom ones as needed

### 3. Adding Expenses
- Click "Add Expense" button (available on Dashboard and Expenses pages)
- Fill in:
  - Description (e.g., "Lunch at restaurant")
  - Amount (numeric value)
  - Category (select from dropdown)
  - Account (payment method used)
  - Date (when the expense occurred)
- Click "Add Expense" to save

### 4. Viewing & Managing Expenses
- **Dashboard**: See recent 5 expenses
- **Expenses Page**: Full expense list with filtering options
- Filters: By category, account, and date range
- Actions: Edit (coming soon), Delete expenses

### 5. Analytics
- View spending patterns across different timeframes
- Category breakdown shows which categories consume the most
- Trending chart displays daily spending and cumulative totals
- Monthly comparison helps identify seasonal patterns

### 6. Budgets
- Create budgets for specific categories
- Set budget periods and alert thresholds
- Visual indicators show progress (green = under budget, yellow = approaching limit, red = exceeded)
- Delete budgets you no longer need

## Navigation

### Desktop
- Navigation bar at the top with logo and main menu
- Links to: Dashboard, Expenses, Budgets, Analytics
- Settings and Logout buttons in top-right

### Mobile
- Mobile menu button (hamburger icon) on small screens
- Full navigation available in slide-out menu
- All features are responsive and mobile-optimized

## Color System

The app uses a dark theme with:
- **Primary**: Purple (#7c3aed) - Main actions and highlights
- **Accent**: Cyan (#06b6d4) - Secondary highlights
- **Destructive**: Red - Delete and alert actions
- **Success indicators**: Green - Budget safe zone
- **Warning indicators**: Yellow/Orange - Approaching budget limits

## Authentication Flow

1. User lands on `/` (home page)
2. If logged in: Redirected to `/dashboard`
3. If not logged in: Redirected to `/auth/login`
4. After signup, user receives email confirmation
5. After confirmation, user is redirected to dashboard
6. Middleware ensures protected routes require authentication

## Database Initialization

The database schema is automatically created when you first run the app. The SQL migration includes:
- All 7 tables with proper constraints
- Row Level Security policies
- Auto-trigger to create user profile on signup
- Default categories and accounts for new users

## Environment Variables

Required environment variables (automatically set by Supabase integration):
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-side only)

## Tips & Best Practices

1. **Categorize Everything**: Use categories to track spending patterns
2. **Use Multiple Accounts**: Track different payment methods separately (credit card vs cash)
3. **Set Realistic Budgets**: Base budgets on historical spending
4. **Regular Reviews**: Check analytics monthly to identify trends
5. **Custom Categories**: Create categories specific to your needs (e.g., "Coffee", "Subscriptions")

## Troubleshooting

### Login Issues
- Confirm email address hasn't been verified yet
- Check email (including spam folder) for verification link

### Missing Expenses
- Check the date range filter on the Expenses page
- Verify the category and account filters are not too restrictive

### Budget Notifications
- Budgets update based on actual expenses
- Check if expenses are categorized correctly

### Performance
- The app uses client-side data fetching with Supabase
- For large datasets, filters help narrow down results
- Charts load dynamically when needed

## Future Enhancements

Planned features (not yet implemented):
- Recurring expense automation
- Export to CSV
- Receipt image uploads
- Bank account synchronization
- Multi-user accounts (family budgets)
- Mobile app

## Support

For issues or questions:
1. Check this guide first
2. Review the Settings page for configuration options
3. Verify Supabase integration is properly connected
4. Check browser console for error messages

---

Created with Next.js 16, Supabase, and Recharts
