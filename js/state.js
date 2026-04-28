const initial = () => ({
  disease: null,
  mode: 'explore',
  activeRegion: null,
  activeTerm: null,
  // Where the user was before drilling into a single term — lets the
  // info panel show a back button that returns them to the same
  // expanded region view, instead of needing to re-tap the body chart.
  previousRegion: null,
  activeTab: 'body',
  revealedTerms: new Set(),
  expandedGroups: new Set()
});

let current = initial();
const listeners = new Set();

export const state = {
  get() { return current; },

  set(partial) {
    current = { ...current, ...partial };
    listeners.forEach(fn => fn(current));
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  reset() {
    current = { ...current, activeRegion: null, activeTerm: null };
    listeners.forEach(fn => fn(current));
  }
};
