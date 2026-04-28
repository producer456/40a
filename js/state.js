const initial = () => ({
  disease: null,
  mode: 'explore',
  activeRegion: null,
  activeTerm: null,
  activeTab: 'body',
  revealedTerms: new Set()
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
