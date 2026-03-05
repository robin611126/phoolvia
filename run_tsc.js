const cp = require('child_process');
const fs = require('fs');

try {
    let out = cp.execSync('npx tsc -b', { encoding: 'utf-8' });
    fs.writeFileSync('ts_build_errors.log', out, 'utf-8');
} catch (e) {
    fs.writeFileSync('ts_build_errors.log', (e.stdout || '') + '\n' + (e.stderr || ''), 'utf-8');
}
