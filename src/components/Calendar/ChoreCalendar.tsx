import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import { Chore } from '../../types';
import { useChoreContext } from '../../context/ChoreContext';
import { useMemberContext } from '../../context/MemberContext';
import { useAuthContext } from '../../context/AuthContext';
import { expandAllChores } from '../../utils/recurrenceUtils';
import { addMonths, formatDate } from '../../utils/dateUtils';

interface ChoreCalendarProps {
  onEditChore: (chore: Chore) => void;
  onAddChore: (date?: string) => void;
}

export function ChoreCalendar({ onEditChore, onAddChore }: ChoreCalendarProps) {
  const { chores, completions, updateChore } = useChoreContext();
  const { members, getMemberById } = useMemberContext();
  const { canEditChore, currentUser } = useAuthContext();
  const [dateRange, setDateRange] = useState({
    start: addMonths(new Date(), -1),
    end: addMonths(new Date(), 2),
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const events = useMemo(() => {
    const expanded = expandAllChores(chores, dateRange.start, dateRange.end, completions);

    const filtered = selectedMembers.length > 0
      ? expanded.filter(event => selectedMembers.includes(event.assigneeId))
      : expanded;

    return filtered.map((event) => {
      const member = getMemberById(event.assigneeId);
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        backgroundColor: member?.color || '#999',
        borderColor: member?.color || '#999',
        textColor: '#fff',
        extendedProps: {
          choreId: event.choreId,
          completed: event.completed,
          isRecurring: event.isRecurring,
          category: event.category,
          assigneeId: event.assigneeId,
        },
        classNames: [
          event.completed ? 'event-completed' : '',
          `event-category-${event.category}`,
        ].filter(Boolean),
      };
    });
  }, [chores, completions, dateRange, getMemberById, selectedMembers]);

  const handleEventClick = (info: EventClickArg) => {
    const choreId = info.event.extendedProps.choreId;
    const chore = chores.find((c) => c.id === choreId);
    if (chore) {
      onEditChore(chore);
    }
  };

  const handleDateSelect = (info: DateSelectArg) => {
    onAddChore(info.startStr);
  };

  const handleEventDrop = (info: EventDropArg) => {
    const choreId = info.event.extendedProps.choreId;
    const chore = chores.find((c) => c.id === choreId);

    if (!chore) {
      info.revert();
      return;
    }

    if (!canEditChore(chore.assigneeId)) {
      info.revert();
      return;
    }

    const newDate = formatDate(info.event.start!);
    updateChore({ ...chore, dueDate: newDate });
  };

  const handleDatesSet = (info: { start: Date; end: Date }) => {
    setDateRange({
      start: addMonths(info.start, -1),
      end: addMonths(info.end, 1),
    });
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleShowAll = () => {
    setSelectedMembers([]);
  };

  const handleShowMine = () => {
    if (currentUser) {
      setSelectedMembers([currentUser.id]);
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-filter-bar">
        <div className="filter-quick-actions">
          <button
            className={`btn btn-small ${selectedMembers.length === 0 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleShowAll}
          >
            Show All
          </button>
          {currentUser && (
            <button
              className={`btn btn-small ${selectedMembers.length === 1 && selectedMembers[0] === currentUser.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleShowMine}
            >
              Show Mine
            </button>
          )}
        </div>
        <div className="filter-members">
          {members.map(member => (
            <label key={member.id} className="filter-member-chip">
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={() => handleToggleMember(member.id)}
              />
              <span
                className="member-color-dot"
                style={{ backgroundColor: member.color }}
              />
              <span className="member-name">{member.name}</span>
            </label>
          ))}
        </div>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        eventClick={handleEventClick}
        selectable={true}
        select={handleDateSelect}
        editable={true}
        eventDrop={handleEventDrop}
        datesSet={handleDatesSet}
        height="auto"
        eventDisplay="block"
        dayMaxEvents={3}
        moreLinkClick="popover"
        eventContent={(arg) => {
          const { completed, isRecurring } = arg.event.extendedProps;
          return (
            <div className={`fc-event-content ${completed ? 'completed' : ''}`}>
              {isRecurring && <span className="recurring-icon">🔄</span>}
              <span className="event-title">{arg.event.title}</span>
              {completed && <span className="completed-icon">✓</span>}
            </div>
          );
        }}
      />
    </div>
  );
}
