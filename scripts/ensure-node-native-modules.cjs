const { spawnSync } = require('child_process');
const { createRequire } = require('module');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const requireFromCwd = createRequire(path.join(process.cwd(), 'package.json'));
const nativeModules = ['better-sqlite3'];

function canLoad(moduleName) {
  const check = spawnSync(
    process.execPath,
    [
      '-e',
      `
const { createRequire } = require('module');
const req = createRequire(${JSON.stringify(path.join(process.cwd(), 'package.json'))});
const loaded = req(${JSON.stringify(moduleName)});
if (${JSON.stringify(moduleName)} === 'better-sqlite3') {
  const Database = loaded.default ?? loaded;
  const db = new Database(':memory:');
  db.close();
}
`,
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  if (check.status === 0) {
    return true;
  }

  const message = `${check.stderr}\n${check.stdout}`;
  if (
    message.includes('NODE_MODULE_VERSION') ||
    message.includes('was compiled against a different Node.js version') ||
    message.includes('invalid ELF header') ||
    message.includes('wrong architecture') ||
    message.includes('ERR_DLOPEN_FAILED') ||
    message.includes('build/Release') ||
    message.includes('Cannot find module')
  ) {
    return false;
  }

  process.stderr.write(message);
  process.exit(check.status ?? 1);
}

function rebuildForNode(moduleName) {
  console.log(`[native] Rebuilding ${moduleName} for Node ${process.version}`);
  const packageRoot = path.dirname(requireFromCwd.resolve(`${moduleName}/package.json`));
  fs.rmSync(path.join(packageRoot, 'build'), { recursive: true, force: true });
  const env = { ...process.env };
  delete env.npm_config_runtime;
  delete env.npm_config_target;
  delete env.npm_config_disturl;
  delete env.npm_config_arch;
  delete env.npm_config_target_arch;
  env.npm_config_build_from_source = 'true';

  const result = spawnSync('pnpm', ['rebuild', moduleName], {
    cwd: repoRoot,
    env,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  if (canLoad(moduleName)) {
    return;
  }

  const fallback = spawnSync('npm', ['run', 'build-release'], {
    cwd: packageRoot,
    env,
    stdio: 'inherit',
  });
  if (fallback.status !== 0) {
    process.exit(fallback.status ?? 1);
  }
}

for (const moduleName of nativeModules) {
  if (!canLoad(moduleName)) {
    rebuildForNode(moduleName);
  }
  if (!canLoad(moduleName)) {
    console.error(`[native] ${moduleName} is still not loadable after rebuild.`);
    process.exit(1);
  }
}
