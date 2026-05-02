import { type ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 gap-3">
      {icon ? <div className="text-[oklch(70%_0.015_240)]">{icon}</div> : null}
      <h3 className="text-[18px] font-semibold tracking-[-0.005em] text-[oklch(20%_0.02_240)]">
        {title}
      </h3>
      {description ? (
        <p className="max-w-md text-[15px] leading-[1.55] text-[oklch(40%_0.015_240)]">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
