"""Draai met: python3 tests/bandmaat.test.py  (zelfde testgevallen als de plugin, tests/testgevallen.json)"""
import json
import sys
from pathlib import Path

hier = Path(__file__).parent
sys.path.insert(0, str(hier.parent / 'tools' / 'banden'))
from bandmaat import normaliseer, plausibel  # noqa: E402

T = json.loads((hier / 'testgevallen.json').read_text(encoding='utf-8'))['banden']
n = 0
for invoer, uit in T['normaliseer']:
    assert normaliseer(invoer) == uit, (invoer, normaliseer(invoer), uit)
    n += 1
for g in T['plausibel']:
    assert plausibel(g['maat'], g['rc']) == (g['oordeel'], g['factor']), (g, plausibel(g['maat'], g['rc']))
    n += 1
print(f'bandmaat.py: {n} controles geslaagd')
