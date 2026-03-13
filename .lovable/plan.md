

## Plan: Add "Today's Tasks" Popup on First Daily Visit

### Overview
Create a dialog that appears automatically when a user opens the app for the first time each day, showing their tasks due today. Includes a "Don't show again today" checkbox, sort by priority, and a "Show done" toggle.

### How It Works
- Use `localStorage` key `tasks-popup-dismissed-{YYYY-MM-DD}` to track daily dismissal
- On Dashboard mount, check if the key exists for today's date — if not, show the popup
- "Don't show again today" checkbox sets the key before closing
- Query `action_items` for today's `due_date` assigned to the current user

### Files to Create/Modify

**1. Create `src/components/dashboard/TodaysTasksPopup.tsx`**
- Dialog component with:
  - Header: calendar icon + "Today's Tasks" title + formatted date
  - Sort toggle: "Sort: Priority" button (sorts High → Medium → Low)
  - "Show done" toggle to include completed tasks
  - Task list showing each task with priority badge, due time, module type
  - Empty state: green checkmark icon + "All caught up!" message (matching the reference screenshot)
  - Footer: "Don't show again today" checkbox, "Dismiss" button, "View All Tasks" button (navigates to `/action-items`)
- Query: `action_items` where `due_date = today` and `assigned_to = user.id`
- Uses `Dialog` from radix UI components already in the project

**2. Modify `src/pages/Dashboard.tsx`**
- Import and render `<TodaysTasksPopup />` inside the Dashboard page
- The popup manages its own open/close state internally using localStorage check

### Layout (matching reference screenshot)
- Clean white dialog, ~500px wide
- Header with blue calendar icon, title "Today's Tasks", date subtitle
- Gray toolbar bar with sort + show done controls
- Scrollable task list or empty state
- Footer with checkbox left-aligned, buttons right-aligned

