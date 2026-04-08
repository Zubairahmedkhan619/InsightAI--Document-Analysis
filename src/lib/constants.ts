export const LANG_MAP: Record<string,string> = {
  en:'English', es:'Español', fr:'Français', de:'Deutsch',
  ar:'العربية', zh:'中文', ja:'日本語', pt:'Português',
  ta:'Tamil', hi:'Hindi', ml:'Malayalam'
};

export const TYPE_LABELS: Record<string,string> = {
  pdf:'PDF', excel:'Excel', ppt:'PowerPoint', word:'Word',
  image:'Image', video:'Video', youtube:'YouTube', url:'Link'
};

export const ANALYSIS_TYPES = [
  { id:'summary',     label:'Summary',     desc:'Key points & overview' },
  { id:'sentiment',   label:'Sentiment',   desc:'Tone & emotion analysis' },
  { id:'statistical', label:'Statistical', desc:'Data patterns & stats' },
];
