// Translation model dashboard (docs/models/index.md): recommendation cards, quality vs speed chart,
// results table and per-language heatmap, from docs/data/benchmarks.json (bench/build_benchmarks.py).
(function () {
  const root = document.getElementById('lt-dashboard');
  if (!root) return;

  const css = (name) => getComputedStyle(document.body).getPropertyValue(name).trim();
  const label = (m) => `${m.name} ${m.quant}`;
  const fmtS = (ms) => (ms / 1000).toFixed(2) + ' s';
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const FAMILY = { 'Tencent Hy-MT2': '#7c3aed', 'Xiaomi MiLMMT': '#f97316', 'Google Gemma': '#0ea5e9', 'Qwen': '#10b981' };
  const familyColor = (f) => FAMILY[f] || '#94a3b8';

  let data, chart;
  const state = { chartDir: 'intoEn', vram: 99, sortCol: 3, asc: false, heatDir: 'into' };
  const shown = () => data.models.filter(m => m.gb <= state.vram);

  fetch(root.dataset.src).then(r => r.json()).then(d => {
    data = d;
    document.getElementById('lt-meta').innerHTML = [
      d.hardware, '24 FLORES sentences per language pair', `${d.toEn.length} languages → English · English → ${d.fromEn.length}`,
      `Last run ${d.lastRun}`
    ].map(t => `<span class="lt-chip">${esc(t)}</span>`).join('');
    renderCards();
    wire();
    renderAll();
    // Material's light / dark switch: redraw the chart and heatmap in the new colours
    new MutationObserver(renderAll).observe(document.body, { attributes: true, attributeFilter: ['data-md-color-scheme'] });
  }).catch(() => {
    root.innerHTML = '<p>The benchmark data couldn\'t be loaded.</p>';
  });

  function renderAll() {
    drawChart();
    renderTable();
    renderHeat();
  }

  function renderCards() {
    const order = ['recommended', 'fastest', 'most accurate from English'];
    const titles = { recommended: 'Recommended', fastest: 'Fastest · little VRAM', 'most accurate from English': 'Most accurate from English' };
    const cards = order.map(tag => data.models.find(m => m.tag === tag)).filter(Boolean);
    document.getElementById('lt-cards').innerHTML = cards.map(m => `
      <div class="lt-card ${m.tag === 'recommended' ? 'lt-rec' : ''}">
        <div class="lt-k">${titles[m.tag]}</div>
        <div class="lt-v">${esc(label(m))}</div>
        <div class="lt-d">${m.intoEn} into English · ${m.fromEn} from English · ${fmtS(m.median)} / line · ${m.gb} GB</div>
        <div class="lt-d">${esc(m.note || '')}</div>
      </div>`).join('');
  }

  function segs(id, key, parse) {
    document.querySelectorAll(`#${id} button`).forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll(`#${id} button`).forEach(x => x.classList.toggle('lt-on', x === b));
      state[key] = parse ? parse(b.dataset.v) : b.dataset.v;
      renderAll();
    }));
  }

  function wire() {
    segs('lt-dir-chart', 'chartDir');
    segs('lt-vram', 'vram', Number);
    segs('lt-dir-heat', 'heatDir');
  }

  // Quality vs speed: up is more accurate, left is faster; bubble size is the file size.
  function drawChart() {
    const models = shown();
    const families = [...new Set(data.models.map(m => m.family))];
    const sets = families.map(fam => ({
      label: fam, backgroundColor: familyColor(fam) + 'b3', borderColor: familyColor(fam),
      data: models.filter(m => m.family === fam).map(m => ({ x: m.median, y: m[state.chartDir], r: 5 + m.gb * 1.3, m }))
    })).filter(s => s.data.length);
    if (chart) chart.destroy();
    const text = css('--md-default-fg-color') || '#333';
    const muted = css('--md-default-fg-color--light') || '#777';
    const grid = css('--md-default-fg-color--lightest') || 'rgba(0,0,0,.08)';
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.color = muted;
    chart = new Chart(document.getElementById('lt-chart'), {
      type: 'bubble',
      data: { datasets: sets },
      options: {
        maintainAspectRatio: false,
        animation: false,
        layout: { padding: { right: 140, top: 8 } },
        scales: {
          x: { type: 'logarithmic', title: { display: true, text: 'Median time per line (log scale)' }, grid: { color: grid },
               ticks: { callback: v => [200, 300, 500, 1000, 2000, 3000, 5000].includes(v) ? (v / 1000) + ' s' : '' } },
          y: { title: { display: true, text: state.chartDir === 'intoEn' ? 'chrF into English' : 'chrF from English' }, grid: { color: grid } }
        },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true } },
          tooltip: { callbacks: { label: c => `${label(c.raw.m)}: ${c.raw.y} chrF · ${fmtS(c.raw.x)} · ${c.raw.m.gb} GB` } }
        }
      },
      // Model names beside their bubbles, nudged down when they'd overlap one already placed
      plugins: [{ id: 'names', afterDatasetsDraw(ch) {
        const ctx = ch.ctx;
        ctx.save();
        ctx.font = `600 11px ${Chart.defaults.font.family}`;
        ctx.fillStyle = text;
        const labels = [];
        ch.data.datasets.forEach((ds, i) => ch.getDatasetMeta(i).data.forEach((pt, j) => {
          labels.push({ text: label(ds.data[j].m), x: pt.x + ds.data[j].r + 4, y: pt.y + 4 });
        }));
        labels.sort((a, b) => a.y - b.y);
        const placed = [];
        for (const l of labels) {
          const w = ctx.measureText(l.text).width;
          for (let n = 0; n < 20 && placed.some(p => l.x < p.x + p.w && p.x < l.x + w && Math.abs(l.y - p.y) < 13); n++) l.y += 13;
          placed.push({ ...l, w });
          ctx.fillText(l.text, l.x, l.y);
        }
        ctx.restore();
      } }]
    });
  }

  const COLS = [
    ['Model', m => m.name + m.quant, m => `<span class="lt-name">${esc(m.name)}</span><span class="lt-q">${esc(m.quant)}</span>${m.tag ? `<span class="lt-tag lt-tag-${m.tag.split(' ')[0]}">${esc(m.tag)}</span>` : ''}`],
    ['Family', m => m.family, m => esc(m.family)],
    ['File', m => m.gb, m => m.gb.toFixed(1) + ' GB', 'lt-num'],
    ['Into English', m => m.intoEn, m => `${m.intoEn}<span class="lt-bar" style="width:${Math.max(0, (m.intoEn - 55) * 4)}px"></span>`, 'lt-num'],
    ['From English', m => m.fromEn, m => `${m.scriptConversion ? '' : '<span class="lt-warn" title="Measured before the Chinese script conversion">⚠ </span>'}${m.fromEn}`, 'lt-num'],
    ['Per line', m => m.median, m => fmtS(m.median), 'lt-num'],
    ['Slowest 10 %', m => m.p90, m => fmtS(m.p90), 'lt-num'],
    ['Speed', m => m.tps, m => Math.round(m.tps) + ' tok/s', 'lt-num'],
    ['Cantonese (conversation)', m => m.cantonese.conversation[0], m => m.cantonese.conversation.join(' / '), 'lt-num'],
  ];

  function renderTable() {
    const col = COLS[state.sortCol];
    const rows = shown().sort((a, b) => {
      const x = col[1](a), y = col[1](b);
      return (x > y ? 1 : x < y ? -1 : 0) * (state.asc ? 1 : -1);
    });
    const t = document.getElementById('lt-table');
    t.innerHTML = `<thead><tr>${COLS.map((c, i) => `<th class="${c[3] || ''} ${i === state.sortCol ? 'lt-sorted' + (state.asc ? ' lt-asc' : '') : ''}" data-i="${i}" tabindex="0">${c[0]}</th>`).join('')}</tr></thead>` +
      `<tbody>${rows.map(m => `<tr title="${esc(m.note || '')}">${COLS.map(c => `<td class="${c[3] || ''}">${c[2](m)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    t.querySelectorAll('th').forEach(th => {
      const sort = () => {
        const i = +th.dataset.i;
        state.asc = i === state.sortCol ? !state.asc : i < 2;
        state.sortCol = i;
        renderTable();
      };
      th.addEventListener('click', sort);
      th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sort(); } });
    });
  }

  // red (40) -> yellow (60) -> green (80+)
  function heatColor(v) {
    const t = Math.max(0, Math.min(1, (v - 40) / 40));
    const stops = [[239, 68, 68], [234, 179, 8], [16, 185, 129]];
    const [a, b, u] = t < 0.5 ? [stops[0], stops[1], t * 2] : [stops[1], stops[2], (t - 0.5) * 2];
    return `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * u)).join(',')})`;
  }

  function renderHeat() {
    const langs = state.heatDir === 'into' ? data.toEn : data.fromEn;
    const rows = shown().sort((a, b) => b.intoEn - a.intoEn);
    const t = document.getElementById('lt-heat');
    t.innerHTML = `<tr><th class="lt-rowh"></th>${langs.map(l => `<th class="${data.inApp.includes(l) ? '' : 'lt-notapp'}"><span>${esc(data.names[l])}</span></th>`).join('')}</tr>` +
      rows.map(m => `<tr><th class="lt-rowh">${esc(label(m))}</th>${langs.map(l => {
        const v = m[state.heatDir][l];
        return `<td style="background:${heatColor(v)}" title="${esc(label(m))} · ${esc(data.names[l])}: ${v}">${Math.round(v)}</td>`;
      }).join('')}</tr>`).join('');
  }
})();
