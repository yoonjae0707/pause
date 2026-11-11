"""Package only the built extension. Uses Python's standard library; never publishes."""
import hashlib
import json
from pathlib import Path
import subprocess
from datetime import datetime, timezone
import zipfile

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
OUT = ROOT / 'artifacts'
manifest = json.loads((DIST / 'manifest.json').read_text())
assert manifest['manifest_version'] == 3
assert manifest['permissions'] == ['storage']
required = [manifest['action']['default_popup']]
if 'options_ui' in manifest:
    required.append(manifest['options_ui']['page'])
required += [p for entry in manifest['content_scripts'] for p in entry['js']]
assert all((DIST / p).is_file() for p in required), 'Incomplete build; run npm run build'
assert 'process.env.NODE_ENV' not in (DIST / 'content.js').read_text()
info = {
    'extensionVersion': manifest['version'],
    'commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
    'dirtyWorktree': bool(subprocess.check_output(['git', 'status', '--porcelain'], cwd=ROOT, text=True).strip()),
    'builtAtUTC': datetime.now(timezone.utc).isoformat(),
    'node': subprocess.check_output(['node', '--version'], text=True).strip(),
    'lockfileSHA256': hashlib.sha256((ROOT / 'package-lock.json').read_bytes()).hexdigest(),
}
(DIST / 'PAUSE-BUILD.json').write_text(json.dumps(info, indent=2) + '\n')
OUT.mkdir(exist_ok=True)
archive = OUT / f"pause-chrome-{manifest['version']}-task002.zip"
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as output:
    for path in sorted(DIST.rglob('*')):
        if path.is_file():
            output.write(path, path.relative_to(DIST))
with zipfile.ZipFile(archive) as output:
    assert output.testzip() is None, 'ZIP integrity failure'
    assert 'manifest.json' in output.namelist(), 'manifest must be at the extraction root'
checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
(OUT / 'SHA256SUMS').write_text(f'{checksum}  {archive.name}\n')
print(f'Created {archive.relative_to(ROOT)} ({archive.stat().st_size} bytes)')
print(f'SHA256 {checksum}')
print(f'Build commit: {info["commit"]}; dirty: {info["dirtyWorktree"]}')
