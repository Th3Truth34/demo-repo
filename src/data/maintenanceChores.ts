import { RecurrencePattern, ChoreCategory } from '../types';

export interface MaintenanceRecommendation {
  id: string;
  title: string;
  description: string;
  category: ChoreCategory;
  suggestedFrequency: RecurrencePattern['frequency'];
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'all';
}

export const maintenanceRecommendations: MaintenanceRecommendation[] = [
  // HVAC & Climate
  {
    id: 'hvac-filter',
    title: 'Replace HVAC filter',
    description: 'Replace or clean your HVAC air filter to maintain air quality and system efficiency.',
    category: 'maintenance',
    suggestedFrequency: 'monthly',
    season: 'all',
  },
  {
    id: 'hvac-inspection',
    title: 'Schedule HVAC inspection',
    description: 'Have a professional inspect and service your heating and cooling system.',
    category: 'maintenance',
    suggestedFrequency: 'yearly',
    season: 'spring',
  },

  // Safety
  {
    id: 'smoke-detectors',
    title: 'Test smoke detectors',
    description: 'Test all smoke and carbon monoxide detectors to ensure they are working properly.',
    category: 'maintenance',
    suggestedFrequency: 'monthly',
    season: 'all',
  },
  {
    id: 'fire-extinguisher',
    title: 'Check fire extinguisher',
    description: 'Inspect fire extinguisher pressure gauge and expiration date.',
    category: 'maintenance',
    suggestedFrequency: 'yearly',
    season: 'all',
  },
  {
    id: 'smoke-detector-batteries',
    title: 'Replace smoke detector batteries',
    description: 'Replace batteries in all smoke and carbon monoxide detectors.',
    category: 'maintenance',
    suggestedFrequency: 'yearly',
    season: 'fall',
  },

  // Plumbing
  {
    id: 'water-heater-flush',
    title: 'Flush water heater',
    description: 'Drain and flush your water heater to remove sediment buildup.',
    category: 'maintenance',
    suggestedFrequency: 'yearly',
    season: 'fall',
  },
  {
    id: 'check-leaks',
    title: 'Check for water leaks',
    description: 'Inspect under sinks, around toilets, and near appliances for water leaks.',
    category: 'maintenance',
    suggestedFrequency: 'monthly',
    season: 'all',
  },
  {
    id: 'clean-drains',
    title: 'Clean drains',
    description: 'Clear drains in sinks, tubs, and showers to prevent clogs.',
    category: 'cleaning',
    suggestedFrequency: 'monthly',
    season: 'all',
  },

  // Outdoor
  {
    id: 'clean-gutters',
    title: 'Clean gutters',
    description: 'Remove leaves and debris from gutters and downspouts.',
    category: 'outdoor',
    suggestedFrequency: 'biweekly',
    season: 'fall',
  },
  {
    id: 'lawn-mowing',
    title: 'Mow the lawn',
    description: 'Mow grass to recommended height for your grass type.',
    category: 'outdoor',
    suggestedFrequency: 'weekly',
    season: 'summer',
  },
  {
    id: 'fertilize-lawn',
    title: 'Fertilize lawn',
    description: 'Apply appropriate fertilizer to keep your lawn healthy.',
    category: 'outdoor',
    suggestedFrequency: 'biweekly',
    season: 'spring',
  },
  {
    id: 'pressure-wash',
    title: 'Pressure wash exterior',
    description: 'Clean siding, driveway, and walkways with pressure washer.',
    category: 'outdoor',
    suggestedFrequency: 'yearly',
    season: 'spring',
  },

  // Appliances
  {
    id: 'refrigerator-coils',
    title: 'Clean refrigerator coils',
    description: 'Vacuum or brush dust from refrigerator condenser coils.',
    category: 'maintenance',
    suggestedFrequency: 'biweekly',
    season: 'all',
  },
  {
    id: 'dishwasher-clean',
    title: 'Deep clean dishwasher',
    description: 'Clean dishwasher interior, spray arms, and filter.',
    category: 'kitchen',
    suggestedFrequency: 'monthly',
    season: 'all',
  },
  {
    id: 'oven-clean',
    title: 'Deep clean oven',
    description: 'Clean oven interior, racks, and door glass.',
    category: 'kitchen',
    suggestedFrequency: 'monthly',
    season: 'all',
  },
  {
    id: 'dryer-vent',
    title: 'Clean dryer vent',
    description: 'Clear lint from dryer vent hose and exterior vent to prevent fires.',
    category: 'maintenance',
    suggestedFrequency: 'yearly',
    season: 'all',
  },

  // Other
  {
    id: 'rotate-mattresses',
    title: 'Rotate mattresses',
    description: 'Rotate and/or flip mattresses to ensure even wear.',
    category: 'other',
    suggestedFrequency: 'biweekly',
    season: 'all',
  },
  {
    id: 'deep-clean-carpets',
    title: 'Deep clean carpets',
    description: 'Shampoo or steam clean carpets and rugs.',
    category: 'cleaning',
    suggestedFrequency: 'biweekly',
    season: 'all',
  },
  {
    id: 'clean-windows',
    title: 'Clean windows',
    description: 'Wash interior and exterior windows.',
    category: 'cleaning',
    suggestedFrequency: 'biweekly',
    season: 'spring',
  },
  {
    id: 'organize-garage',
    title: 'Organize garage/storage',
    description: 'Declutter and organize garage, basement, or storage areas.',
    category: 'other',
    suggestedFrequency: 'yearly',
    season: 'spring',
  },
];

export function getSeasonalRecommendations(): MaintenanceRecommendation[] {
  const month = new Date().getMonth();
  let currentSeason: MaintenanceRecommendation['season'];

  if (month >= 2 && month <= 4) currentSeason = 'spring';
  else if (month >= 5 && month <= 7) currentSeason = 'summer';
  else if (month >= 8 && month <= 10) currentSeason = 'fall';
  else currentSeason = 'winter';

  return maintenanceRecommendations.filter(
    rec => rec.season === currentSeason || rec.season === 'all'
  );
}

export function getRecommendationsByCategory(category: ChoreCategory): MaintenanceRecommendation[] {
  return maintenanceRecommendations.filter(rec => rec.category === category);
}
