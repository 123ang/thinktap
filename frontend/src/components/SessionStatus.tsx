'use client';

import { Badge } from '@/components/ui/badge';
import { SessionStatus as StatusEnum } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface SessionStatusProps {
  status: string;
  className?: string;
}

export function SessionStatus({ status, className = '' }: SessionStatusProps) {
  const { t } = useLanguage();
  
  const statusConfig: Record<string, { variant: any; labelKey: string; color: string }> = {
    CREATED: {
      variant: 'secondary',
      labelKey: 'lecturer.statusCreated',
      color: 'bg-gray-100 text-gray-800',
    },
    ACTIVE: {
      variant: 'default',
      labelKey: 'lecturer.statusActive',
      color: 'bg-green-100 text-green-800',
    },
    ENDED: {
      variant: 'outline',
      labelKey: 'lecturer.statusEnded',
      color: 'bg-red-100 text-red-800',
    },
  };

  const config = statusConfig[status] || statusConfig.CREATED;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.color} ${className}`}
    >
      {t(config.labelKey)}
    </Badge>
  );
}

interface ModeStatusProps {
  mode: string;
  className?: string;
}

export function ModeStatus({ mode, className = '' }: ModeStatusProps) {
  const { t } = useLanguage();
  
  const modeConfig: Record<string, { color: string; labelKey: string }> = {
    RUSH: {
      color: 'bg-red-100 text-red-800',
      labelKey: 'lecturer.modeRush',
    },
    THINKING: {
      color: 'bg-orange-100 text-orange-800',
      labelKey: 'lecturer.modeThinking',
    },
    SEMINAR: {
      color: 'bg-green-100 text-green-800',
      labelKey: 'lecturer.modeSeminar',
    },
  };

  const config = modeConfig[mode] || modeConfig.RUSH;

  return (
    <Badge className={`${config.color} ${className}`}>
      {t(config.labelKey)}
    </Badge>
  );
}

