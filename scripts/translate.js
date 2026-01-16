const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TARGET_LANG = process.env.TARGET_LANG || 'it';

const LANGUAGE_NAMES = {
  es: 'Spanish',
  en: 'English',
  it: 'Italian',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
};

async function translateBatch(texts, targetLang) {
  const entries = Object.entries(texts);
  if (entries.length === 0) return {};

  const textsToTranslate = entries.map(([key, value]) => `[${key}]: ${value}`).join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following texts from Spanish to ${LANGUAGE_NAMES[targetLang]}.
Each line has a key in brackets followed by the text to translate.
Return ONLY a valid JSON object with the same keys and translated values.
Keep the same tone and format. Keep placeholders like {variable} or {{variable}} exactly as they are.
Example input:
[greeting]: Hola, bienvenido
[farewell]: Adiós

Example output:
{"greeting": "Hello, welcome", "farewell": "Goodbye"}`,
        },
        {
          role: 'user',
          content: textsToTranslate,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API error');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  try {
    return JSON.parse(content);
  } catch {
    console.error('Failed to parse:', content);
    return {};
  }
}

function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }
  return result;
}

function unflattenObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split('.');
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }
    current[keys[keys.length - 1]] = value;
  }
  return result;
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error('Please set OPENAI_API_KEY environment variable');
    process.exit(1);
  }

  console.log(`Translating to ${LANGUAGE_NAMES[TARGET_LANG]}...`);

  // Read source file (Spanish)
  const sourcePath = path.join(__dirname, '../lib/locales/es.json');
  const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

  // Flatten for translation
  const flatSource = flattenObject(sourceContent);
  const keys = Object.keys(flatSource);

  console.log(`Found ${keys.length} keys to translate`);

  // Translate in batches of 40
  const batchSize = 40;
  const allTranslations = {};

  for (let i = 0; i < keys.length; i += batchSize) {
    const batchKeys = keys.slice(i, i + batchSize);
    const batch = {};
    for (const key of batchKeys) {
      batch[key] = flatSource[key];
    }

    console.log(`Translating batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(keys.length/batchSize)}...`);

    try {
      const translated = await translateBatch(batch, TARGET_LANG);
      Object.assign(allTranslations, translated);
    } catch (error) {
      console.error('Error translating batch:', error.message);
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }

  // Unflatten and save
  const result = unflattenObject(allTranslations);
  const targetPath = path.join(__dirname, `../lib/locales/${TARGET_LANG}.json`);
  fs.writeFileSync(targetPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`✓ Saved translations to ${targetPath}`);
  console.log(`Translated ${Object.keys(allTranslations).length} of ${keys.length} keys`);
}

main().catch(console.error);
