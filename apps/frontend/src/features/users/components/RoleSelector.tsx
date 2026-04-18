import { SystemRole, SYSTEM_ROLE_LABELS } from '../types';

interface Props {
  value: SystemRole;
  onChange: (role: SystemRole) => void;
  disabled?: boolean;
}

const ROLES: SystemRole[] = ['ADMIN', 'MEMBER'];

export default function RoleSelector({ value, onChange, disabled }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SystemRole)}
      disabled={disabled}
      className="block w-full rounded-[var(--radius-sm)] border border-border bg-muted/40 px-3 py-1.5 text-sm text-foreground/90 focus:outline-none focus:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
    >
      {ROLES.map((role) => (
        <option key={role} value={role}>
          {SYSTEM_ROLE_LABELS[role]}
        </option>
      ))}
    </select>
  );
}
