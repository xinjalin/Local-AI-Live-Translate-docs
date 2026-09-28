"""Translation benchmark: quality and speed of one model, through Local AI Live Translate's own translator.

    python bench/translation_bench.py --app <path to the Local-AI-Live-Translate folder> <LM Studio model key>

Run it with the app's Python (it needs the app's server code and its packages), with the model loaded
in LM Studio (at http://127.0.0.1:1234, the app's default):

    <app>\\runtime\\python.exe bench\\translation_bench.py --app <app> hy-mt2-7b

Each line of the test set goes through the app's translator exactly as a subtitle would: the same
prompt template (Auto picks one by the model's name, from the app's templates/ folder), sampling and
clean-up, and Chinese / Cantonese output converted to the chosen script with OpenCC as the server
does. Quality is chrF against the reference translation; speed is the time per line, plus tokens per
second as the app measures them. Previous lines aren't sent as context, so every model sees the same
input.

Appends one JSON line to bench/results/translation.jsonl. Then run bench/build_benchmarks.py to update
the site's data (add the model to bench/models.json first).

Options: --zh-only   only English -> Chinese (Traditional and Simplified)
         --url URL   LM Studio's address (default http://127.0.0.1:1234)
"""
import argparse, asyncio, json, os, platform, statistics, sys, time
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
TO_EN = ['ja', 'ko', 'zh-CN', 'yue', 'es', 'fr', 'de', 'ru', 'id', 'vi', 'th', 'ms', 'fil', 'hi', 'ar',
         'pt', 'it', 'tr', 'pl', 'nl', 'uk', 'fa', 'bn', 'ur', 'ta', 'he', 'my', 'km', 'cs']
FROM_EN = ['zh-TW', 'zh-CN', 'yue', 'ja', 'ko', 'es', 'pt', 'tr']
EXTRA_NAMES = {'yue': 'Cantonese', 'fa': 'Persian', 'ur': 'Urdu', 'ta': 'Tamil', 'he': 'Hebrew',
               'my': 'Burmese', 'km': 'Khmer', 'cs': 'Czech'}
# The source language as the speech engine reports it (the server passes this to templates)
ASR_CODE = {'zh-CN': 'zh'}


def chrf(hyp, ref, n=6, beta=2):
    """chrF (character n-gram F-score, n = 1..6, beta = 2), spaces ignored, 0-100."""
    hyp, ref = hyp.replace(' ', ''), ref.replace(' ', '')
    precisions, recalls = [], []
    for k in range(1, n + 1):
        h = Counter(hyp[i:i + k] for i in range(len(hyp) - k + 1))
        r = Counter(ref[i:i + k] for i in range(len(ref) - k + 1))
        if not h or not r:
            continue
        match = sum((h & r).values())
        precisions.append(match / sum(h.values()))
        recalls.append(match / sum(r.values()))
    if not precisions:
        return 0.0
    p, r = sum(precisions) / len(precisions), sum(recalls) / len(recalls)
    return 0.0 if p + r == 0 else 100 * (1 + beta ** 2) * p * r / (beta ** 2 * p + r)


async def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('model')
    ap.add_argument('--app', required=True, help='the Local-AI-Live-Translate folder')
    ap.add_argument('--url', default='http://127.0.0.1:1234')
    ap.add_argument('--zh-only', action='store_true')
    args = ap.parse_args()

    sys.path.insert(0, os.path.join(args.app, 'server'))
    import opencc
    import translator
    from prompt_templates import TemplateStore
    from translator import LlmConfig, Translator
    names = {**translator.LANG_NAMES, **EXTRA_NAMES}
    cc = {'zh-TW': opencc.OpenCC('s2twp'), 'zh-CN': opencc.OpenCC('t2s'), 'yue': opencc.OpenCC('s2hk')}

    t = Translator(TemplateStore(os.path.join(args.app, 'templates')))
    cfg = LlmConfig(provider='lmstudio', url=args.url, model=args.model, context_lines=0)
    template = t.templates.resolve(cfg.template, args.model)[0]
    print(f'== {args.model}: template {template}', flush=True)

    async def run(text, src, tgt):
        t0 = time.perf_counter()
        out, engine, stats = await t.translate(text, names[tgt] if tgt not in translator.LANG_NAMES else tgt,
                                               cfg, ASR_CODE.get(src, src))
        ms = (time.perf_counter() - t0) * 1000
        if tgt in cc and engine not in ('passthrough', 'untranslated'):
            out = cc[tgt].convert(out)
        return (out if engine == args.model else ''), stats, ms

    flores = json.load(open(os.path.join(HERE, 'data', 'flores_sentences.json'), encoding='utf-8'))
    colloquial = json.load(open(os.path.join(HERE, 'data', 'cantonese_conversation.json'), encoding='utf-8'))
    await t.translate(flores['ja'][0]['text'], 'en', cfg)  # warm-up (model load, prompt cache)

    pairs = [('en', 'zh-TW'), ('en', 'zh-CN')] if args.zh_only else [(x, 'en') for x in TO_EN] + [('en', y) for y in FROM_EN]
    result = {'model': args.model, 'template': template, 'opencc': True, 'pairs': {},
              'when': time.strftime('%Y-%m-%d %H:%M'), 'machine': platform.machine()}
    all_ms, all_tps, failed = [], [], 0

    async def measure(key, rows):
        nonlocal failed
        scores, ms, samples = [], [], []
        for text, ref, src, tgt in rows:
            out, stats, took = await run(text, src, tgt)
            failed += not out
            scores.append(chrf(out, ref))
            ms.append(took)
            samples.append(out)
            if stats:
                all_tps.append(stats['tps'])
        all_ms.extend(ms)
        result['pairs'][key] = {'chrf': round(statistics.mean(scores), 1), 'ms': round(statistics.median(ms)),
                                'sample': samples[3][:140]}
        print(f'{key:22} chrF {statistics.mean(scores):5.1f}  {statistics.median(ms):5.0f} ms | {samples[3][:80]}', flush=True)

    for src, tgt in pairs:
        rows = flores[tgt if src == 'en' else src]
        await measure(f'{src}>{tgt}', [(r['en'], r['text'], src, tgt) if src == 'en' else (r['text'], r['en'], src, tgt)
                                        for r in rows])
    if not args.zh_only:
        # colloquial Cantonese (Pangeanic Cantonese-English corpus, CC BY 4.0)
        await measure('yue>en (colloquial)', [(r['yue'], r['en'], 'yue', 'en') for r in colloquial])
        await measure('en>yue (colloquial)', [(r['en'], r['yue'], 'en', 'yue') for r in colloquial])
    await t.close()

    result['median_ms'] = round(statistics.median(all_ms))
    result['p90_ms'] = round(sorted(all_ms)[int(len(all_ms) * 0.9)])
    result['tps'] = round(statistics.median(all_tps), 1) if all_tps else None
    print(f"== {args.model}: median {result['median_ms']} ms/line, p90 {result['p90_ms']} ms, {result['tps']} t/s", flush=True)
    if failed:
        print(f'!! {failed} lines came back untranslated: check that the model is loaded and answering', flush=True)
    out = os.path.join(HERE, 'results', 'translation_zh.jsonl' if args.zh_only else 'translation.jsonl')
    with open(out, 'a', encoding='utf-8') as f:
        f.write(json.dumps(result, ensure_ascii=False) + '\n')
    print('saved to', os.path.relpath(out, os.path.dirname(HERE)))


if __name__ == '__main__':
    asyncio.run(main())
