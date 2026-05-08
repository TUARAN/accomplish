import { Button } from '@/components/ui/button';
import { Play } from '@phosphor-icons/react';

interface MessageTaskActionProps {
  onTaskAction: () => void | Promise<unknown>;
  isLoading: boolean;
  isTaskActionRunning: boolean;
  taskActionLabel?: string;
  taskActionPendingLabel?: string;
  taskActionError?: string | null;
}

export function MessageTaskAction({
  onTaskAction,
  isLoading,
  isTaskActionRunning,
  taskActionLabel,
  taskActionPendingLabel,
  taskActionError,
}: MessageTaskActionProps) {
  return (
    <>
      <Button
        size="sm"
        type="button"
        data-testid="message-task-action"
        onClick={() => {
          void onTaskAction();
        }}
        disabled={isLoading || isTaskActionRunning}
        className="mt-3 gap-1.5"
      >
        <Play className="h-3 w-3" />
        {isTaskActionRunning
          ? (taskActionPendingLabel ?? taskActionLabel ?? 'Continue')
          : (taskActionLabel ?? 'Continue')}
      </Button>
      {taskActionError && <p className="mt-3 text-sm text-destructive">{taskActionError}</p>}
    </>
  );
}
