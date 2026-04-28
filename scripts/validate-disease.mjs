#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateDisease } from '../js/data/schema.js';

const arg = process.argv[2];
if (!arg) {
  console.error('usage: node scripts/validate-disease.mjs <path-to-disease.json>');
  process.exit(2);
}

const path = resolve(arg);
let disease;
try {
  disease = JSON.parse(readFileSync(path, 'utf8'));
} catch (err) {
  console.error(`could not parse ${path}: ${err.message}`);
  process.exit(2);
}

const errors = validateDisease(disease);
if (errors.length) {
  console.error(`✗ ${path} failed validation:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

const groups = disease.symptomGroups?.length ?? 0;
const terms = (disease.symptomGroups ?? []).reduce((s, g) => s + (g.terms?.length ?? 0), 0);
const plates = disease.histologyPlates?.length ?? 0;
console.log(`✓ ${disease.id} — ${groups} symptom groups · ${terms} terms · ${plates} plates`);
