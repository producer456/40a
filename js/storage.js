const PREFIX = 'bio40a:disease:';

const memFallback = new Map();

const probeLocalStorage = () => {
  try {
    const k = '__bio40a_probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
};

const hasLS = probeLocalStorage();

const read = (key) => {
  if (hasLS) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }
  return memFallback.get(key) ?? null;
};

const write = (key, value) => {
  if (hasLS) localStorage.setItem(key, JSON.stringify(value));
  else memFallback.set(key, value);
};

const remove = (key) => {
  if (hasLS) localStorage.removeItem(key);
  else memFallback.delete(key);
};

export const storage = {
  saveProgress(diseaseId, progress) {
    write(PREFIX + diseaseId, {
      ...progress,
      lastVisited: new Date().toISOString()
    });
  },

  loadProgress(diseaseId) {
    return read(PREFIX + diseaseId);
  },

  clearProgress(diseaseId) {
    remove(PREFIX + diseaseId);
  }
};
