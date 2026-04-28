import { validateDisease } from './schema.js';

export async function loadDiseaseIndex() {
  const res = await fetch('diseases/_index.json');
  if (!res.ok) throw new Error(`could not load disease index (${res.status})`);
  return res.json();
}

export async function loadDisease(id) {
  if (!/^[a-z0-9-]+$/i.test(id)) {
    throw new Error(`invalid disease id: ${id}`);
  }
  const res = await fetch(`diseases/${id}.json`);
  if (!res.ok) throw new Error(`could not load disease "${id}" (${res.status})`);
  const disease = await res.json();

  const errors = validateDisease(disease);
  if (errors.length) {
    throw new Error(`disease "${id}" failed validation:\n  ${errors.join('\n  ')}`);
  }

  return flattenDisease(disease);
}

function flattenDisease(disease) {
  const allTerms = [];
  disease.symptomGroups.forEach(g => {
    g.terms.forEach(t => allTerms.push({
      ...t,
      groupId: g.id,
      groupTitle: g.title,
      regions: g.regions
    }));
  });
  if (disease.diagnosticFinding) {
    const d = disease.diagnosticFinding;
    allTerms.push({
      name: d.name,
      desc: d.desc,
      groupId: 'diagnostic',
      groupTitle: 'Diagnostic Finding',
      regions: d.regions
    });
  }
  return { ...disease, allTerms };
}
