import fs from 'fs';
import chalk from 'chalk';
import util from 'util';

const file = process.argv[2];
if (!file) {
  console.log('Usage: log-viewer [path to file]');
  process.exit(1);
}

const pickFieldsArg = process.argv[3]?.split(',') || [];
const ignoreTypes = process.argv[4]?.split(',') || [];
const content = fs.readFileSync(file, 'utf-8');

const colors = [
  chalk.bgBlackBright,
  chalk.bgCyanBright,
  chalk.bgGreenBright,
  chalk.bgMagentaBright,
  chalk.bgYellowBright,
];

/** @type {Record<string, import('chalk').ChalkConstructor>} */
const types = {};

for (const line of content.split('\n')) {
  if (!line) continue;
  const parsed = JSON.parse(line);
  const { level, message, timestamp, ...content } = parsed;
  const color =
    level === 'error' ? chalk.bgRed : level === 'info' ? chalk.black.bgWhite : chalk.bgYellow;

  let [, type, messageContent] = /\[(.+)\]\s*([^]+)?/gm.exec(message) ?? [, , message];

  if (ignoreTypes.includes(type)) continue;

  try {
    const parsed = JSON.parse(messageContent.trim());
    if (pickFieldsArg.length > 0) pickFields(parsed);
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.primary &&
      typeof parsed.primary === 'object' &&
      typeof parsed.primary.size === 'number'
    ) {
      parsed.primary.size = `${(parsed.primary.size / 1048576).toFixed(2)}MB`;
    }

    messageContent = util.inspect(parsed, true, 99999, true);
  } catch (e) {}

  const typeColor = type && getTypeColor(type);

  process.stdout.write(
    `
    ${color.bold(` ${new Date(timestamp).toLocaleTimeString()} `)} ${
      type ? typeColor(' ' + type + ' ') : ''
    } ${messageContent} ${Object.keys(content).length > 0 ? util.inspect(content) : ''}`.trim() +
      '\n',
  );
}

function pickFields(object, current = '') {
  for (const key of Object.keys(object)) {
    const value = object[key];
    const currentField = current === '' ? key : `${current}.${key}`;

    if (!pickFieldsArg.find(field => field === currentField || field.startsWith(currentField))) {
      delete object[key];
      continue;
    }

    if (typeof value === 'object') {
      pickFields(value, currentField);
    }
  }
}

function getTypeColor(type) {
  if (types[type]) return types[type];

  types[type] = colors[~~(Math.random() * colors.length)].bold;
  return types[type];
}
