import { useMemberContext } from '../../context/MemberContext';

interface MemberSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
}

export function MemberSelect({ value, onChange, required = false, id }: MemberSelectProps) {
  const { members } = useMemberContext();

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="member-select"
    >
      <option value="">Select assignee...</option>
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      ))}
    </select>
  );
}
