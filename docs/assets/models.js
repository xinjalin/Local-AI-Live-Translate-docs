// Translation model dashboard (docs/models/index.md): summary cards, quality vs speed chart, quality by
// language chart and results table, from docs/data/benchmarks.json (bench/build_benchmarks.py).
(function () {
  const root = document.getElementById('lt-dashboard');
  if (!root) return;

  const token = (name) => getComputedStyle(document.body).getPropertyValue(name).trim();
  const dark = () => document.body.getAttribute('data-md-color-scheme') === 'slate';
  const label = (m) => `${m.name} ${m.quant}`;
  const fmtS = (ms) => (ms / 1000).toFixed(2) + ' s';
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // One colour per model, the same in every chart: pastels on the dark page, deeper tones on the light one.
  const PALETTE = {
    dark: ['#a8c5da', '#c6c7f8', '#baedbd', '#ffb3a7', '#f2a7e6', '#8ab4f8', '#f9c38b', '#ffe999', '#a1e3cb', '#d4d4d4'],
    light: ['#4f7fa3', '#6366d1', '#3c9a48', '#dc6b5b', '#bf55ad', '#3b78d8', '#d0843a', '#a8891a', '#2f9e7a', '#737373']
  };
  const colorOf = (m) => PALETTE[dark() ? 'dark' : 'light'][data.models.indexOf(m) % 10];
  const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

  let data, speedChart, langChart;
  const state = { chartDir: 'intoEn', vram: 99, langDir: 'into', sortCol: 2, asc: false, visible: null };

  fetch(root.dataset.src).then(r => r.json()).then(d => {
    data = d;
    // The language chart starts with the highlighted models; the others can be switched on.
    state.visible = new Set(d.models.filter(m => m.tag || m.id === 'milmmt-46-12b-v1.0').map(m => m.id));
    document.getElementById('lt-meta').innerHTML = [d.hardware, '24 FLORES sentences per language pair', `Last run ${d.lastRun}`]
      .map(t => `<span class="lt-chip">${esc(t)}</span>`).join('');
    wire();
    renderAll();
    // Material's light / dark switch: redraw in the other palette
    new MutationObserver(renderAll).observe(document.body, { attributes: true, attributeFilter: ['data-md-color-scheme'] });
  }).catch(() => {
    root.innerHTML = '<p>The benchmark data couldn\'t be loaded.</p>';
  });

  function renderAll() {
    renderKpis();
    drawSpeedChart();
    renderLegend();
    drawLangChart();
    renderTable();
  }

  function segs(id, key, parse, after) {
    document.querySelectorAll(`#${id} button`).forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll(`#${id} button`).forEach(x => x.classList.toggle('lt-on', x === b));
      state[key] = parse ? parse(b.dataset.v) : b.dataset.v;
      after();
    }));
  }

  function wire() {
    segs('lt-dir-chart', 'chartDir', null, drawSpeedChart);
    segs('lt-vram', 'vram', Number, drawSpeedChart);
    segs('lt-dir-lang', 'langDir', null, drawLangChart);
  }

  // ---- summary cards ----------------------------------------------------------------------------

  function renderKpis() {
    const byTag = (tag) => data.models.find(m => m.tag === tag);
    const rec = byTag('recommended');
    const fast = byTag('fastest') || [...data.models].sort((a, b) => a.median - b.median)[0];
    const from = byTag('most accurate from English') || [...data.models].sort((a, b) => b.fromEn - a.fromEn)[0];
    const cards = [
      ['lt-hi-1', 'Recommended', `${rec.intoEn}<small>chrF into English</small>`, label(rec), `${fmtS(rec.median)} a line · ${rec.gb} GB`],
      ['', 'Fastest', `${fmtS(fast.median)}<small>a line</small>`, label(fast), `${fast.intoEn} chrF into English · ${fast.gb} GB`],
      ['', 'Best from English', `${from.fromEn.toFixed(1)}<small>chrF</small>`, label(from), `${fmtS(from.median)} a line · ${from.gb} GB`],
      ['lt-hi-2', 'Tested', `${data.models.length}<small>models</small>`, `${data.toEn.length} languages → English`, `and English → ${data.fromEn.length}`],
    ];
    document.getElementById('lt-kpis').innerHTML = cards.map(([cls, k, v, model, sub]) => `
      <div class="lt-kpi ${cls}">
        <div class="lt-kpi-label">${k}</div>
        <div class="lt-kpi-value">${v}</div>
        <div class="lt-kpi-model">${esc(model)}</div>
        <div class="lt-kpi-sub">${esc(sub)}</div>
      </div>`).join('');
  }

  // ---- shared chart look ------------------------------------------------------------------------

  function chartDefaults() {
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.font.size = 11;
    Chart.defaults.color = token('--lt-text');
    return {
      grid: token('--lt-line'),
      text: token('--lt-text'),
      tooltip: {
        backgroundColor: token('--lt-tooltip'), titleColor: token('--lt-tooltip-text'), bodyColor: token('--lt-tooltip-text'),
        borderColor: 'rgba(255,255,255,.08)', borderWidth: 1, padding: 10, cornerRadius: 5, boxPadding: 4, usePointStyle: true
      }
    };
  }

  // ---- quality vs speed -------------------------------------------------------------------------

  function drawSpeedChart() {
    const look = chartDefaults();
    const models = data.models.filter(m => m.gb <= state.vram);
    if (speedChart) speedChart.destroy();
    speedChart = new Chart(document.getElementById('lt-chart'), {
      type: 'bubble',
      data: { datasets: models.map(m => ({
        label: label(m), backgroundColor: alpha(colorOf(m), 0.75), borderColor: colorOf(m), borderWidth: 1.5,
        data: [{ x: m.median, y: m[state.chartDir], r: 5 + m.gb * 1.2, m }]
      })) },
      options: {
        maintainAspectRatio: false,
        animation: false,
        layout: { padding: { right: 130, top: 10 } },
        scales: {
          x: { type: 'logarithmic', title: { display: true, text: 'Median time per line (log scale)' }, grid: { color: look.grid }, border: { display: false },
               ticks: { callback: v => [200, 300, 500, 1000, 2000, 3000, 5000].includes(v) ? (v / 1000) + ' s' : '' } },
          y: { title: { display: true, text: state.chartDir === 'intoEn' ? 'chrF into English' : 'chrF from English' }, grid: { color: look.grid }, border: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { ...look.tooltip, callbacks: { label: c => `${label(c.raw.m)}: ${c.raw.y} chrF · ${fmtS(c.raw.x)} · ${c.raw.m.gb} GB` } }
        }
      },
      // Model names beside their bubbles, nudged down when they'd overlap one already placed
      plugins: [{ id: 'names', afterDatasetsDraw(ch) {
        const ctx = ch.ctx;
        ctx.save();
        ctx.font = `600 11px ${Chart.defaults.font.family}`;
        ctx.fillStyle = look.text;
        const labels = [];
        ch.data.datasets.forEach((ds, i) => ch.getDatasetMeta(i).data.forEach((pt, j) => {
          labels.push({ text: ds.label, x: pt.x + ds.data[j].r + 5, y: pt.y + 4 });
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

  // ---- quality by language ----------------------------------------------------------------------

  function renderLegend() {
    const el = document.getElementById('lt-lang-legend');
    el.innerHTML = data.models.map(m => `
      <button type="button" data-id="${esc(m.id)}" aria-pressed="${state.visible.has(m.id)}">
        <span class="lt-dot" style="background:${colorOf(m)}"></span>${esc(label(m))}
      </button>`).join('');
    el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.id;
      if (state.visible.has(id)) {
        if (state.visible.size > 1) state.visible.delete(id);
      } else {
        state.visible.add(id);
      }
      renderLegend();
      drawLangChart();
    }));
  }

  function drawLangChart() {
    const look = chartDefaults();
    const key = state.langDir;
    const langs = key === 'into' ? data.toEn : data.fromEn;
    // Best-translated languages first (averaged over every model, so the order doesn't jump when
    // models are switched on or off)
    const mean = (l) => data.models.reduce((s, m) => s + m[key][l], 0) / data.models.length;
    const order = [...langs].sort((a, b) => mean(b) - mean(a));
    const models = data.models.filter(m => state.visible.has(m.id));
    if (langChart) langChart.destroy();
    langChart = new Chart(document.getElementById('lt-lang-chart'), {
      type: 'line',
      data: {
        // (* = a language the app doesn't offer yet)
        labels: order.map(l => data.names[l] + (data.inApp.includes(l) ? '' : ' *')),
        datasets: models.map(m => ({
          label: label(m), data: order.map(l => m[key][l]), borderColor: colorOf(m), backgroundColor: colorOf(m),
          borderWidth: 2, cubicInterpolationMode: 'monotone', pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 8
        }))
      },
      options: {
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { grid: { display: false }, border: { display: false },
               ticks: { autoSkip: false, maxRotation: 55, minRotation: key === 'into' ? 55 : 0, font: { size: 10.5 } } },
          y: { title: { display: true, text: key === 'into' ? 'chrF into English' : 'chrF from English' },
               grid: { color: look.grid }, border: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { ...look.tooltip, itemSort: (a, b) => b.raw - a.raw,
                     callbacks: { label: c => ` ${c.dataset.label}  ${c.raw}` } }
        }
      },
      // Dashed line under the pointer, as in the tooltip's column
      plugins: [{ id: 'crosshair', afterDatasetsDraw(ch) {
        const active = ch.tooltip && ch.tooltip.getActiveElements();
        if (!active || !active.length) return;
        const x = active[0].element.x;
        const { top, bottom } = ch.chartArea;
        const ctx = ch.ctx;
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = token('--lt-muted');
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
        ctx.restore();
      } }]
    });
  }

  // ---- results table ----------------------------------------------------------------------------

  function ring(v) {
    const c = 2 * Math.PI * 7;
    const fill = Math.max(0, Math.min(1, v / 100)) * c;
    return `<span class="lt-ring"><svg viewBox="0 0 18 18" aria-hidden="true"><circle class="lt-track" cx="9" cy="9" r="7" fill="none" stroke-width="2.5"/>` +
      `<circle class="lt-fill" cx="9" cy="9" r="7" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="${fill} ${c}"/></svg>${v}</span>`;
  }

  const TAG_LABEL = { 'most accurate from English': 'best from English' };
  const COLS = [
    ['Model', m => m.name + m.quant, m => `<span class="lt-model"><span class="lt-dot" style="background:${colorOf(m)}"></span>` +
      `<span><span class="lt-name">${esc(m.name)}</span><span class="lt-q">${esc(m.quant)}</span>` +
      `${m.tag ? `<br><span class="lt-tag lt-tag-${m.tag.split(' ')[0]}">${esc(TAG_LABEL[m.tag] || m.tag)}</span>` : ''}</span></span>`],
    ['Size', m => m.gb, m => m.gb.toFixed(1) + ' GB', 'lt-num'],
    ['Into English', m => m.intoEn, m => ring(m.intoEn), 'lt-num'],
    ['From English', m => m.fromEn, m => (m.scriptConversion ? '' : '<span class="lt-warn" title="Measured before the Chinese script conversion">⚠ </span>') + ring(m.fromEn), 'lt-num'],
    ['Per line', m => m.median, m => `${fmtS(m.median)}<span class="lt-slow" title="slowest 10 %">/ ${fmtS(m.p90)}</span>`, 'lt-num'],
    ['Speed', m => m.tps, m => Math.round(m.tps) + ' tok/s', 'lt-num'],
    ['Cantonese', m => m.cantonese.conversation[0], m => `<span title="colloquial Cantonese into / from English">${m.cantonese.conversation.join(' / ')}</span>`, 'lt-num'],
  ];

  function renderTable() {
    const col = COLS[state.sortCol];
    const rows = [...data.models].sort((a, b) => {
      const x = col[1](a), y = col[1](b);
      return (x > y ? 1 : x < y ? -1 : 0) * (state.asc ? 1 : -1);
    });
    const t = document.getElementById('lt-table');
    t.innerHTML = `<thead><tr>${COLS.map((c, i) => `<th class="${c[3] || ''} ${i === state.sortCol ? 'lt-sorted' + (state.asc ? ' lt-asc' : '') : ''}" data-i="${i}" tabindex="0" scope="col">${c[0]}</th>`).join('')}</tr></thead>` +
      `<tbody>${rows.map(m => `<tr title="${esc(m.note || '')}">${COLS.map(c => `<td class="${c[3] || ''}">${c[2](m)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    t.querySelectorAll('th').forEach(th => {
      const sort = () => {
        const i = +th.dataset.i;
        state.asc = i === state.sortCol ? !state.asc : i === 0 || i === 4;
        state.sortCol = i;
        renderTable();
      };
      th.addEventListener('click', sort);
      th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sort(); } });
    });
  }
})();
