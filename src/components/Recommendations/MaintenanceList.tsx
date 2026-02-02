import { useState } from 'react';
import { maintenanceRecommendations, getSeasonalRecommendations, MaintenanceRecommendation } from '../../data/maintenanceChores';
import { useChoreContext } from '../../context/ChoreContext';
import { useAuthContext } from '../../context/AuthContext';
import { formatDate, addDays } from '../../utils/dateUtils';
import { getFrequencyLabel } from '../../utils/recurrenceUtils';
import { ChoreCategory } from '../../types';

export function MaintenanceList() {
  const { addChore, chores } = useChoreContext();
  const { currentUser } = useAuthContext();
  const [filter, setFilter] = useState<'all' | 'seasonal'>('seasonal');
  const [categoryFilter, setCategoryFilter] = useState<ChoreCategory | 'all'>('all');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const seasonalRecs = getSeasonalRecommendations();
  const displayRecs = filter === 'seasonal' ? seasonalRecs : maintenanceRecommendations;

  const filteredRecs = categoryFilter === 'all'
    ? displayRecs
    : displayRecs.filter(rec => rec.category === categoryFilter);

  const existingChoreTitles = new Set(chores.map(c => c.title.toLowerCase()));

  const handleAddChore = (rec: MaintenanceRecommendation) => {
    if (!currentUser) return;

    addChore({
      title: rec.title,
      description: rec.description,
      assigneeId: currentUser.id,
      dueDate: formatDate(addDays(new Date(), 7)),
      category: rec.category,
      completed: false,
      recurrence: {
        frequency: rec.suggestedFrequency,
      },
    });

    setAddedIds(prev => new Set(prev).add(rec.id));
  };

  const getCategoryIcon = (category: ChoreCategory) => {
    const icons: Record<ChoreCategory, string> = {
      cleaning: '🧹',
      maintenance: '🔧',
      outdoor: '🌿',
      kitchen: '🍳',
      other: '📦',
    };
    return icons[category];
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h2>Maintenance Recommendations</h2>
        <p className="recommendations-subtitle">
          Suggested household maintenance tasks to keep your home in great shape.
          {filter === 'seasonal' && ` Showing ${getCurrentSeason()} recommendations.`}
        </p>
      </div>

      <div className="recommendations-filters">
        <div className="filter-group">
          <label>Show:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'seasonal')}>
            <option value="seasonal">Seasonal ({getCurrentSeason()})</option>
            <option value="all">All Recommendations</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category:</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ChoreCategory | 'all')}>
            <option value="all">All Categories</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="outdoor">Outdoor</option>
            <option value="kitchen">Kitchen</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {!currentUser && (
        <div className="warning-banner">
          Please select a user to add recommendations to your chore list.
        </div>
      )}

      {filteredRecs.length === 0 ? (
        <div className="empty-state">
          <p>No recommendations match your filters.</p>
        </div>
      ) : (
        <div className="recommendations-grid">
          {filteredRecs.map((rec) => {
            const isAdded = addedIds.has(rec.id) || existingChoreTitles.has(rec.title.toLowerCase());

            return (
              <div key={rec.id} className={`recommendation-card ${isAdded ? 'added' : ''}`}>
                <div className="recommendation-header">
                  <span className="category-icon">{getCategoryIcon(rec.category)}</span>
                  <h3>{rec.title}</h3>
                </div>
                <p className="recommendation-description">{rec.description}</p>
                <div className="recommendation-meta">
                  <span className="frequency-badge">
                    {getFrequencyLabel(rec.suggestedFrequency)}
                  </span>
                  <span className="category-badge">{rec.category}</span>
                </div>
                <button
                  className={`btn ${isAdded ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => handleAddChore(rec)}
                  disabled={!currentUser || isAdded}
                >
                  {isAdded ? '✓ Added' : '+ Add to My Chores'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
