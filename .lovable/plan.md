

## Plan: Revamp "Today's Agenda" Popup

### Changes to `src/components/dashboard/TodaysTasksPopup.tsx` (full rewrite)

**Rename & Content:**
- Title: "Today's Agenda" (was "Today's Tasks")
- Query both overdue items (`due_date < today`) AND today's items (`due_date = today`)
- Exclude Completed/Cancelled items
- Sort by due_date ascending (overdue first), then by due_time

**Remove:**
- Sort toggle button (Priority/Time)
- Show done toggle button
- Entire toolbar bar

**Add:**
- Section headers: "Overdue" (red) and "Today" to separate the two groups
- Clickable rows — clicking opens `ActionItemModal` in edit mode (pass the task as `actionItem` prop)
- Larger dialog: `sm:max-w-[560px]`, increase scroll area to `max-h-[420px]`
- Cursor pointer + better hover state on rows
- Show overdue date in red text for overdue items
- After saving in the modal, refetch the query

**Keep:**
- "Don't show again today" checkbox
- Dismiss / View All Tasks buttons
- Empty state ("All caught up!")
- localStorage dismissal logic
- Priority badge + due_time + module_type per row

**Integration:**
- Import `ActionItemModal` and `useActionItems` hook for the save handler
- Set `modal={false}` on the agenda Dialog so the ActionItemModal can open on top

