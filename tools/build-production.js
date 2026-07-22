const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const JavaScriptObfuscator = require('javascript-obfuscator');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function ensureCleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(source, target) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const src = path.join(source, entry.name);
    const dest = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

function minifyHtml(html) {
  return html
    .replace(/<script src="brand-mapping\.js" defer><\/script>\s*<script src="script\.js" defer><\/script>/, '<script src="app.bundle.js" defer></script>')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createIdMap(html) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const uniqueIds = [...new Set(ids)];
  return new Map(uniqueIds.map((id, index) => [id, `x${index.toString(36)}_${Buffer.from(id).toString('base64url').slice(0, 6)}`]));
}

function applyIdMap(content, idMap) {
  let output = content;
  const entries = [...idMap.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [original, replacement] of entries) {
    output = output.replace(new RegExp(escapeRegExp(original), 'g'), replacement);
  }
  return output;
}

async function build() {
  ensureCleanDir(dist);
  copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));
  const originalHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const idMap = createIdMap(originalHtml);

  const sourceBody = [
    fs.readFileSync(path.join(root, 'brand-mapping.js'), 'utf8'),
    fs.readFileSync(path.join(root, 'script.js'), 'utf8')
  ].join('\n;\n');
  const source = applyIdMap(`(() => {\n${sourceBody}\nwindow.app = app;\nwindow.chicago = chicago;\nwindow.enviarParaFVP = enviarParaFVP;\n})();`, idMap);

  const minified = await minify(source, {
    compress: {
      passes: 2,
      drop_console: true
    },
    mangle: {
      toplevel: true
    },
    format: {
      comments: false
    }
  });

  if (!minified.code) {
    throw new Error('Nao foi possivel minificar o JavaScript.');
  }

  const obfuscated = JavaScriptObfuscator.obfuscate(minified.code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.65,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.2,
    identifierNamesGenerator: 'hexadecimal',
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: false,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 8,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayThreshold: 0.85,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
  });

  fs.writeFileSync(path.join(dist, 'app.bundle.js'), obfuscated.getObfuscatedCode(), 'utf8');

  const html = applyIdMap(originalHtml, idMap);
  fs.writeFileSync(path.join(dist, 'index.html'), minifyHtml(html), 'utf8');
  fs.writeFileSync(path.join(dist, 'style.css'), fs.readFileSync(path.join(root, 'style.css'), 'utf8'), 'utf8');
  const localConfig = path.join(root, 'config.local.js');
  if (fs.existsSync(localConfig)) {
    fs.copyFileSync(localConfig, path.join(dist, 'config.local.js'));
  }

  console.log('Build gerado em dist/. Publique somente o conteudo dessa pasta.');
}

build().catch(error => {
  console.error(error);
  process.exit(1);
});
