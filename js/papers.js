/* Paper sheets. Clicking a publication card with data-paper="id" opens a sheet with the
   paper's links, a few headline numbers, its gain over the strongest baseline on each
   dataset, and the full numbers. Every number is copied from the paper's own tables;
   values stay strings so they keep the paper's decimals. The badges, title and authors
   are copied from the card, so the card and the sheet never drift apart. */
(() => {
  'use strict';

  /* Each paper:
       links    [label, url] pairs; the first is the main "read the paper" link
       metrics  { name, up }: up is true when higher is better (false for errors like MAE)
       lead     which metric the chart opens on (default 0)
       rows     { name, sub?, vs, ours: [...], best: [...] } one value per metric. best is the
                strongest other method in the paper's table for that metric; vs names it,
                either once for the row or per metric
       kpis     headline tiles: { from: [row name, metric name], label } computes the gain,
                or { v, dec, pre, unit, label } for a number stated in the paper. The first
                one also goes on the card, with its short label
       note     where the numbers come from */
  const MARINE = [{ name: 'mIoU', up: true }, { name: 'Sα', up: true }, { name: 'Fβʷ', up: true }, { name: 'mEφ', up: true }, { name: 'MAE', up: false }];
  const PAPERS = {
    vinci2: {
      links: [['Paper', 'https://arxiv.org/abs/2607.11523'], ['Project page', 'https://sitonggong.github.io/EgoServe-page/'], ['Code', 'https://github.com/SitongGong/EgoMemo'], ['Dataset', 'https://huggingface.co/datasets/SitongGong/EgoServe']],
      metrics: [{ name: 'Score', up: true }],
      rowLabel: 'Benchmark',
      metricNote: 'Each benchmark is scored with its own metric, in points; higher is better. EgoMemo needs no training.',
      gainTitle: 'EgoMemo against the strongest model on each benchmark',
      rows: [
        { name: 'EgoServe', sub: 'F1', vs: 'GPT-5-mini', ours: ['8.0'], best: ['4.7'] },
        { name: 'OVO-Bench real-time', sub: 'avg', vs: 'GPT-4o', ours: ['75.15'], best: ['64.46'] },
        { name: 'EgoSchema', vs: 'EgoThinker', ours: ['74.8'], best: ['67.6'] },
        { name: 'ESTP-Bench explicit', sub: 'all', vs: 'EyeWO', ours: ['27.6'], best: ['23.6'] },
        { name: 'QAEgo4D', vs: 'EgoThinker', ours: ['68.0'], best: ['66.2'] },
        { name: 'EgoTaskQA', vs: 'EgoThinker', ours: ['60.9'], best: ['64.4'] },
        { name: 'OVO-Bench backward', sub: 'avg', vs: 'GPT-4o', ours: ['49.60'], best: ['60.75'] },
        { name: 'ESTP-Bench implicit', sub: 'all', vs: 'EyeWO (trained)', ours: ['34.7'], best: ['52.5'] }
      ],
      kpis: [
        { v: 1.7, dec: 1, unit: '×', short: 'GPT-5-mini’s F1 on EgoServe', label: 'the F1 of GPT-5-mini on EgoServe (8.0 vs 4.7), the benchmark this paper introduces' },
        { v: 10.69, dec: 2, pre: '+', unit: 'pts', label: 'over GPT-4o on OVO-Bench real-time visual perception' },
        { v: 3000, unit: '+', label: 'service instances in EgoServe, across 10 categories and 4 time horizons' }
      ],
      note: 'Numbers from Tables 1–4 of the arXiv version. Ours is EgoMemo, the training-free, memory-augmented agent from the paper.'
    },
    hfpsam: {
      links: [['Paper', 'https://arxiv.org/abs/2603.12708'], ['IEEE Xplore', 'https://ieeexplore.ieee.org/document/11455601'], ['Code', 'https://github.com/Drchip61/TIP-HFP-SAM']],
      metrics: MARINE,
      rows: [
        { name: 'MAS3K', vs: ['Dual-SAM', 'MAS-SAM', 'MAS-SAM', 'MAS-SAM', 'Dual-SAM'], ours: ['0.807', '0.891', '0.863', '0.945', '0.022'], best: ['0.789', '0.887', '0.840', '0.938', '0.023'] },
        { name: 'RMAS', vs: 'MAS-SAM', ours: ['0.758', '0.869', '0.833', '0.957', '0.019'], best: ['0.742', '0.865', '0.819', '0.948', '0.021'] },
        { name: 'UFO120', vs: ['Dual-SAM', 'MAS-SAM', 'MAS-SAM / Dual-SAM', 'MAS-SAM / Dual-SAM', 'MAS-SAM'], ours: ['0.813', '0.870', '0.868', '0.921', '0.058'], best: ['0.810', '0.861', '0.864', '0.914', '0.063'] },
        { name: 'RUWI', vs: ['Dual-SAM', 'Dual-SAM', 'MAS-SAM', 'MAS-SAM', 'MAS-SAM / Dual-SAM'], ours: ['0.913', '0.906', '0.951', '0.969', '0.031'], best: ['0.904', '0.903', '0.941', '0.961', '0.035'] }
      ],
      kpis: [
        { v: 20, unit: '/ 20', short: 'best on every dataset and metric', label: 'dataset–metric pairs where HFP-SAM2 is best, ahead of our own Dual-SAM and MAS-SAM' },
        { from: ['MAS3K', 'Fβʷ'], label: 'on MAS3K over MAS-SAM' },
        { v: 34, unit: '×', label: 'faster point-prompt selection than global sampling (9.3 ms vs 314.8 ms), and more accurate' }
      ],
      note: 'Numbers from Tables I–II and V of the arXiv version. Ours is HFP-SAM2 (Hiera-L backbone), the stronger of the paper’s two variants. Dual-SAM’s RUWI scores are taken from the Dual-SAM paper.'
    },
    dualsam: {
      links: [['Paper', 'https://openaccess.thecvf.com/content/CVPR2024/html/Zhang_Fantastic_Animals_and_Where_to_Find_Them_Segment_Any_Marine_CVPR_2024_paper.html'], ['arXiv', 'https://arxiv.org/abs/2404.04996'], ['Code', 'https://github.com/Drchip61/Dual_SAM']],
      metrics: MARINE,
      rows: [
        { name: 'MAS3K', vs: ['H2Former', 'SAM-DADF', 'H2Former', 'H2Former / SAM-DADF', 'H2Former / SAM-DADF'], ours: ['0.789', '0.884', '0.838', '0.933', '0.023'], best: ['0.748', '0.866', '0.810', '0.925', '0.028'] },
        { name: 'RMAS', vs: ['MASNet', 'MASNet', 'MASNet', 'TransUNet', 'ZoomNet'], ours: ['0.735', '0.860', '0.812', '0.944', '0.022'], best: ['0.731', '0.862', '0.801', '0.941', '0.022'] },
        { name: 'UFO120', vs: 'H2Former', ours: ['0.810', '0.856', '0.864', '0.914', '0.064'], best: ['0.780', '0.844', '0.845', '0.901', '0.070'] },
        { name: 'RUWI', vs: ['SAM-DADF', 'SAM-DADF', 'SAM-DADF', 'SAM-Adapter', 'SAM-DADF'], ours: ['0.904', '0.903', '0.939', '0.959', '0.035'], best: ['0.881', '0.889', '0.925', '0.946', '0.044'] }
      ],
      kpis: [
        { from: ['MAS3K', 'mIoU'], short: 'on MAS3K', label: 'on MAS3K over H2Former' },
        { from: ['UFO120', 'mIoU'], label: 'on UFO120 over H2Former' },
        { from: ['RUWI', 'MAE'], label: 'on RUWI over SAM-DADF' }
      ],
      note: 'Numbers from Tables 1–2 of the CVPR paper.'
    },
    massam: {
      links: [['Paper', 'https://www.ijcai.org/proceedings/2024/761'], ['arXiv', 'https://arxiv.org/abs/2404.15700'], ['Code', 'https://github.com/Drchip61/MAS-SAM']],
      metrics: MARINE,
      rows: [
        { name: 'MAS3K', vs: ['H2Former', 'SAM-DADF', 'Med-SAM', 'H2Former / SAM-DADF', 'H2Former / SAM-DADF'], ours: ['0.788', '0.887', '0.840', '0.938', '0.025'], best: ['0.748', '0.866', '0.811', '0.925', '0.028'] },
        { name: 'RMAS', vs: ['MASNet', 'MASNet', 'MASNet', 'TransUNet', 'ZoomNet'], ours: ['0.742', '0.865', '0.819', '0.948', '0.021'], best: ['0.731', '0.862', '0.801', '0.941', '0.022'] },
        { name: 'UFO120', vs: 'H2Former', ours: ['0.807', '0.861', '0.864', '0.914', '0.063'], best: ['0.780', '0.844', '0.845', '0.901', '0.070'] },
        { name: 'RUWI', vs: ['SAM-DADF', 'SAM-DADF', 'SAM-DADF', 'SAM-Adapter', 'SAM-DADF'], ours: ['0.902', '0.894', '0.941', '0.961', '0.035'], best: ['0.881', '0.889', '0.925', '0.946', '0.044'] }
      ],
      kpis: [
        { v: 20, unit: '/ 20', short: 'best on every dataset and metric', label: 'dataset–metric pairs where MAS-SAM is best' },
        { from: ['MAS3K', 'mIoU'], label: 'on MAS3K over H2Former' },
        { from: ['RUWI', 'MAE'], label: 'on RUWI over SAM-DADF' }
      ],
      note: 'Numbers from Tables 1–2 of the IJCAI paper.'
    },
    transynet: {
      links: [['Paper', 'https://arxiv.org/abs/2310.14214'], ['IEEE Xplore', 'https://ieeexplore.ieee.org/document/10292873/'], ['Code', 'https://github.com/Drchip61/TransYNet'], ['ACCV 2022 version', 'https://openaccess.thecvf.com/content/ACCV2022/html/Yan_Fully_Transformer_Network_for_Change_Detection_of_Remote_Sensing_Images_ACCV_2022_paper.html']],
      metrics: [{ name: 'IoU', up: true }],
      rows: [
        { name: 'WHU-CD', vs: 'FTN, our ACCV 2022 version', ours: ['87.58'], best: ['85.45'] },
        { name: 'SYSU-CD', vs: 'FTN, our ACCV 2022 version', ours: ['70.71'], best: ['68.82'] },
        { name: 'Google-CD', vs: 'FTN, our ACCV 2022 version', ours: ['75.50'], best: ['74.79'] },
        { name: 'LEVIR-CD', vs: 'UVACD', ours: ['83.64'], best: ['83.98'] }
      ],
      kpis: [
        { from: ['WHU-CD', 'IoU'], short: 'on WHU-CD', label: 'on WHU-CD' },
        { from: ['SYSU-CD', 'IoU'], label: 'on SYSU-CD' },
        { v: 2.9, dec: 1, pre: '+', unit: 'mBA', label: 'boundary accuracy on LEVIR-CD over ChangeFormer (71.6 vs 68.7)' }
      ],
      note: 'Numbers from Tables I–III of the arXiv version, in %.'
    },
    mambapro: {
      links: [['Paper', 'https://arxiv.org/abs/2412.10707'], ['AAAI', 'https://ojs.aaai.org/index.php/AAAI/article/view/32879'], ['Code', 'https://github.com/924973292/MambaPro']],
      metrics: [{ name: 'mAP', up: true }, { name: 'Rank-1', up: true }],
      rows: [
        { name: 'RGBNT201', vs: 'TOP-ReID', ours: ['78.9', '83.4'], best: ['72.3', '76.6'] },
        { name: 'RGBNT100', vs: ['RSCNet', 'LRMM'], ours: ['83.9', '94.7'], best: ['82.3', '96.7'] },
        { name: 'MSVR310', vs: ['RSCNet', 'CCNet'], ours: ['47.0', '56.5'], best: ['39.5', '55.2'] }
      ],
      kpis: [
        { from: ['MSVR310', 'mAP'], short: 'on MSVR310', label: 'on MSVR310 over RSCNet' },
        { from: ['RGBNT201', 'mAP'], label: 'on RGBNT201 over TOP-ReID' },
        { v: 3, unit: '/ 3', label: 'benchmarks where MambaPro has the best mAP' }
      ],
      note: 'Numbers from Tables 1–2 of the paper, in %.'
    },
    mdsam: {
      links: [['Paper', 'https://arxiv.org/abs/2408.04326'], ['ACM DL', 'https://dl.acm.org/doi/10.1145/3664647.3680650'], ['Code', 'https://github.com/BellyBeauty/MDSAM']],
      metrics: [{ name: 'max F', up: true }, { name: 'Sα', up: true }, { name: 'mEφ', up: true }, { name: 'MAE', up: false }],
      rows: [
        { name: 'DUTS-TE', vs: ['TE7 / DC-Net-S', 'DC-Net-S', 'TE7 / ICON-S', 'TE7 / DC-Net-S'], ours: ['0.937', '0.920', '0.949', '0.024'], best: ['0.932', '0.925', '0.954', '0.023'] },
        { name: 'DUT-OMRON', vs: ['DC-Net-S', 'DC-Net-S', 'ICON-S', 'DC-Net-S'], ours: ['0.887', '0.878', '0.910', '0.039'], best: ['0.868', '0.875', '0.900', '0.039'] },
        { name: 'HKU-IS', vs: ['DC-Net-S', 'DC-Net-S', 'BBRF', 'BBRF'], ours: ['0.963', '0.941', '0.969', '0.019'], best: ['0.957', '0.941', '0.969', '0.020'] },
        { name: 'ECSSD', vs: ['DC-Net-S / SAM', 'DC-Net-S', 'BBRF', 'MENet'], ours: ['0.974', '0.948', '0.967', '0.021'], best: ['0.968', '0.947', '0.969', '0.021'] },
        { name: 'PASCAL-S', vs: ['TE7', 'DC-Net-S', 'TE7', 'TE7'], ours: ['0.907', '0.882', '0.917', '0.052'], best: ['0.906', '0.887', '0.928', '0.047'] }
      ],
      kpis: [
        { from: ['DUT-OMRON', 'max F'], short: 'on DUT-OMRON', label: 'on DUT-OMRON over DC-Net-S' },
        { v: 5, unit: '/ 5', label: 'benchmarks where MDSAM has the best max F-measure' },
        { from: ['HKU-IS', 'MAE'], label: 'on HKU-IS over BBRF' }
      ],
      note: 'Numbers from Tables 1–2 of the paper, for MDSAM at 512×512 input.'
    }
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const dlg = document.getElementById('sheet');
  const sheetCard = dlg.querySelector('.sheet-card'), body = dlg.querySelector('.sheet-scroll');
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const decimals = s => (String(s).split('.')[1] || '').length;
  const signed = (v, dec) => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(dec);

  // Ours minus the baseline, in display units. Scores gain in points (x100 when the paper
  // reports them on a 0–1 scale); errors such as MAE show their relative reduction.
  function gain(m, ours, best) {
    const o = +ours, b = +best;
    if (!m.up) return { v: (b - o) / b * 100, dec: 1, unit: '%', better: o < b };
    const k = o <= 1 && b <= 1 ? 100 : 1;
    return { v: (o - b) * k, dec: Math.max(1, decimals(ours) - (k === 100 ? 2 : 0)), unit: '', better: o > b };
  }
  const vsOf = (r, i) => Array.isArray(r.vs) ? r.vs[i] : r.vs;
  const unitNote = (p, m) => p.metricNote || (m.up
    ? `${m.name}: ours minus the strongest other method${+p.rows[0].ours[p.metrics.indexOf(m)] <= 1 ? ', in points (×100)' : ', in points'}. Higher is better.`
    : `${m.name}: how much lower our error is than the strongest other method’s, relative to it. Lower is better.`);

  // anywhere: keep counting while the sheet is closed (the cards' own figures)
  function countTo(node, from, to, dec, fmt, delay = 0, dur = 1300, anywhere = false) {
    if (reduce) { node.textContent = fmt(to, dec); return; }
    const t0 = performance.now() + delay;
    node.textContent = fmt(from, dec);
    const f = now => {
      const t = clamp((now - t0) / dur), e = 1 - (1 - t) ** 4;
      node.textContent = fmt(from + (to - from) * e, dec);
      if (t < 1 && (anywhere || dlg.open)) requestAnimationFrame(f);
      else if (t < 1) node.textContent = fmt(to, dec);
    };
    requestAnimationFrame(f);
  }

  const fmtNum = (x, d) => d ? x.toFixed(d) : Math.round(x).toLocaleString('en-US');
  // A headline number as <b>: sign, a span that counts up, a symbol unit (%, ×, +) right
  // against it, and a word unit set small after it. b.count() runs the count-up.
  function figure(p, k, delay) {
    let v = k.v, dec = k.dec ?? 0, pre = k.pre ?? '', unit = k.unit ?? '', sym = '';
    if (/^[%×+]$/.test(unit)) { sym = unit; unit = ''; }
    if (k.from) {
      const r = p.rows.find(r => r.name === k.from[0]), mi = p.metrics.findIndex(m => m.name === k.from[1]), m = p.metrics[mi];
      const g = gain(m, r.ours[mi], r.best[mi]);
      v = Math.abs(g.v); dec = g.dec; unit = m.name;
      if (m.up) pre = g.v >= 0 ? '+' : '−'; else { pre = '−'; sym = '%'; }
    }
    const b = el('b'), num = el('span', null, fmtNum(reduce ? v : 0, dec));
    b.append(pre, num, sym);
    if (unit) b.append(el('small', null, unit));
    b.count = () => countTo(num, 0, v, dec, fmtNum, delay, 1300, true);
    return b;
  }

  function kpis(p) {
    const wrap = el('div', 'kpis');
    p.kpis.forEach((k, i) => {
      const tile = el('div', 'kpi'), b = figure(p, k, 120 * i);
      tile.style.setProperty('--d', (.15 + i * .12) + 's');
      tile.append(b, el('span', null, k.label));
      wrap.append(tile);
      tile.count = b.count;
    });
    return wrap;
  }

  // Gain bars for one metric at a time; the tabs switch the metric in place so the bars
  // glide to their new lengths instead of redrawing.
  function gains(p) {
    const wrap = el('div'), tabs = el('div', 'sh-tabs'), list = el('div', 'gains'), unit = el('p', 'g-unit');
    tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Metric');
    const lens = el('span', 'lens'); lens.setAttribute('aria-hidden', 'true'); tabs.append(lens);
    const rows = p.rows.map((r, i) => {
      const row = el('div', 'g-row'), name = el('div', 'g-name', r.name), raw = el('small');
      const track = el('div', 'g-track'), zero = el('i', 'g-zero'), bar = el('b', 'g-bar'), val = el('div', 'g-val');
      bar.style.setProperty('--d', (.25 + i * .09) + 's');
      name.append(raw); track.append(zero, bar); row.append(name, track, val); list.append(row);
      return { r, raw, track, bar, val, last: 0 };
    });
    const show = (mi, first) => {
      const m = p.metrics[mi];
      [...tabs.querySelectorAll('button')].forEach((b, i) => b.setAttribute('aria-pressed', i === mi));
      if (window.lensTo) lensTo(lens, tabs.querySelectorAll('button')[mi], first);
      const gs = rows.map(x => gain(m, x.r.ours[mi], x.r.best[mi]));
      const lo = Math.min(0, ...gs.map(g => g.v)) * 1.08, hi = Math.max(0, ...gs.map(g => g.v)) * 1.08 || 1, span = hi - lo, z = -lo / span;
      rows.forEach((x, i) => {
        const g = gs[i], w = Math.abs(g.v) / span;
        x.track.style.setProperty('--z', z * 100 + '%');
        x.bar.style.setProperty('--x', (g.v >= 0 ? z : z - w) * 100 + '%');
        x.bar.style.setProperty('--w', w * 100 + '%');
        x.bar.classList.toggle('neg', !g.better);
        x.val.classList.toggle('neg', !g.better);
        x.raw.textContent = `${x.r.sub ? x.r.sub + ' · ' : ''}${x.r.ours[mi]} vs ${x.r.best[mi]}`;
        x.track.title = `${x.r.name} · ${m.name}: ours ${x.r.ours[mi]}, ${vsOf(x.r, mi)} ${x.r.best[mi]}`;
        // scores read "+2.1"; errors read "−16.0%" since lower is better; a draw reads "tie"
        const shown = m.up ? g.v : -g.v;
        if (+x.r.ours[mi] === +x.r.best[mi]) { x.val.textContent = 'tie'; x.last = 0; return; }
        countTo(x.val, first ? 0 : x.last, shown, g.dec, (v, d) => signed(v, d) + (m.up ? '' : '%'), first ? 350 + i * 90 : 0, first ? 1300 : 500);
        x.last = shown;
      });
      unit.textContent = unitNote(p, m);
    };
    p.metrics.forEach((m, i) => {
      const b = el('button', null, `${m.name} ${m.up ? '↑' : '↓'}`);
      b.type = 'button';
      b.addEventListener('click', () => show(i));
      tabs.append(b);
    });
    wrap.append(...(p.metrics.length > 1 ? [tabs] : []), list, unit);
    wrap.start = () => show(p.lead ?? 0, true);
    return wrap;
  }

  function table(p) {
    const wrap = el('div', 'sh-tablewrap'), t = el('table', 'sh-table'), head = el('tr'), tb = el('tbody');
    head.append(el('th', null, p.rowLabel || 'Dataset'));
    p.metrics.forEach(m => head.append(el('th', null, `${m.name} ${m.up ? '↑' : '↓'}`)));
    const th = el('thead'); th.append(head);
    p.rows.forEach(r => {
      const tr = el('tr'), ds = el('td', 'ds', r.name);
      ds.append(el('small', null, Array.isArray(r.vs) ? 'vs best per metric' : 'vs ' + r.vs));
      tr.append(ds);
      p.metrics.forEach((m, i) => {
        const td = el('td');
        td.append(el('b', null, r.ours[i]), el('span', null, r.best[i]));
        if (Array.isArray(r.vs)) td.append(el('em', null, r.vs[i]));
        tr.append(td);
      });
      tb.append(tr);
    });
    t.append(th, tb); wrap.append(t);
    return wrap;
  }

  function fill(id, card) {
    const p = PAPERS[id];
    body.replaceChildren();
    body.append(card.querySelector('.badges').cloneNode(true));
    const h = el('h2', null, card.querySelector('h3').textContent); h.id = 'sheet-title';
    body.append(h, card.querySelector('.authors').cloneNode(true));
    const links = el('div', 'links');
    p.links.forEach(([label, href], i) => {
      const a = el('a', i ? null : 'go', label);
      a.href = href; a.target = '_blank'; a.rel = 'noopener';
      links.append(a);
    });
    body.append(links);
    const parts = [];
    if (p.kpis?.length) { const k = kpis(p); body.append(el('div', 'sh-label', 'Highlights'), k); parts.push(() => [...k.children].forEach(t => t.count())); }
    if (p.rows?.length) {
      const g = gains(p);
      body.append(el('div', 'sh-label', p.gainTitle || 'Gain over the strongest baseline'), g, el('div', 'sh-label', 'All numbers · ours, then the baseline'), table(p));
      parts.push(() => g.start());
    }
    if (p.note) body.append(el('p', 'sh-note', p.note));
    return () => parts.forEach(f => f());
  }

  let openId = null, hadCursor = false, closing = 0;
  function open(id, from, instant) {
    const card = document.querySelector(`.card[data-paper="${id}"]`);
    if (!PAPERS[id] || !card) return;
    clearTimeout(closing);
    const start = fill(id, card);
    openId = id;
    hadCursor = root.classList.contains('has-cursor') || hadCursor;
    root.classList.remove('has-cursor');            // the ring cursor sits under the top layer
    root.classList.add('sheet-open');
    dlg.classList.remove('in', 'go');
    if (!dlg.open) dlg.showModal();
    body.scrollTop = 0;
    // grow out of the card that was clicked
    const d = dlg.getBoundingClientRect(), f = (from || card).getBoundingClientRect();
    sheetCard.style.setProperty('--ox', f.left + f.width / 2 - d.left + 'px');
    sheetCard.style.setProperty('--oy', f.top + f.height / 2 - d.top + 'px');
    if (instant) sheetCard.style.transition = 'none';
    sheetCard.offsetWidth;
    dlg.classList.add('in');
    if (instant) { sheetCard.offsetWidth; sheetCard.style.transition = ''; }
    setTimeout(() => { dlg.classList.add('go'); start(); }, reduce || instant ? 0 : 260);
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  }
  function close() {
    if (!dlg.open) return;
    dlg.classList.remove('in', 'go');
    if (location.hash === '#' + openId) history.replaceState(null, '', location.pathname + location.search);
    openId = null;
    closing = setTimeout(() => {
      dlg.close();
      root.classList.remove('sheet-open');
      if (hadCursor) root.classList.add('has-cursor');
      hadCursor = false;
    }, reduce ? 0 : 320);
  }

  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  dlg.querySelector('.sheet-x').addEventListener('click', close);

  // The whole card opens the sheet; its own links (paper, code) still go where they point.
  // Each card also shows its paper's first headline number, counting up when it comes into view.
  const seen = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { seen.unobserve(e.target); setTimeout(() => e.target.firstChild.count(), 350); }
  }), { threshold: 0.6 });
  document.querySelectorAll('.card[data-paper]').forEach(card => {
    const p = PAPERS[card.dataset.paper];
    if (!p) { card.removeAttribute('data-paper'); card.querySelector('.links a.res')?.remove(); return; }
    const k = p.kpis?.[0], viz = card.querySelector('.viz');
    if (!k || !viz) return;
    const tag = el('div', 'pstat');
    tag.append(figure(p, k, 0), el('span', null, k.short || k.label));
    viz.append(tag);
    seen.observe(tag);
  });
  document.addEventListener('click', e => {
    const card = e.target.closest('.card[data-paper]');
    if (!card || dlg.contains(card)) return;
    const a = e.target.closest('a');
    if (a && !a.classList.contains('res')) return;
    if (!a && getSelection().toString()) return;      // selecting text, not clicking
    e.preventDefault();
    open(card.dataset.paper, card);
  });

  // Deep links: tianyu-yan.vip/#dualsam opens that paper.
  const fromHash = () => { const id = location.hash.slice(1); if (PAPERS[id]) open(id, null, true); };
  addEventListener('hashchange', fromHash);
  if (PAPERS[location.hash.slice(1)]) addEventListener('load', fromHash, { once: true });
})();
