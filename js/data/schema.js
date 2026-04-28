/**
 * @typedef {Object} Term
 * @property {string} name
 * @property {string} desc
 */

/**
 * @typedef {Object} SymptomGroup
 * @property {string} id
 * @property {string} title
 * @property {string} desc
 * @property {string[]} regions  Region ids referenced by this group.
 * @property {Term[]} terms
 */

/**
 * @typedef {Object} HistologyPlate
 * @property {string} id
 * @property {string} number       e.g. "II.A"
 * @property {string} title
 * @property {string} imageUrl
 * @property {string} imageAlt
 * @property {string} fallbackText Shown if the image fails to load.
 * @property {string} caption
 * @property {string} attribution
 * @property {string} sourceUrl
 * @property {string[]} terms      Term names that appear in this plate.
 */

/**
 * @typedef {Object} DiagnosticFinding
 * @property {string} name
 * @property {string} desc
 * @property {string[]} regions
 */

/**
 * @typedef {Object} Disease
 * @property {string} id
 * @property {string} title
 * @property {string} subtitle
 * @property {string} course
 * @property {string} bodyFigure
 * @property {DiagnosticFinding} diagnosticFinding
 * @property {Object<string,string>} regionLabels
 * @property {SymptomGroup[]} symptomGroups
 * @property {HistologyPlate[]} histologyPlates
 */

export const REQUIRED_DISEASE_FIELDS = [
  'id', 'title', 'subtitle', 'course', 'bodyFigure',
  'diagnosticFinding', 'regionLabels', 'symptomGroups', 'histologyPlates'
];

export const REQUIRED_PLATE_FIELDS = [
  'id', 'number', 'title', 'imageUrl', 'imageAlt',
  'caption', 'attribution', 'sourceUrl', 'terms'
];

export const REQUIRED_GROUP_FIELDS = ['id', 'title', 'desc', 'regions', 'terms'];

export function validateDisease(disease) {
  const errors = [];
  if (!disease || typeof disease !== 'object') {
    return ['disease must be an object'];
  }

  for (const f of REQUIRED_DISEASE_FIELDS) {
    if (disease[f] === undefined) errors.push(`missing field: ${f}`);
  }

  if (disease.regionLabels && typeof disease.regionLabels !== 'object') {
    errors.push('regionLabels must be an object');
  }

  if (Array.isArray(disease.symptomGroups)) {
    disease.symptomGroups.forEach((g, i) => {
      for (const f of REQUIRED_GROUP_FIELDS) {
        if (g[f] === undefined) errors.push(`symptomGroups[${i}]: missing ${f}`);
      }
      if (Array.isArray(g.regions) && disease.regionLabels) {
        g.regions.forEach(r => {
          if (!disease.regionLabels[r]) {
            errors.push(`symptomGroups[${i}] (${g.id}): region "${r}" not in regionLabels`);
          }
        });
      }
      if (Array.isArray(g.terms)) {
        g.terms.forEach((t, j) => {
          if (!t.name) errors.push(`symptomGroups[${i}].terms[${j}]: missing name`);
          if (!t.desc) errors.push(`symptomGroups[${i}].terms[${j}]: missing desc`);
        });
      }
    });
  } else {
    errors.push('symptomGroups must be an array');
  }

  if (Array.isArray(disease.histologyPlates)) {
    const allTermNames = new Set();
    (disease.symptomGroups || []).forEach(g =>
      (g.terms || []).forEach(t => allTermNames.add(t.name))
    );
    if (disease.diagnosticFinding?.name) allTermNames.add(disease.diagnosticFinding.name);

    disease.histologyPlates.forEach((p, i) => {
      for (const f of REQUIRED_PLATE_FIELDS) {
        if (p[f] === undefined) errors.push(`histologyPlates[${i}]: missing ${f}`);
      }
      if (Array.isArray(p.terms)) {
        p.terms.forEach(t => {
          if (!allTermNames.has(t)) {
            errors.push(`histologyPlates[${i}] (${p.id}): term "${t}" not declared in any symptomGroup`);
          }
        });
      }
    });
  } else {
    errors.push('histologyPlates must be an array');
  }

  return errors;
}
