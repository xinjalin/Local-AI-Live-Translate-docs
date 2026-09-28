"""Builds the site's model data (docs/data/benchmarks.json) from the benchmark results.

    python bench/build_benchmarks.py           write docs/data/benchmarks.json
    python bench/build_benchmarks.py --check   fail if it isn't up to date (run by the site's workflow)

Reads results/translation.jsonl (the latest run of each model counts) and, for runs made before the
benchmark converted Chinese output to the chosen script, results/translation_zh.jsonl (English ->
Chinese re-runs) if there are any. models.json says how each model is shown; a result for a model
that isn't in it is an error, so every model on the site has a name, size and family.
"""
import json, os, statistics, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), 'docs', 'data', 'benchmarks.json')
TO_EN = ['ja', 'ko', 'zh-CN', 'yue', 'es', 'fr', 'de', 'ru', 'id', 'vi', 'th', 'ms', 'fil', 'hi', 'ar',
         'pt', 'it', 'tr', 'pl', 'nl', 'uk', 'fa', 'bn', 'ur', 'ta', 'he', 'my', 'km', 'cs']
FROM_EN = ['zh-TW', 'zh-CN', 'ja', 'ko', 'es', 'pt', 'tr']  # (the averages; Cantonese is shown on its own)
NAMES = {'ja': 'Japanese', 'ko': 'Korean', 'zh-CN': 'Chinese (Simpl.)', 'zh-TW': 'Chinese (Trad.)',
         'yue': 'Cantonese', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'ru': 'Russian',
         'id': 'Indonesian', 'vi': 'Vietnamese', 'th': 'Thai', 'ms': 'Malay', 'fil': 'Filipino', 'hi': 'Hindi',
         'ar': 'Arabic', 'pt': 'Portuguese', 'it': 'Italian', 'tr': 'Turkish', 'pl': 'Polish', 'nl': 'Dutch',
         'uk': 'Ukrainian', 'fa': 'Persian', 'bn': 'Bengali', 'ur': 'Urdu', 'ta': 'Tamil', 'he': 'Hebrew',
         'my': 'Burmese', 'km': 'Khmer', 'cs': 'Czech'}
# Languages the app offers (the others are measured for future use)
IN_APP = ['zh-TW', 'zh-CN', 'yue', 'ja', 'ko', 'es', 'pt', 'fr', 'it', 'de', 'nl', 'ru', 'uk', 'pl', 'tr',
          'id', 'vi', 'th', 'ms', 'fil', 'hi', 'bn', 'ar']


def read_jsonl(name):
    path = os.path.join(HERE, 'results', name)
    if not os.path.exists(path):
        return {}
    runs = {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            if line.strip():
                r = json.loads(line)
                runs[r['model']] = r  # the latest run of a model wins
    return runs


def build():
    meta = json.load(open(os.path.join(HERE, 'models.json'), encoding='utf-8'))
    runs, zh = read_jsonl('translation.jsonl'), read_jsonl('translation_zh.jsonl')
    unknown = [m for m in runs if m not in meta['models']]
    if unknown:
        raise SystemExit(f'Add these models to bench/models.json first: {", ".join(unknown)}')
    models = []
    for key, r in runs.items():
        p = dict(r['pairs'])
        converted = bool(r.get('opencc'))
        if not converted and key in zh:
            p.update(zh[key]['pairs'])
            converted = True
        models.append({
            'id': key, **meta['models'][key], 'measured': r['when'][:10], 'scriptConversion': converted,
            'intoEn': round(statistics.mean(p[f'{x}>en']['chrf'] for x in TO_EN), 1),
            'fromEn': round(statistics.mean(p[f'en>{y}']['chrf'] for y in FROM_EN), 1),
            'median': r['median_ms'], 'p90': r['p90_ms'], 'tps': r['tps'],
            'into': {x: p[f'{x}>en']['chrf'] for x in TO_EN},
            'from': {y: p[f'en>{y}']['chrf'] for y in FROM_EN},
            'cantonese': {'written': [p['yue>en']['chrf'], p['en>yue']['chrf']],
                          'conversation': [p['yue>en (colloquial)']['chrf'], p['en>yue (colloquial)']['chrf']]},
        })
    models.sort(key=lambda m: -m['intoEn'])
    return {'hardware': meta['hardware'], 'lastRun': max(m['measured'] for m in models), 'models': models,
            'toEn': TO_EN, 'fromEn': FROM_EN, 'names': NAMES, 'inApp': IN_APP}


def main():
    text = json.dumps(build(), ensure_ascii=False, indent=1) + '\n'
    if '--check' in sys.argv:
        current = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
        if current != text:
            raise SystemExit('docs/data/benchmarks.json is out of date: run python bench/build_benchmarks.py')
        print('docs/data/benchmarks.json is up to date')
        return
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    print(f'wrote {os.path.relpath(OUT, os.path.dirname(HERE))} ({text.count(chr(10))} lines)')


if __name__ == '__main__':
    main()
