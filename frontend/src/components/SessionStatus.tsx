import { Badge } from '@/components/ui/badge';
import { SessionStatus as StatusEnum } from '@/types/api';

interface SessionStatusProps {
  status: string;
  className?: string;
}

export function SessionStatus({ status, className = '' }: SessionStatusProps) {
  const statusConfig: Record<string, { variant: any; label: string; color: string }> = {
    CREATED: {
      variant: 'secondary',
      label: 'Created',
      color: 'bg-gray-100 text-gray-800',
    },
    ACTIVE: {
      variant: 'default',
      label: 'Active',
      color: 'bg-green-100 text-green-800',
    },
    ENDED: {
      variant: 'outline',
      label: 'Ended',
      color: 'bg-red-100 text-red-800',
    },
  };

  const config = statusConfig[status] || statusConfig.CREATED;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.color} ${className}`}
    >
      {config.label}
    </Badge>
  );
}

interface ModeStatusProps {
  mode: string;
  className?: string;
}

export function ModeStatus({ mode, className = '' }: ModeStatusProps) {
  const modeConfig: Record<string, { color: string; label: string }> = {
    RUSH: {
      color: 'bg-red-100 text-red-800',
      label: 'Rush Mode',
    },
    THINKING: {
      color: 'bg-orange-100 text-orange-800',
      label: 'Thinking Mode',
    },
    SEMINAR: {
      color: 'bg-green-100 text-green-800',
      label: 'Seminar Mode',
    },
  };

  const config = modeConfig[mode] || modeConfig.RUSH;

  return (
    <Badge className={`${config.color} ${className}`}>
      {config.label}
    </Badge>
  );
}

