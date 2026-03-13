import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CalendarDays,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';

const STORAGE_PREFIX = 'tasks-popup-dismissed-';

const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
const priorityColor: Record<string, string> = {
  High: 'bg-destructive/10 text-destructive border-destructive/20',
  Medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  Low: 'bg-muted text-muted-foreground border-border',
};

export function TodaysTasksPopup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const todayKey = format(new Date(), 'yyyy-MM-dd');

  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(true);
  const [showDone, setShowDone] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (!user) return;
    const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${todayKey}`);
    if (!dismissed) {
      setOpen(true);
    }
  }, [user, todayKey]);

  const { data: tasks = [] } = useQuery({
    queryKey: ['todays-tasks-popup', todayKey, user?.id],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('action_items')
        .select('*')
        .eq('due_date', todayKey)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch tasks assigned to user OR created by user
      query = query.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && open,
  });

  const filteredTasks = showDone
    ? tasks
    : tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortByPriority) {
      return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    }
    // Sort by due_time if not sorting by priority
    return (a.due_time || '23:59').localeCompare(b.due_time || '23:59');
  });

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(`${STORAGE_PREFIX}${todayKey}`, 'true');
    }
    setOpen(false);
  };

  const handleViewAll = () => {
    if (dontShowAgain) {
      localStorage.setItem(`${STORAGE_PREFIX}${todayKey}`, 'true');
    }
    setOpen(false);
    navigate('/action-items');
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Today's Tasks</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="px-6 py-2 bg-muted/40 border-y border-border flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setSortByPriority(!sortByPriority)}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort: {sortByPriority ? 'Priority' : 'Time'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setShowDone(!showDone)}
          >
            {showDone ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showDone ? 'Hide done' : 'Show done'}
          </Button>
        </div>

        {/* Task list or empty state */}
        <ScrollArea className="max-h-[340px]">
          {sortedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <p className="text-base font-medium text-foreground">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">
                No tasks due today. Enjoy your day!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className="px-6 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                      task.status === 'Completed'
                        ? 'bg-green-500'
                        : task.priority === 'High'
                        ? 'bg-destructive'
                        : task.priority === 'Medium'
                        ? 'bg-yellow-500'
                        : 'bg-muted-foreground'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        task.status === 'Completed'
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 h-4 ${priorityColor[task.priority] || ''}`}
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {task.module_type}
                      </span>
                      {task.due_time && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {task.due_time.slice(0, 5)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border flex-row items-center justify-between sm:justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              checked={dontShowAgain}
              onCheckedChange={(v) => setDontShowAgain(!!v)}
            />
            <span className="text-xs text-muted-foreground">Don't show again today</span>
          </label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Dismiss
            </Button>
            <Button size="sm" onClick={handleViewAll}>
              View All Tasks
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
