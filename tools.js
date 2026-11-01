(() => {
  "use strict";
  if (window.SiteTools) return;

  const KEY = "cpex_tools_v1";
  const SITE_URL = "https://masumcpex.bro.bd";
  const LIBS = {
    pdf: "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",
    qr: "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js",
    qrAlt: "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js",
    quill: "https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js",
    quillCss: "https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css"
  };

  let C = null;
  const ic = (name, size = 16, sw = 2) => C.icon(name, size, sw);

  const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const f2 = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const br = (s) => esc(s).replace(/\n/g, "<br>");
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const safeName = (s) => String(s).replace(/[\\/:*?"<>|]/g, "").trim() || "document";
  const q1 = (root, sel) => root.querySelector(sel);
  const today = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  const loaded = {};
  const loadScript = (url) => loaded[url] || (loaded[url] = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.onload = resolve;
    s.onerror = () => { delete loaded[url]; s.remove(); reject(new Error(url)); };
    document.head.appendChild(s);
  }));
  const loadCss = (url) => {
    if (document.querySelector(`link[href="${url}"]`)) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = url;
    document.head.appendChild(l);
  };

  const DEF = { co: "আপনার কোম্পানির নাম", addr: "", phone: "", email: "", cur: "RM", acc: "#0f6b5c" };
  const normalize = (sv) => {
    const set = Object.assign({}, DEF);
    Object.keys(DEF).forEach((k) => { if (sv && sv.set && typeof sv.set[k] === "string") set[k] = sv.set[k]; });
    if (!/^#[0-9a-f]{6}$/i.test(set.acc)) set.acc = DEF.acc;
    return {
      set,
      docs: sv && Array.isArray(sv.docs) ? sv.docs.filter((x) => x && x.t && x.d) : [],
      drafts: sv && sv.drafts && typeof sv.drafts === "object" ? sv.drafts : {}
    };
  };
  let D = normalize(null);
  try { D = normalize(JSON.parse(localStorage.getItem(KEY) || "null")); } catch (e) { D = normalize(null); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { return; } };
  const money = (n) => `${esc(D.set.cur)} ${f2(n)}`;

  const toast = (m) => {
    let t = document.getElementById("dtToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "dtToast";
      t.setAttribute("role", "status");
      t.setAttribute("aria-live", "polite");
      document.body.appendChild(t);
    }
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 2600);
  };

  const CSS = `
.dt{color:var(--color-text);font-size:.95rem}
.dt *{box-sizing:border-box}
.dt-tabs{display:none;gap:8px;margin-bottom:var(--space-2)}
.dt-tabs .dt-btn{flex:1;justify-content:center}
.dt-tw{display:grid;grid-template-columns:minmax(320px,420px) minmax(0,1fr);gap:var(--space-3);align-items:start}
.dt-tw.eq{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.dt-fp{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-2);box-shadow:var(--shadow-card);min-width:0}
.dt-pv{position:sticky;top:84px;min-width:0;overflow:auto;max-height:calc(100vh - 104px);background:var(--color-bg-soft);border-radius:var(--radius-md);padding:12px}
.dt-wrap{margin:0 auto;position:relative}
.dt-tb{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:var(--space-2)}
.dt-btn{display:inline-flex;align-items:center;gap:.45rem;padding:.5rem 1rem;border-radius:var(--radius-full);border:1px solid var(--color-accent-border);background:#fff;color:var(--color-accent);font:inherit;font-size:.86rem;font-weight:600;cursor:pointer;line-height:1.3;transition:background .15s,border-color .15s}
.dt-btn:hover{background:var(--color-accent-soft)}
.dt-btn.p{background:var(--color-accent);border-color:var(--color-accent);color:#fff}
.dt-btn.p:hover{background:var(--color-accent-hover)}
.dt-btn.d{color:var(--color-error);border-color:#FECACA}
.dt-btn.d:hover{background:#FEF2F2}
.dt-btn:disabled{opacity:.6;cursor:wait}
.dt-btn.sm{padding:.3rem .7rem;font-size:.8rem}
.dt-h{font-family:var(--font-display);font-size:1.05rem;margin:var(--space-2) 0 .6rem}
.dt-f{margin-bottom:.8rem}
.dt-f label{display:block;font-size:.76rem;font-weight:600;color:var(--color-muted);margin-bottom:.3rem}
.dt-f input,.dt-f select,.dt-f textarea,.dt-it input,.dt-title{width:100%;padding:.6rem .75rem;border:1px solid var(--color-border);border-radius:10px;background:#fff;font:inherit;color:var(--color-text);transition:border-color .15s,box-shadow .15s}
.dt-f input:focus,.dt-f select:focus,.dt-f textarea:focus,.dt-it input:focus,.dt-title:focus{outline:none;border-color:var(--color-accent);box-shadow:0 0 0 3px var(--color-accent-soft)}
.dt-f textarea{min-height:80px;resize:vertical}
.dt-f input[type=color]{height:42px;padding:3px;cursor:pointer}
.dt-f input[type=checkbox]{width:auto;margin-right:6px}
.dt-sc{overflow-x:auto}
.dt-it{width:100%;border-collapse:collapse;margin-bottom:.6rem}
.dt-it td{padding:2px}
.dt-it th{font-size:.72rem;color:var(--color-muted);text-align:left;padding:3px;font-weight:600}
.dt-x{border:0;background:none;color:var(--color-error);cursor:pointer;font-size:1.25rem;line-height:1;padding:0 6px}
.dt-g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.dt-sub{color:var(--color-muted);font-size:.85rem;margin:0 0 .8rem}
.dt-panel{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-2);box-shadow:var(--shadow-card)}
.dt-panels{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--space-3);align-items:start}
.dt-list{width:100%;border-collapse:collapse}
.dt-list th,.dt-list td{padding:.7rem .5rem;border-bottom:1px solid var(--color-border);text-align:left;font-size:.9rem}
.dt-list th{font-size:.75rem;color:var(--color-muted);font-weight:600}
.dt-empty{color:var(--color-muted);padding:var(--space-2) 0}
.dt-sw{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.dt-sw button{width:30px;height:30px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px var(--color-border);cursor:pointer}
.dt-sw button.on{box-shadow:0 0 0 2px var(--color-accent)}
.dt-thumbs{display:flex;gap:10px;flex-wrap:wrap;margin:.8rem 0}
.dt-thumb{position:relative}
.dt-thumb img{height:92px;border-radius:8px;border:1px solid var(--color-border);display:block}
.dt-thumb .dt-x{position:absolute;top:-8px;right:-6px;background:#fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.2);width:22px;height:22px;padding:0}
.dt-thumb .dt-mv{position:absolute;bottom:4px;left:4px;display:flex;gap:2px}
.dt-thumb .dt-mv button{border:0;background:rgba(255,255,255,.92);border-radius:4px;width:20px;height:20px;cursor:pointer;font-size:.7rem;padding:0}
.dt-qw{display:grid;grid-template-columns:minmax(320px,440px) minmax(0,1fr);gap:var(--space-3);align-items:start}
.dt-qp{text-align:center;position:sticky;top:84px}
.dt-qp canvas{width:min(100%,360px);height:auto;border:1px solid var(--color-border);border-radius:10px;background:#fff}
.dt-status{display:flex;justify-content:space-between;font-size:.78rem;color:var(--color-muted);padding:8px 4px 0}
.dt-ed-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:var(--space-2)}
.dt-ed-bar .dt-title{flex:1;min-width:150px;font-weight:600}
.dt-ed-bar select{width:auto;padding:.5rem .7rem;border:1px solid var(--color-border);border-radius:10px;background:#fff;font:inherit}
.dt-ed-bar .dt-btn.on{background:var(--color-accent-soft)}
.dt-ed-card{background:#fff;border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;box-shadow:var(--shadow-card)}
.dt-ed-card .ql-toolbar.ql-snow{border:0;border-bottom:1px solid var(--color-border);background:#F8FAFC}
.dt-ed-card .ql-container.ql-snow{border:0;height:min(58vh,520px);overflow:auto;font-family:var(--ed-font)}
.dt-ed-card .ql-editor{font-family:var(--ed-font);font-size:16px;line-height:1.8;min-height:240px}
.dt-load{padding:var(--space-3) 0;color:var(--color-muted)}
#dtToast{position:fixed;left:50%;bottom:22px;transform:translate(-50%,20px);background:#1E293B;color:#fff;padding:10px 18px;border-radius:10px;font-size:.88rem;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:300;max-width:90vw}
#dtToast.show{opacity:1;transform:translate(-50%,0)}
.dp-paper{width:794px;min-height:1120px;background:#fff;color:#111;padding:46px 52px;font-family:var(--font-body);font-size:13.5px;line-height:1.6;box-shadow:0 2px 14px rgba(20,30,50,.18);position:absolute;left:0;top:0;transform-origin:top left}
.dp-paper *{box-sizing:border-box}
.dp-paper p{margin:0 0 .7em}
.dp-paper h1,.dp-paper h2{font-family:inherit;color:inherit;line-height:1.3}
.dp-pdf .dp-paper{position:static;box-shadow:none;transform:none}
.dp-paper .dh{display:flex;justify-content:space-between;gap:20px;border-bottom:3px solid var(--acc);padding-bottom:12px;margin-bottom:18px}
.dp-paper .cn{font-size:20px;font-weight:700;color:var(--acc)}
.dp-paper .ca{color:#555;font-size:12px}
.dp-paper .dtl{font-size:24px;font-weight:700;letter-spacing:1px;color:#222;text-align:right}
.dp-paper .mt{border-collapse:collapse}
.dp-paper .mt td{padding:1px 8px 1px 0}
.dp-paper .pt{margin:14px 0}
.dp-paper .pt small{display:block;color:#777}
.dp-paper .dtb{width:100%;border-collapse:collapse;margin:14px 0}
.dp-paper .dtb th{background:var(--acc);color:#fff;padding:7px;text-align:left;font-size:12.5px}
.dp-paper .dtb td{padding:7px;border-bottom:1px solid #ddd}
.dp-paper .dtb .r{text-align:right}
.dp-paper .tt{margin-left:auto;min-width:270px;border-collapse:collapse}
.dp-paper .tt td{padding:4px 8px;text-align:right}
.dp-paper .tt td:first-child{text-align:left}
.dp-paper .tt .g td{font-weight:700;font-size:15px;border-top:2px solid #222}
.dp-paper .sg{display:flex;justify-content:space-between;margin-top:70px}
.dp-paper .sg div{border-top:1px solid #222;padding-top:5px;min-width:170px;text-align:center}
.dp-paper .ctr{text-align:center}
.dp-paper .cert{border:8px double var(--acc);padding:50px 30px;text-align:center;min-height:900px}
.dp-paper .cert h1{font-size:40px;color:var(--acc);letter-spacing:3px;margin:0}
.dp-paper .cert .nm{font-size:34px;font-weight:700;margin:18px 0;border-bottom:1px solid #999;display:inline-block;padding:0 30px}
.dp-paper .sec{font-weight:700;color:var(--acc);border-bottom:1px solid #ddd;margin:16px 0 6px;text-transform:uppercase;font-size:13px}
.dp-doc-paper{width:var(--pw);min-height:var(--ph);padding:var(--m);background:#fff;box-shadow:0 2px 14px rgba(20,30,50,.18);position:absolute;left:0;top:0;transform-origin:top left}
.dp-pdf .dp-doc-paper{position:static;box-shadow:none;transform:none}
.dp-doc{font-family:var(--ed-font);font-size:var(--ed-size);line-height:1.85;color:#111;text-align:justify;overflow-wrap:anywhere}
.dp-doc p,.dp-doc ul,.dp-doc ol,.dp-doc h1,.dp-doc h2,.dp-doc h3{margin:0 0 .7em}
.dp-doc h1{font-size:1.7em;line-height:1.4;text-align:center;font-family:inherit}
.dp-doc h2{font-size:1.4em;line-height:1.4;font-family:inherit}
.dp-doc h3{font-size:1.2em;line-height:1.4;font-family:inherit}
.dp-doc ul,.dp-doc ol{padding-left:1.7em}
.dp-doc ul{list-style:disc}
.dp-doc ol{list-style:decimal}
.dp-doc li{margin:0 0 .25em}
.dp-doc .ql-align-center{text-align:center}
.dp-doc .ql-align-right{text-align:right}
.dp-doc .ql-align-justify{text-align:justify}
.dp-doc .ql-indent-1{padding-left:3em}
.dp-doc .ql-indent-2{padding-left:6em}
.dp-doc .ql-indent-3{padding-left:9em}
.dp-doc p,.dp-doc li,.dp-doc h1,.dp-doc h2,.dp-doc h3{break-inside:avoid}
.dp-empty{color:#9aa3af;text-align:center;margin-top:30mm}
@media(max-width:900px){
  .dt-tabs{display:flex}
  .dt-tw,.dt-tw.eq{grid-template-columns:1fr}
  .dt-tw[data-v=f] .dt-pv,.dt-tw[data-v=p] .dt-fp,.dt-tw[data-v=p] .dt-ed-pane{display:none}
  .dt-pv{position:static;max-height:none}
  .dt-qw{grid-template-columns:1fr}
  .dt-qp{position:static}
}
@media print{
  body.dt-printing>*:not(#dtPrint){display:none!important}
  body.dt-printing{background:#fff}
  #dtPrint .dp-paper,#dtPrint .dp-doc-paper{position:static;transform:none;box-shadow:none;width:100%;min-height:0}
}`;

  const injectCss = () => {
    if (document.getElementById("dtStyles")) return;
    const st = document.createElement("style");
    st.id = "dtStyles";
    st.textContent = CSS;
    document.head.appendChild(st);
  };

  const accent = () => D.set.acc;

  const printHTML = (html, pageSize, title) => {
    const old = document.getElementById("dtPrint");
    if (old) old.remove();
    const host = document.createElement("div");
    host.id = "dtPrint";
    host.innerHTML = html;
    const st = document.createElement("style");
    st.textContent = `@page{size:${pageSize};margin:0}`;
    document.head.appendChild(st);
    document.body.appendChild(host);
    document.body.classList.add("dt-printing");
    const prev = document.title;
    if (title) document.title = title;
    const cleanup = () => {
      host.remove();
      st.remove();
      document.body.classList.remove("dt-printing");
      document.title = prev;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setTimeout(() => window.print(), 60);
  };

  const exportPdf = (o) => {
    const btn = o.btn;
    const label = btn ? btn.innerHTML : "";
    if (btn) { btn.disabled = true; btn.textContent = "তৈরি হচ্ছে..."; }
    const finish = () => { if (btn) { btn.disabled = false; btn.innerHTML = label; } };
    return loadScript(LIBS.pdf)
      .then(() => (document.fonts && document.fonts.ready) || null)
      .then(() => {
        const holder = document.createElement("div");
        holder.style.cssText = "position:fixed;left:-99999px;top:0";
        const inner = document.createElement("div");
        inner.className = `dp-pdf ${o.cls || ""}`;
        inner.style.cssText = `width:${o.width};background:#fff;${o.style || ""}`;
        inner.innerHTML = o.html;
        holder.appendChild(inner);
        document.body.appendChild(holder);
        return window.html2pdf().set({
          margin: o.margin || 0,
          filename: o.name,
          image: { type: "jpeg", quality: 0.97 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#fff" },
          jsPDF: { unit: "mm", format: o.format || "a4", orientation: o.orient || "portrait" },
          pagebreak: o.pagebreak || { mode: ["css"], avoid: "tr" }
        }).from(inner).save()
          .then(() => toast("PDF ডাউনলোড হয়েছে।"))
          .finally(() => holder.remove());
      })
      .catch(() => toast("PDF তৈরি করা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।"))
      .then(finish);
  };

  const parseField = (s) => {
    const p = s.split("|");
    const t = p[2] || "text";
    const x = { k: p[0], l: p[1], t, d: p[3] !== undefined ? p[3] : "" };
    if (t === "select") { x.opts = x.d.split(","); x.d = x.opts[0]; }
    if (t === "date" && p[3] === undefined) x.d = today();
    return x;
  };

  const fieldHTML = (x, v, attr) => {
    const a = attr || `data-k="${x.k}"`;
    let inp;
    if (x.t === "area") inp = `<textarea ${a}>${esc(v)}</textarea>`;
    else if (x.t === "select") inp = `<select ${a}>${x.opts.map((o) => `<option${o === v ? " selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    else inp = `<input type="${x.t}" ${a} value="${esc(v)}"${x.t === "number" ? ' step="any" inputmode="decimal"' : ""}>`;
    return `<div class="dt-f"><label>${esc(x.l)}</label>${inp}</div>`;
  };

  /* ---------- ডকুমেন্ট কাঠামো ---------- */
  const U = {
    meta: (a) => `<table class="mt">${a.filter((x) => x[1]).map((x) => `<tr><td>${x[0]}</td><td>: ${esc(x[1])}</td></tr>`).join("")}</table>`,
    party: (l, n, a) => `<div class="pt"><small>${l}</small><b>${esc(n)}</b><div>${br(a)}</div></div>`,
    sub: (d) => d.items.reduce((s, r) => s + num(r.q) * num(r.r), 0),
    table: (t, d) => {
      const amt = t.I.some((c) => c.k === "r");
      let h = `<table class="dtb"><tr><th>#</th>${t.I.map((c) => `<th class="${c.t === "number" ? "r" : ""}">${c.l}</th>`).join("")}${amt ? '<th class="r">মোট</th>' : ""}</tr>`;
      d.items.forEach((r, i) => {
        h += `<tr><td>${i + 1}</td>${t.I.map((c) => `<td class="${c.t === "number" ? "r" : ""}">${c.k === "r" ? f2(num(r.r)) : esc(r[c.k])}</td>`).join("")}${amt ? `<td class="r">${f2(num(r.q) * num(r.r))}</td>` : ""}</tr>`;
      });
      return `${h}</table>`;
    },
    tot: (d) => {
      const s = U.sub(d), ds = num(d.f.disc), tx = (s - ds) * num(d.f.tax) / 100;
      return `<table class="tt"><tr><td>সাবটোটাল</td><td>${money(s)}</td></tr>${ds ? `<tr><td>ছাড়</td><td>- ${money(ds)}</td></tr>` : ""}${tx ? `<tr><td>ট্যাক্স (${esc(d.f.tax)}%)</td><td>${money(tx)}</td></tr>` : ""}<tr class="g"><td>সর্বমোট</td><td>${money(s - ds + tx)}</td></tr></table>`;
    },
    note: (n) => (n ? `<p style="margin-top:20px"><b>নোট:</b> ${br(n)}</p>` : ""),
    sign: (a) => `<div class="sg">${a.map((x) => `<div>${x}</div>`).join("")}</div>`,
    kv: (a) => `<table class="dtb">${a.map((x) => `<tr><td style="width:36%;color:#555">${x[0]}</td><td><b>${x[1]}</b></td></tr>`).join("")}</table>`,
    sec: (l, v) => (v ? `<div class="sec">${l}</div><div>${br(v)}</div>` : "")
  };

  const BILLF = ["date|তারিখ|date", "to|ক্লায়েন্টের নাম", "addr|ঠিকানা|area", "disc|ছাড় (টাকা)|number|0", "tax|ট্যাক্স %|number|0", "note|নোট|area"];
  const bill = (t, pre, lab) => ({
    t, f: [`no|${lab} নং|text|${pre}-001`].concat(BILLF), it: ["d|বিবরণ|text", "q|পরিমাণ|number", "r|দর|number"],
    b: (d, T) => { const f = d.f; return U.meta([[`${lab} নং`, f.no], ["তারিখ", f.date]]) + U.party("প্রাপক", f.to, f.addr) + U.table(T, d) + U.tot(d) + U.note(f.note) + U.sign(["গ্রহীতার স্বাক্ষর", "অনুমোদনকারী"]); }
  });

  const DOCS = {
    invoice: bill("INVOICE", "INV", "ইনভয়েস"),
    quote: bill("QUOTATION", "QT", "কোটেশন"),
    receipt: {
      t: "MONEY RECEIPT",
      f: ["no|রিসিপ্ট নং|text|MR-001", "date|তারিখ|date", "from|যার কাছ থেকে প্রাপ্ত", "amt|টাকার পরিমাণ|number", "for|বাবদ|area", "pm|পেমেন্ট মাধ্যম|select|নগদ,ব্যাংক,বিকাশ,নগদ (Nagad),চেক"],
      b: (d) => { const f = d.f; return U.meta([["রিসিপ্ট নং", f.no], ["তারিখ", f.date]]) + U.kv([["প্রাপ্তির উৎস", esc(f.from)], ["পরিমাণ", money(num(f.amt))], ["বাবদ", br(f.for)], ["মাধ্যম", esc(f.pm)]]) + U.sign(["প্রদানকারী", "গ্রহীতা"]); }
    },
    payslip: {
      t: "PAY SLIP",
      f: ["emp|কর্মচারীর নাম", "eid|আইডি", "desg|পদবি", "month|মাস", "basic|মূল বেতন|number", "allow|ভাতা|number|0", "ded|কর্তন|number|0"],
      b: (d) => { const f = d.f; return U.kv([["নাম", esc(f.emp)], ["আইডি", esc(f.eid)], ["পদবি", esc(f.desg)], ["মাস", esc(f.month)], ["মূল বেতন", money(num(f.basic))], ["ভাতা", money(num(f.allow))], ["কর্তন", `- ${money(num(f.ded))}`], ["নেট বেতন", money(num(f.basic) + num(f.allow) - num(f.ded))]]) + U.sign(["কর্মচারী", "কর্তৃপক্ষ"]); }
    },
    letter: {
      t: "",
      f: ["date|তারিখ|date", "to|প্রাপকের পদবি ও ঠিকানা|area", "sub|বিষয়", "body|চিঠির বিষয়বস্তু|area", "from|প্রেরকের নাম ও পরিচয়|area"],
      b: (d) => { const f = d.f; return `<p>তারিখ: ${esc(f.date)}</p><p>বরাবর,<br>${br(f.to)}</p><p><b>বিষয়: ${esc(f.sub)}</b></p><p>জনাব/মহোদয়,</p><p>${br(f.body)}</p><p style="margin-top:30px">বিনীত নিবেদক,<br>${br(f.from)}</p>`; }
    },
    cert: {
      t: "", h: 0,
      f: ["title|সনদের শিরোনাম|text|Certificate of Achievement", "name|প্রাপকের নাম", "course|কী কারণে|area", "date|তারিখ|date", "by|প্রদানকারী"],
      b: (d) => { const f = d.f; return `<div class="cert"><div class="cn">${esc(D.set.co)}</div><h1 style="margin-top:60px">${esc(f.title)}</h1><p>এই সনদ প্রদান করা হলো</p><div class="nm">${esc(f.name)}</div><p>${br(f.course)}</p><p style="margin-top:50px">তারিখ: ${esc(f.date)}</p>${U.sign(["", `<b>${esc(f.by)}</b>`])}</div>`; }
    },
    cv: {
      t: "", h: 0,
      f: ["name|নাম", "role|পদ / পেশা", "phone|ফোন", "email|ইমেইল", "addr|ঠিকানা", "sum|সংক্ষিপ্ত পরিচিতি|area", "exp|অভিজ্ঞতা|area", "edu|শিক্ষা|area", "skill|দক্ষতা|area", "lang|ভাষা|area"],
      b: (d) => { const f = d.f; return `<h1 style="margin:0;font-size:30px">${esc(f.name)}</h1><div style="color:var(--acc);font-weight:600">${esc(f.role)}</div><div style="color:#555">${[f.phone, f.email, f.addr].filter(Boolean).map(esc).join(" · ")}</div>${U.sec("পরিচিতি", f.sum)}${U.sec("অভিজ্ঞতা", f.exp)}${U.sec("শিক্ষা", f.edu)}${U.sec("দক্ষতা", f.skill)}${U.sec("ভাষা", f.lang)}`; }
    },
    agree: {
      t: "AGREEMENT",
      f: ["title|চুক্তির নাম", "date|তারিখ|date", "p1|প্রথম পক্ষ|area", "p2|দ্বিতীয় পক্ষ|area", "terms|শর্তাবলি (প্রতি লাইনে একটি)|area", "place|স্থান"],
      b: (d) => { const f = d.f; return `<h2 class="ctr" style="font-size:20px">${esc(f.title)}</h2><p>এই চুক্তি ${esc(f.date)} তারিখে ${esc(f.place)}-এ সম্পাদিত হলো।</p>${U.party("প্রথম পক্ষ", "", f.p1)}${U.party("দ্বিতীয় পক্ষ", "", f.p2)}<div class="sec">শর্তাবলি</div><ol>${String(f.terms).split("\n").filter((x) => x.trim()).map((x) => `<li>${esc(x)}</li>`).join("")}</ol>${U.sign(["প্রথম পক্ষ", "দ্বিতীয় পক্ষ", "সাক্ষী"])}`; }
    }
  };
  Object.keys(DOCS).forEach((id) => {
    const T = DOCS[id];
    T.id = id;
    T.F = T.f.map(parseField);
    T.I = (T.it || []).map(parseField);
  });

  const paperHTML = (T, d) => {
    const s = D.set;
    const head = T.h === 0 ? "" : `<div class="dh"><div><div class="cn">${esc(s.co)}</div><div class="ca">${br(s.addr)}<br>${esc(s.phone)} ${esc(s.email)}</div></div><div class="dtl">${esc(T.t)}</div></div>`;
    return `<div class="dp-paper" style="--acc:${accent()}">${head}${T.b(d, T)}</div>`;
  };

  const watchWidth = (stage, fn) => {
    if (!("ResizeObserver" in window)) { window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }
    let last = 0;
    const ro = new ResizeObserver(() => { const w = stage.clientWidth; if (w !== last) { last = w; fn(); } });
    ro.observe(stage);
    return () => ro.disconnect();
  };

  const bindTabs = (el, afterSwitch) => {
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]");
      if (!b) return;
      const tw = q1(el, ".dt-tw");
      tw.dataset.v = b.dataset.tab;
      el.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("p", x === b));
      setTimeout(afterSwitch, 0);
    });
  };

  const TABS = '<div class="dt-tabs"><button class="dt-btn p" data-tab="f" type="button">ফর্ম</button><button class="dt-btn" data-tab="p" type="button">প্রিভিউ</button></div>';

  /* ---------- ডকুমেন্ট টুল ---------- */
  const mountDoc = (el, T) => {
    const fresh = () => { const f = {}; T.F.forEach((x) => { f[x.k] = x.d; }); return { f, items: T.I.length ? [{}] : [] }; };
    let d = fresh();
    if (D.drafts[T.id]) {
      const sv = clone(D.drafts[T.id]);
      d.f = Object.assign(d.f, sv.f || {});
      if (T.I.length && Array.isArray(sv.items) && sv.items.length) d.items = sv.items;
    }
    const commit = () => { D.drafts[T.id] = d; save(); };

    const itemsHTML = () => {
      if (!T.I.length) return "";
      let h = `<h3 class="dt-h">আইটেম</h3><div class="dt-sc"><table class="dt-it"><tr>${T.I.map((c) => `<th>${c.l}</th>`).join("")}<th></th></tr>`;
      d.items.forEach((r, i) => {
        h += `<tr>${T.I.map((c) => `<td><input type="${c.t}"${c.t === "number" ? ' step="any" inputmode="decimal"' : ""} data-i="${i}" data-c="${c.k}" value="${esc(r[c.k])}"></td>`).join("")}<td><button class="dt-x" type="button" data-deli="${i}" aria-label="মুছুন">×</button></td></tr>`;
      });
      return `${h}</table></div><button class="dt-btn sm" type="button" data-addi="1">${ic("plus", 14)} আইটেম যোগ</button>`;
    };

    el.innerHTML = `${TABS}<div class="dt-tw" data-v="f"><div class="dt-fp">
      <div class="dt-tb">
        <button class="dt-btn p" type="button" data-act="pdf">${ic("dl")} PDF</button>
        <button class="dt-btn" type="button" data-act="save">${ic("save")} সংরক্ষণ</button>
        <button class="dt-btn" type="button" data-act="print">${ic("print")} প্রিন্ট</button>
        <button class="dt-btn" type="button" data-act="reset">${ic("reset")} নতুন</button>
      </div>
      <div data-ref="ff">${T.F.map((x) => fieldHTML(x, d.f[x.k] == null ? x.d : d.f[x.k])).join("")}</div>
      <div data-ref="fi">${itemsHTML()}</div>
    </div><div class="dt-pv" data-ref="stage"><div class="dt-wrap" data-ref="wrap"></div></div></div>`;

    const stage = q1(el, '[data-ref="stage"]');
    const wrap = q1(el, '[data-ref="wrap"]');
    const fit = () => {
      const p = wrap.firstChild;
      const avail = stage.clientWidth - 24;
      if (!p || avail <= 0) return;
      const k = Math.min(1, avail / 794);
      p.style.transform = `scale(${k})`;
      wrap.style.width = `${794 * k}px`;
      wrap.style.height = `${p.offsetHeight * k}px`;
    };
    const draw = () => { wrap.innerHTML = paperHTML(T, d); fit(); };
    draw();
    const stop = watchWidth(stage, fit);
    bindTabs(el, fit);

    const docTitle = () => String(d.f.no || d.f.name || d.f.emp || d.f.title || d.f.sub || d.f.to || T.id);
    const toolName = () => ((C.tools.find((t) => t.id === T.id) || {}).title || T.id);

    el.addEventListener("input", (e) => {
      const t = e.target, s = t.dataset;
      if (s.k !== undefined) d.f[s.k] = t.value;
      else if (s.i !== undefined) d.items[+s.i][s.c] = t.value;
      else return;
      commit();
      draw();
    });
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const s = b.dataset;
      const refreshItems = () => { q1(el, '[data-ref="fi"]').innerHTML = itemsHTML(); commit(); draw(); };
      if (s.addi) { d.items.push({}); refreshItems(); return; }
      if (s.deli !== undefined) { d.items.splice(+s.deli, 1); if (!d.items.length) d.items.push({}); refreshItems(); return; }
      if (s.act === "pdf") {
        exportPdf({ html: paperHTML(T, d), width: "794px", name: `${safeName(`${toolName()}-${docTitle()}`)}.pdf`, btn: b });
      } else if (s.act === "print") {
        printHTML(paperHTML(T, d), "A4", safeName(`${toolName()}-${docTitle()}`));
      } else if (s.act === "save") {
        D.docs.push({ id: Date.now(), t: T.id, ti: docTitle(), d: clone(d), ts: new Date().toISOString() });
        save();
        toast("সংরক্ষিত হয়েছে। টুলসের ‘সংরক্ষিত ডকুমেন্ট’-এ দেখতে পাবেন।");
      } else if (s.act === "reset") {
        if (!confirm("ফর্ম খালি করে নতুন করবেন?")) return;
        d = fresh();
        delete D.drafts[T.id];
        save();
        q1(el, '[data-ref="ff"]').innerHTML = T.F.map((x) => fieldHTML(x, d.f[x.k])).join("");
        q1(el, '[data-ref="fi"]').innerHTML = itemsHTML();
        draw();
      }
    });
    return stop;
  };

  /* ---------- সংরক্ষিত ডকুমেন্ট ---------- */
  const mountSaved = (el) => {
    const render = () => {
      const rows = D.docs.slice().reverse().map((x) => {
        const t = C.tools.find((z) => z.id === x.t);
        return `<tr><td>${esc(t ? t.title : x.t)}</td><td>${esc(x.ti)}</td><td>${esc(String(x.ts).slice(0, 10))}</td><td style="text-align:right;white-space:nowrap"><button class="dt-btn sm" type="button" data-open="${x.id}">খুলুন</button> <button class="dt-x" type="button" data-deld="${x.id}" aria-label="মুছুন">×</button></td></tr>`;
      }).join("");
      el.innerHTML = rows
        ? `<div class="dt-panel dt-sc"><table class="dt-list"><tr><th>টুল</th><th>শিরোনাম</th><th>তারিখ</th><th></th></tr>${rows}</table></div>`
        : '<div class="dt-panel"><p class="dt-empty">এখনো কিছু সংরক্ষণ করা হয়নি। যেকোনো ডকুমেন্ট টুল খুলে ‘সংরক্ষণ’ চাপুন।</p></div>';
    };
    render();
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.open) {
        const x = D.docs.find((z) => String(z.id) === b.dataset.open);
        if (x) { D.drafts[x.t] = clone(x.d); save(); location.hash = `#/tools/${x.t}`; }
      } else if (b.dataset.deld) {
        D.docs = D.docs.filter((z) => String(z.id) !== b.dataset.deld);
        save();
        render();
      }
    });
  };

  /* ---------- সেটিং ---------- */
  const mountSettings = (el) => {
    const f = (k, l, t) => `<div class="dt-f"><label>${l}</label><input type="${t || "text"}" data-s="${k}" value="${esc(D.set[k])}"></div>`;
    const swatches = ["#0f6b5c", "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#334155"];
    const sw = () => swatches.map((c) => `<button type="button" style="background:${c}" class="${c === D.set.acc ? "on" : ""}" data-acc="${c}" aria-label="${c}"></button>`).join("");
    const render = () => {
      el.innerHTML = `<div class="dt-panels">
        <div class="dt-panel"><h3 class="dt-h" style="margin-top:0">কোম্পানির তথ্য</h3><p class="dt-sub">এই তথ্য সব ডকুমেন্টের হেডারে বসবে।</p>
          ${f("co", "কোম্পানির নাম")}<div class="dt-f"><label>ঠিকানা</label><textarea data-s="addr">${esc(D.set.addr)}</textarea></div>${f("phone", "ফোন")}${f("email", "ইমেইল", "email")}${f("cur", "মুদ্রা চিহ্ন (RM, ৳, $)")}
        </div>
        <div class="dt-panel"><h3 class="dt-h" style="margin-top:0">ডকুমেন্টের রঙ</h3>
          <div class="dt-sw" data-ref="sw">${sw()}<input type="color" data-s="acc" value="${esc(D.set.acc)}" aria-label="নিজের রঙ" style="width:36px;height:30px;padding:0;border:0;background:none"></div>
          <h3 class="dt-h">ডেটা ব্যাকআপ</h3><p class="dt-sub">সব ডেটা শুধু এই ব্রাউজারে থাকে। নিয়মিত ব্যাকআপ রাখুন।</p>
          <div class="dt-tb"><button class="dt-btn" type="button" data-act="exp">${ic("dl")} ব্যাকআপ নিন</button>
          <label class="dt-btn" style="cursor:pointer">${ic("arrow")} রিস্টোর<input type="file" data-act="imp" accept=".json" hidden></label>
          <button class="dt-btn d" type="button" data-act="wipe">${ic("trash")} সব মুছুন</button></div>
        </div></div>`;
    };
    render();
    el.addEventListener("input", (e) => {
      const k = e.target.dataset.s;
      if (!k) return;
      if (k === "acc" && !/^#[0-9a-f]{6}$/i.test(e.target.value)) return;
      D.set[k] = e.target.value;
      save();
      if (k === "acc") q1(el, '[data-ref="sw"]').querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.acc === D.set.acc));
    });
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.acc) {
        D.set.acc = b.dataset.acc;
        save();
        q1(el, "input[type=color]").value = D.set.acc;
        q1(el, '[data-ref="sw"]').querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      } else if (b.dataset.act === "exp") {
        const url = URL.createObjectURL(new Blob([JSON.stringify(D)], { type: "application/json" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = "cpex-tools-backup.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (b.dataset.act === "wipe") {
        if (!confirm("সব সংরক্ষিত ডকুমেন্ট, খসড়া ও সেটিং মুছে যাবে। নিশ্চিত?")) return;
        D = normalize(null);
        save();
        render();
        toast("সব মুছে ফেলা হয়েছে।");
      }
    });
    el.addEventListener("change", (e) => {
      if (e.target.dataset.act !== "imp" || !e.target.files[0]) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const j = JSON.parse(r.result);
          if (!j || !j.set) throw new Error("bad");
          D = normalize(j);
          save();
          render();
          toast("রিস্টোর হয়েছে।");
        } catch (err) { toast("ফাইলটি সঠিক ব্যাকআপ নয়।"); }
      };
      r.readAsText(e.target.files[0]);
    });
  };

  /* ---------- ছবি থেকে PDF ---------- */
  const mountImg = (el) => {
    const imgs = [];
    el.innerHTML = `<div class="dt-panel"><div class="dt-f"><label>ছবি বাছাই করুন</label><input type="file" data-ref="file" accept="image/*" multiple></div>
      <div class="dt-f" style="max-width:260px"><label>পেজের দিক</label><select data-ref="ori"><option value="portrait">খাড়া (Portrait)</option><option value="landscape">আড়াআড়ি (Landscape)</option></select></div>
      <div class="dt-thumbs" data-ref="list"></div>
      <button class="dt-btn p" type="button" data-act="make">${ic("dl")} PDF বানান</button></div>`;
    const list = q1(el, '[data-ref="list"]');
    const draw = () => {
      list.innerHTML = imgs.map((s, i) => `<div class="dt-thumb"><img src="${s}" alt=""><button class="dt-x" type="button" data-del="${i}" aria-label="মুছুন">×</button><div class="dt-mv"><button type="button" data-mv="${i}:-1" aria-label="আগে নিন">◀</button><button type="button" data-mv="${i}:1" aria-label="পরে নিন">▶</button></div></div>`).join("");
    };
    const add = (files, i) => {
      if (i >= files.length) { draw(); return; }
      const r = new FileReader();
      r.onload = () => {
        const im = new Image();
        im.onload = () => {
          const k = Math.min(1, 1600 / Math.max(im.width, im.height));
          const c = document.createElement("canvas");
          c.width = Math.round(im.width * k);
          c.height = Math.round(im.height * k);
          const x = c.getContext("2d");
          x.fillStyle = "#fff";
          x.fillRect(0, 0, c.width, c.height);
          x.drawImage(im, 0, 0, c.width, c.height);
          imgs.push(c.toDataURL("image/jpeg", 0.88));
          add(files, i + 1);
        };
        im.onerror = () => { toast("একটি ছবি পড়া যায়নি।"); add(files, i + 1); };
        im.src = r.result;
      };
      r.readAsDataURL(files[i]);
    };
    el.addEventListener("change", (e) => {
      if (e.target.dataset.ref !== "file") return;
      add(Array.from(e.target.files), 0);
      e.target.value = "";
    });
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.del !== undefined) { imgs.splice(+b.dataset.del, 1); draw(); return; }
      if (b.dataset.mv) {
        const [i, dir] = b.dataset.mv.split(":").map(Number), j = i + dir;
        if (j >= 0 && j < imgs.length) { const t = imgs[i]; imgs[i] = imgs[j]; imgs[j] = t; draw(); }
        return;
      }
      if (b.dataset.act === "make") {
        if (!imgs.length) { toast("আগে ছবি বাছাই করুন।"); return; }
        const o = q1(el, '[data-ref="ori"]').value, w = o === "landscape" ? 1123 : 794, h = o === "landscape" ? 794 : 1123;
        exportPdf({
          html: imgs.map((s, i) => `<div style="width:${w}px;height:${h - 2}px;display:flex;align-items:center;justify-content:center;background:#fff;${i < imgs.length - 1 ? "page-break-after:always" : ""}"><img src="${s}" style="max-width:96%;max-height:96%;object-fit:contain"></div>`).join(""),
          width: `${w}px`, name: "images.pdf", orient: o, btn: b
        });
      }
    });
  };

  /* ---------- QR কোড ---------- */
  const SO = [["facebook", "Facebook", "https://facebook.com/"], ["instagram", "Instagram", "https://instagram.com/"], ["youtube", "YouTube", "https://youtube.com/@"], ["tiktok", "TikTok", "https://tiktok.com/@"], ["x", "X (Twitter)", "https://x.com/"], ["github", "GitHub", "https://github.com/"], ["telegram", "Telegram", "https://t.me/"]];
  const wesc = (x) => String(x || "").replace(/([\\;,:"])/g, "\\$1");
  const QT = {
    url: { n: "লিংক (URL)", f: ["u|ওয়েবসাইট লিংক"], s: (v) => { const u = v("u").trim(); return u && !/^[a-z][a-z0-9+.-]*:/i.test(u) ? `https://${u}` : u; } },
    text: { n: "টেক্সট", f: ["t|আপনার লেখা|area"], s: (v) => v("t") },
    soc: { n: "সোশ্যাল প্রোফাইল", f: [`p|প্ল্যাটফর্ম|select|${SO.map((o) => o[1]).join(",")}`, "un|ইউজারনেম"], s: (v) => { const o = SO.find((z) => z[1] === v("p")) || SO[0], u = v("un").trim().replace(/^@/, ""); return u ? o[2] + encodeURIComponent(u) : ""; } },
    wifi: { n: "ওয়াই-ফাই", f: ["ssid|নেটওয়ার্কের নাম", "pw|পাসওয়ার্ড", "enc|সিকিউরিটি|select|WPA,WEP,nopass"], s: (v) => (v("ssid") ? `WIFI:T:${v("enc") || "WPA"};S:${wesc(v("ssid"))};P:${wesc(v("pw"))};;` : ""), hide: 1 },
    mail: { n: "ইমেইল", f: ["to|ইমেইল ঠিকানা", "sub|বিষয়", "body|বার্তা|area"], s: (v) => { const q = []; if (v("sub")) q.push(`subject=${encodeURIComponent(v("sub"))}`); if (v("body")) q.push(`body=${encodeURIComponent(v("body"))}`); return v("to").trim() ? `mailto:${v("to").trim()}${q.length ? `?${q.join("&")}` : ""}` : ""; } },
    tel: { n: "ফোন কল", f: ["n|ফোন নম্বর"], s: (v) => (v("n").trim() ? `tel:${v("n").replace(/\s/g, "")}` : "") },
    sms: { n: "SMS", f: ["n|নম্বর", "m|বার্তা|area"], s: (v) => (v("n").trim() ? `SMSTO:${v("n").replace(/\s/g, "")}:${v("m")}` : "") },
    wa: { n: "WhatsApp", f: ["n|নম্বর (দেশের কোডসহ, + ছাড়া)", "m|বার্তা|area"], s: (v) => { const dg = v("n").replace(/\D/g, ""); return dg ? `https://wa.me/${dg}${v("m") ? `?text=${encodeURIComponent(v("m"))}` : ""}` : ""; } },
    vcard: { n: "কন্টাক্ট কার্ড (vCard)", f: ["nm|নাম", "org|কোম্পানি", "ph|ফোন", "em|ইমেইল", "web|ওয়েবসাইট", "ad|ঠিকানা"], s: (v) => (v("nm").trim() ? ["BEGIN:VCARD", "VERSION:3.0", `FN:${v("nm")}`, v("org") && `ORG:${v("org")}`, v("ph") && `TEL:${v("ph")}`, v("em") && `EMAIL:${v("em")}`, v("web") && `URL:${v("web")}`, v("ad") && `ADR:;;${v("ad")}`, "END:VCARD"].filter(Boolean).join("\n") : "") },
    geo: { n: "লোকেশন (ম্যাপ)", f: ["lat|Latitude", "lng|Longitude"], s: (v) => (v("lat").trim() && v("lng").trim() ? `geo:${v("lat").trim()},${v("lng").trim()}` : "") }
  };
  Object.keys(QT).forEach((k) => { QT[k].F = QT[k].f.map(parseField); });

  const qLum = (h) => {
    const v = [1, 3, 5].map((i) => { const c = parseInt(h.substr(i, 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const qCon = (a, b) => { const x = qLum(a), y = qLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const qrr = (x, X, Y, W, H, R) => {
    if (R <= 0) { x.rect(X, Y, W, H); return; }
    x.moveTo(X + R, Y);
    x.arcTo(X + W, Y, X + W, Y + H, R);
    x.arcTo(X + W, Y + H, X, Y + H, R);
    x.arcTo(X, Y + H, X, Y, R);
    x.arcTo(X, Y, X + W, Y, R);
    x.closePath();
  };
  const ensureQr = () => (window.qrcode ? Promise.resolve() : loadScript(LIBS.qr).catch(() => loadScript(LIBS.qrAlt)));

  const mountQr = (el) => {
    const Q = Object.assign({ type: "url", v: { url_u: SITE_URL }, size: 512, fg: "#000000", bg: "#ffffff", ec: "M", margin: 4, cap: "", dot: "sq", eye: "sq", grad: false, fg2: "#2563eb", fr: "text", lshape: "circle", lsize: 22 }, D.drafts.qr || {});
    if (!QT[Q.type]) Q.type = "url";
    Q.logo = null;
    const persist = () => { D.drafts.qr = { type: Q.type, v: Q.v, size: Q.size, fg: Q.fg, bg: Q.bg, ec: Q.ec, margin: Q.margin, cap: Q.cap, dot: Q.dot, eye: Q.eye, grad: Q.grad, fg2: Q.fg2, fr: Q.fr, lshape: Q.lshape, lsize: Q.lsize }; save(); };
    const qText = () => QT[Q.type].s((k) => String(Q.v[`${Q.type}_${k}`] || ""));
    const qField = (x) => { const k = `${Q.type}_${x.k}`; return fieldHTML(x, Q.v[k] == null ? x.d : Q.v[k], `data-q="${k}"`); };

    const qObj = () => {
      const t = qText();
      if (!t || !window.qrcode) return null;
      if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs["UTF-8"]) qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
      const q = qrcode(0, Q.logo ? "H" : Q.ec);
      q.addData(t);
      q.make();
      return q;
    };
    const qPrims = (q) => {
      const n = q.getModuleCount(), mg = Q.margin, P = [];
      const eye = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
      const sh = (x, y, w, k, st, rr) => { P.push(st === "ci" ? { c: 1, x: x + w / 2, y: y + w / 2, r: w / 2 * (rr || 1), k } : { x, y, w, h: w, r: st === "rd" ? w * 0.3 : 0, k }); };
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!eye(r, c) && q.isDark(r, c)) sh(c + mg, r + mg, 1, "f", Q.dot, 0.92);
      [[0, 0], [0, n - 7], [n - 7, 0]].forEach((e) => {
        const x = e[1] + mg, y = e[0] + mg;
        sh(x, y, 7, "f", Q.eye);
        sh(x + 1, y + 1, 5, "b", Q.eye);
        sh(x + 2, y + 2, 3, "f", Q.eye);
      });
      return P;
    };
    const logoCv = (z) => {
      const c = document.createElement("canvas");
      c.width = c.height = z;
      const im = Q.logo, w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, s = Math.min(w, h);
      c.getContext("2d").drawImage(im, (w - s) / 2, (h - s) / 2, s, s, 0, 0, z, z);
      return c;
    };
    const qSvg = (q) => {
      const n = q.getModuleCount(), t = n + 2 * Q.margin, P = qPrims(q), fl0 = Q.grad ? "url(#g)" : Q.fg;
      let h = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${t} ${t}">${Q.grad ? `<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${t}" y2="${t}"><stop offset="0" stop-color="${Q.fg}"/><stop offset="1" stop-color="${Q.fg2}"/></linearGradient></defs>` : ""}<rect width="${t}" height="${t}" fill="${Q.bg}"/>`;
      P.forEach((p) => {
        const fl = p.k === "f" ? fl0 : Q.bg;
        h += p.c ? `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${fl}"/>` : `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}"${p.r ? ` rx="${p.r}"` : ""} fill="${fl}"/>`;
      });
      if (Q.logo) {
        const L = t * Q.lsize / 100, o = (t - L) / 2, pd = L * 0.1, ci = Q.lshape === "circle";
        h += (ci ? `<circle cx="${t / 2}" cy="${t / 2}" r="${L / 2 + pd}" fill="${Q.bg}"/>` : `<rect x="${o - pd}" y="${o - pd}" width="${L + 2 * pd}" height="${L + 2 * pd}" rx="${pd}" fill="${Q.bg}"/>`) +
          `<clipPath id="lc">${ci ? `<circle cx="${t / 2}" cy="${t / 2}" r="${L / 2}"/>` : `<rect x="${o}" y="${o}" width="${L}" height="${L}"/>`}</clipPath><image x="${o}" y="${o}" width="${L}" height="${L}" xlink:href="${logoCv(256).toDataURL("image/png")}" clip-path="url(#lc)"/>`;
      }
      return `${h}</svg>`;
    };

    const sel = (o, cur, a) => `<select ${a}>${o.map((z) => `<option value="${z[0]}"${String(cur) === String(z[0]) ? " selected" : ""}>${z[1]}</option>`).join("")}</select>`;
    const fd = (l, h) => `<div class="dt-f"><label>${l}</label>${h}</div>`;
    const pre = [["classic", "ক্লাসিক"], ["round", "রাউন্ড"], ["dots", "ডট"], ["grad", "গ্রেডিয়েন্ট"], ["brand", "ব্র্যান্ড রঙ"]].map((z) => `<button class="dt-btn sm" type="button" data-pre="${z[0]}">${z[1]}</button>`).join("");
    const build = () => {
      el.innerHTML = `<div class="dt-qw"><div class="dt-fp">
        ${fd("QR-এর ধরন", `<select data-ref="type">${Object.keys(QT).map((k) => `<option value="${k}"${k === Q.type ? " selected" : ""}>${QT[k].n}</option>`).join("")}</select>`)}
        <div data-ref="qf">${QT[Q.type].F.map(qField).join("")}</div>
        <h3 class="dt-h">রেডিমেড স্টাইল</h3><div class="dt-tb">${pre}</div>
        <h3 class="dt-h">ডিজাইন</h3><div class="dt-g2">
        ${fd("ডটের আকার", sel([["sq", "চৌকো"], ["rd", "গোল কোণা"], ["ci", "গোল ডট"]], Q.dot, 'data-qo="dot"'))}
        ${fd("কোণার চোখ (Eye)", sel([["sq", "চৌকো"], ["rd", "গোল কোণা"], ["ci", "গোল"]], Q.eye, 'data-qo="eye"'))}
        ${fd("QR-এর রঙ", `<input type="color" data-qo="fg" value="${esc(Q.fg)}">`)}
        ${fd("ব্যাকগ্রাউন্ড রঙ", `<input type="color" data-qo="bg" value="${esc(Q.bg)}">`)}
        ${fd('<input type="checkbox" data-qo="grad"' + (Q.grad ? " checked" : "") + "> গ্রেডিয়েন্ট (দ্বিতীয় রঙ)", `<input type="color" data-qo="fg2" value="${esc(Q.fg2)}">`)}
        ${fd("সাইজ (px)", sel([[256, "256"], [512, "512"], [1024, "1024"], [2048, "2048"]], Q.size, 'data-qo="size"'))}
        ${fd("ভুল সংশোধন", sel([["L", "L (৭%)"], ["M", "M (১৫%)"], ["Q", "Q (২৫%)"], ["H", "H (৩০%)"]], Q.ec, 'data-qo="ec"'))}
        ${fd("চারপাশের ফাঁকা", sel([[0, "০"], [1, "১"], [2, "২"], [4, "৪ (ডিফল্ট)"], [6, "৬"], [8, "৮"]], Q.margin, 'data-qo="margin"'))}
        ${fd("নিচে লেখা (ক্যাপশন)", `<input type="text" data-qo="cap" value="${esc(Q.cap)}" placeholder="যেমন: Scan Me">`)}
        ${fd("ক্যাপশনের স্টাইল", sel([["text", "সাধারণ লেখা"], ["bar", "রঙিন বার"]], Q.fr, 'data-qo="fr"'))}</div>
        <h3 class="dt-h">মাঝখানে ছবি / লোগো</h3>
        ${fd("ছবি বাছাই করুন", '<input type="file" data-ref="logo" accept="image/*">')}
        <div class="dt-tb"><button class="dt-btn sm d" type="button" data-act="logox">${ic("trash", 14)} সরান</button></div>
        <div class="dt-g2">${fd("ছবির আকৃতি", sel([["circle", "গোল"], ["square", "চৌকো"]], Q.lshape, 'data-qo="lshape"'))}${fd("ছবির মাপ", sel([[16, "ছোট"], [22, "মাঝারি"], [28, "বড়"]], Q.lsize, 'data-qo="lsize"'))}</div>
      </div>
      <div class="dt-panel dt-qp"><canvas data-ref="cv" width="1" height="1"></canvas><div class="dt-sub" data-ref="msg" style="margin:10px 0 0"></div><div data-ref="txt" style="font-size:.78rem;color:var(--color-muted);word-break:break-all;margin:6px 0 12px"></div>
        <div class="dt-tb" style="justify-content:center"><button class="dt-btn p" type="button" data-act="png">${ic("dl")} PNG</button><button class="dt-btn" type="button" data-act="svg">${ic("dl")} SVG</button><button class="dt-btn" type="button" data-act="pdf">${ic("dl")} PDF</button></div></div></div>`;
    };

    const draw = () => {
      const c = q1(el, '[data-ref="cv"]'), m = q1(el, '[data-ref="msg"]'), tx = q1(el, '[data-ref="txt"]');
      if (!c) return;
      if (!window.qrcode) { m.textContent = "QR লাইব্রেরি লোড হচ্ছে..."; return; }
      let q;
      try { q = qObj(); } catch (e) { c.width = c.height = 1; m.textContent = "লেখাটি অনেক বড় — QR হচ্ছে না। ছোট করুন বা ভুল সংশোধন কমান।"; return; }
      if (!q) { c.width = c.height = 1; m.textContent = "বাঁদিকে তথ্য লিখুন, এখানে QR দেখা যাবে।"; tx.textContent = ""; return; }
      const n = q.getModuleCount(), mg = Q.margin, tot = n + 2 * mg, cell = Math.max(1, Math.floor(Q.size / tot)), px = cell * tot, ex = Q.cap ? Math.round(px * (Q.fr === "bar" ? 0.17 : 0.14)) : 0;
      c.width = px;
      c.height = px + ex;
      const x = c.getContext("2d");
      x.fillStyle = Q.bg;
      x.fillRect(0, 0, px, px + ex);
      let fill = Q.fg;
      if (Q.grad) { const g = x.createLinearGradient(0, 0, px, px); g.addColorStop(0, Q.fg); g.addColorStop(1, Q.fg2); fill = g; }
      qPrims(q).forEach((p) => {
        x.fillStyle = p.k === "f" ? fill : Q.bg;
        x.beginPath();
        if (p.c) x.arc(p.x * cell, p.y * cell, p.r * cell, 0, 6.2832);
        else qrr(x, p.x * cell, p.y * cell, p.w * cell, p.h * cell, p.r * cell);
        x.fill();
      });
      if (Q.logo) {
        const L = Math.round(px * Q.lsize / 100), o = Math.round((px - L) / 2), pd = Math.round(L * 0.1), ci = Q.lshape === "circle";
        x.fillStyle = Q.bg;
        x.beginPath();
        if (ci) x.arc(px / 2, px / 2, L / 2 + pd, 0, 6.2832); else qrr(x, o - pd, o - pd, L + 2 * pd, L + 2 * pd, pd);
        x.fill();
        x.save();
        x.beginPath();
        if (ci) x.arc(px / 2, px / 2, L / 2, 0, 6.2832); else x.rect(o, o, L, L);
        x.clip();
        x.drawImage(logoCv(L), o, o, L, L);
        x.restore();
      }
      if (Q.cap) {
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.font = `700 ${Math.round(ex * 0.46)}px 'Hind Siliguri','Inter',sans-serif`;
        if (Q.fr === "bar") { x.fillStyle = fill; x.beginPath(); qrr(x, px * 0.08, px + ex * 0.1, px * 0.84, ex * 0.78, ex * 0.22); x.fill(); x.fillStyle = Q.bg; } else x.fillStyle = Q.fg;
        x.fillText(Q.cap, px / 2, px + ex * 0.5, px * 0.78);
      }
      const t = qText();
      tx.textContent = QT[Q.type].hide ? "" : (t.length > 90 ? `${t.slice(0, 90)}…` : t);
      m.textContent = (qCon(Q.fg, Q.bg) < 3 || (Q.grad && qCon(Q.fg2, Q.bg) < 3)) ? "সতর্কতা: রঙের কনট্রাস্ট কম — স্ক্যান নাও হতে পারে।" : ((Q.dot === "ci" || Q.logo) ? "টিপ: ডট স্টাইল বা লোগো দিলে ফোনে স্ক্যান করে টেস্ট করে নিন।" : "");
    };

    const dl = (href, name) => { const a = document.createElement("a"); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); };

    build();
    ensureQr().then(draw).catch(() => { const m = q1(el, '[data-ref="msg"]'); if (m) m.textContent = "QR লাইব্রেরি লোড হয়নি। ইন্টারনেট দেখে রিলোড করুন।"; });

    el.addEventListener("input", (e) => {
      const s = e.target.dataset;
      if (s.q !== undefined) { Q.v[s.q] = e.target.value; persist(); draw(); }
      else if (s.qo !== undefined) {
        const k = s.qo;
        Q[k] = (k === "size" || k === "margin" || k === "lsize") ? num(e.target.value) : (k === "grad" ? e.target.checked : e.target.value);
        persist();
        draw();
      }
    });
    el.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.ref === "type") { Q.type = t.value; q1(el, '[data-ref="qf"]').innerHTML = QT[Q.type].F.map(qField).join(""); persist(); draw(); }
      else if (t.dataset.ref === "logo" && t.files[0]) {
        const fr = new FileReader();
        fr.onload = () => { const im = new Image(); im.onload = () => { Q.logo = im; draw(); }; im.src = fr.result; };
        fr.readAsDataURL(t.files[0]);
      }
    });
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const s = b.dataset;
      if (s.pre) {
        const PR = { classic: { dot: "sq", eye: "sq", grad: false, fg: "#000000" }, round: { dot: "rd", eye: "rd", grad: false, fg: "#000000" }, dots: { dot: "ci", eye: "ci", grad: false, fg: "#000000", ec: "H" }, grad: { dot: "rd", eye: "rd", grad: true, fg: "#0f6b5c", fg2: "#2563eb" }, brand: { dot: "rd", eye: "rd", grad: false, fg: D.set.acc } };
        Object.assign(Q, PR[s.pre]);
        persist();
        build();
        draw();
        return;
      }
      if (s.act === "logox") { Q.logo = null; const lf = q1(el, '[data-ref="logo"]'); if (lf) lf.value = ""; draw(); return; }
      if (!["png", "svg", "pdf"].includes(s.act)) return;
      let qo = null;
      try { qo = qObj(); } catch (err) { qo = null; }
      if (!qo) { toast("আগে QR-এর তথ্য দিন।"); return; }
      const cv = q1(el, '[data-ref="cv"]');
      if (s.act === "png") dl(cv.toDataURL("image/png"), `qr-${Q.type}.png`);
      else if (s.act === "svg") {
        try { const u = URL.createObjectURL(new Blob([qSvg(qo)], { type: "image/svg+xml" })); dl(u, `qr-${Q.type}.svg`); setTimeout(() => URL.revokeObjectURL(u), 1000); } catch (err) { toast("SVG বানানো যায়নি।"); }
      } else {
        let tt = QT[Q.type].hide ? "" : qText();
        tt = tt.length > 140 ? `${tt.slice(0, 140)}…` : tt;
        exportPdf({
          html: `<div style="width:794px;height:1120px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;color:#111;text-align:center;padding:60px;box-sizing:border-box;font-family:var(--font-body)"><div style="font-size:30px;font-weight:700;margin-bottom:30px">${esc(Q.cap || QT[Q.type].n)}</div><img src="${cv.toDataURL("image/png")}" style="width:520px;height:${Math.round(520 * cv.height / cv.width)}px"><div style="margin-top:26px;font-size:15px;color:#555;word-break:break-all;max-width:620px">${esc(tt)}</div><div style="margin-top:40px;font-size:13px;color:#888">${esc(D.set.co)}</div></div>`,
          width: "794px", name: `QR-${Q.type}.pdf`, btn: b
        });
      }
    });
  };

  /* ---------- ডকুমেন্ট এডিটর ---------- */
  const mountEditor = (el) => {
    const SIZES = { a4: { w: 210, h: 297, m: 20, fs: 16, name: "A4" }, a5: { w: 148, h: 210, m: 14, fs: 14, name: "A5" } };
    const FONTS = { serif: "'Noto Serif Bengali',serif", sans: "'Hind Siliguri','Inter',sans-serif" };
    const MM = 96 / 25.4;
    const bn = (n) => String(n).replace(/\d/g, (x) => "০১২৩৪৫৬৭৮৯"[x]);
    const dateBn = new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
    const TPL = {
      blank: { title: "নামহীন ডকুমেন্ট", html: "" },
      application: { title: "আবেদনপত্র", html: `<p>তারিখ: ${dateBn}</p><p>বরাবর,<br>[প্রাপকের পদবি]<br>[প্রতিষ্ঠানের নাম]<br>[ঠিকানা]</p><p><strong>বিষয়: [আবেদনের বিষয়]।</strong></p><p>জনাব/মহোদয়,</p><p>বিনীত নিবেদন এই যে, [আপনার পরিচয় ও আবেদনের কারণ বিস্তারিত লিখুন]। এমতাবস্থায়, আপনার নিকট বিনীত অনুরোধ, [আপনার চাওয়া] মঞ্জুর করে আমাকে বাধিত করবেন।</p><p>বিনীত নিবেদক,<br>[আপনার নাম]<br>[পদবি/পরিচয়]<br>মোবাইল: [নম্বর]</p>` },
      contract: { title: "চুক্তিপত্র", html: `<h1>চুক্তিপত্র</h1><p>এই চুক্তিপত্র ${dateBn} তারিখে সম্পাদিত হলো।</p><p><strong>প্রথম পক্ষ:</strong> [নাম], পিতা: [পিতার নাম], ঠিকানা: [ঠিকানা]।</p><p><strong>দ্বিতীয় পক্ষ:</strong> [নাম], পিতা: [পিতার নাম], ঠিকানা: [ঠিকানা]।</p><h3>শর্তাবলি</h3><ol><li>[চুক্তির বিষয় ও পরিধি]</li><li>[মূল্য/পারিশ্রমিক ও পরিশোধের নিয়ম]</li><li>[মেয়াদ ও সময়সীমা]</li><li>[কোনো পক্ষ শর্ত ভঙ্গ করলে করণীয়]</li></ol><p>উভয় পক্ষ স্বেচ্ছায়, সজ্ঞানে ও অন্যের প্ররোচনা ছাড়া নিচে স্বাক্ষর করলেন।</p><p>প্রথম পক্ষের স্বাক্ষর: ____________</p><p>দ্বিতীয় পক্ষের স্বাক্ষর: ____________</p><p>সাক্ষী ১: ____________</p><p>সাক্ষী ২: ____________</p>` }
    };

    el.innerHTML = '<p class="dt-load">এডিটর লোড হচ্ছে...</p>';
    loadCss(LIBS.quillCss);
    return loadScript(LIBS.quill).then(() => {
      const st = Object.assign({ size: "a4", font: "serif", title: "নামহীন ডকুমেন্ট", html: "" }, D.drafts.editor || {});
      if (!SIZES[st.size]) st.size = "a4";
      if (!FONTS[st.font]) st.font = "serif";
      el.innerHTML = `<div class="dt-ed">
        <div class="dt-ed-bar">
          <input class="dt-title" data-ref="title" type="text" maxlength="60" aria-label="ডকুমেন্টের নাম" value="${esc(st.title)}">
          <select data-ref="font" aria-label="ফন্ট"><option value="serif">সেরিফ ফন্ট</option><option value="sans">সান্স ফন্ট</option></select>
          <select data-ref="size" aria-label="পেজ সাইজ"><option value="a4">A4 সাইজ</option><option value="a5">A5 সাইজ</option></select>
          <button class="dt-btn" type="button" data-act="print">${ic("print")} প্রিন্ট</button>
          <button class="dt-btn p" type="button" data-act="pdf">${ic("dl")} PDF</button>
        </div>
        <div class="dt-tb"><button class="dt-btn sm" type="button" data-tpl="blank">নতুন ডকুমেন্ট</button><button class="dt-btn sm" type="button" data-tpl="application">আবেদনপত্র</button><button class="dt-btn sm" type="button" data-tpl="contract">চুক্তিপত্র</button></div>
        ${TABS.replace('data-tab="f" type="button">ফর্ম', 'data-tab="f" type="button">এডিটর')}
        <div class="dt-tw eq" data-v="f">
          <div class="dt-ed-pane"><div class="dt-ed-card"><div data-ref="quill"></div></div><div class="dt-status"><span data-ref="count">০ শব্দ</span><span data-ref="saved">স্বয়ংক্রিয় সংরক্ষণ চালু</span></div></div>
          <div class="dt-pv" data-ref="stage"><div class="dt-wrap" data-ref="wrap"><div class="dp-doc-paper"><div class="dp-doc" data-ref="pc"></div></div></div></div>
        </div></div>`;
      const root = q1(el, ".dt-ed");
      q1(el, '[data-ref="font"]').value = st.font;
      q1(el, '[data-ref="size"]').value = st.size;
      const quill = new Quill(q1(el, '[data-ref="quill"]'), {
        theme: "snow",
        placeholder: "এখানে আপনার ডকুমেন্ট লিখুন...",
        modules: { toolbar: [[{ header: [1, 2, 3, false] }], ["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], [{ align: [] }], [{ indent: "-1" }, { indent: "+1" }], ["clean"]] }
      });
      const stage = q1(el, '[data-ref="stage"]'), wrap = q1(el, '[data-ref="wrap"]'), pc = q1(el, '[data-ref="pc"]'), paper = q1(el, ".dp-doc-paper");
      const isEmpty = () => quill.getText().trim().length === 0;
      const applySize = () => {
        const s = SIZES[st.size], r = root.style;
        r.setProperty("--pw", `${s.w}mm`);
        r.setProperty("--ph", `${s.h}mm`);
        r.setProperty("--m", `${s.m}mm`);
        r.setProperty("--ed-size", `${s.fs}px`);
        r.setProperty("--ed-font", FONTS[st.font]);
        fit();
      };
      const fit = () => {
        const avail = stage.clientWidth - 24;
        if (avail <= 0) return;
        const full = SIZES[st.size].w * MM, k = Math.min(1, avail / full);
        paper.style.transform = `scale(${k})`;
        wrap.style.width = `${full * k}px`;
        wrap.style.height = `${paper.offsetHeight * k}px`;
      };
      const render = () => {
        pc.innerHTML = isEmpty() ? '<p class="dp-empty">এখানে আপনার ডকুমেন্টের প্রিভিউ দেখা যাবে...</p>' : quill.root.innerHTML;
        const words = quill.getText().trim().split(/\s+/).filter(Boolean).length;
        q1(el, '[data-ref="count"]').textContent = `${bn(isEmpty() ? 0 : words)} শব্দ`;
        fit();
      };
      let timer = null;
      const persist = () => {
        D.drafts.editor = { html: quill.root.innerHTML, size: st.size, font: st.font, title: st.title };
        save();
        q1(el, '[data-ref="saved"]').textContent = "সংরক্ষিত হয়েছে";
      };
      const queue = () => { q1(el, '[data-ref="saved"]').textContent = "সংরক্ষণ হচ্ছে..."; clearTimeout(timer); timer = setTimeout(persist, 600); };

      if (st.html) quill.clipboard.dangerouslyPasteHTML(0, st.html);
      quill.on("text-change", () => { render(); queue(); });
      const stop = watchWidth(stage, fit);
      bindTabs(el, fit);
      applySize();
      render();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

      const fileName = () => `${safeName(st.title || "bangla-document")}.pdf`;
      const docHTML = () => `<div class="dp-doc-paper" style="--pw:${SIZES[st.size].w}mm;--ph:${SIZES[st.size].h}mm;--m:${SIZES[st.size].m}mm;--ed-size:${SIZES[st.size].fs}px;--ed-font:${FONTS[st.font]};min-height:0"><div class="dp-doc">${quill.root.innerHTML}</div></div>`;

      el.addEventListener("input", (e) => { if (e.target.dataset.ref === "title") { st.title = e.target.value; queue(); } });
      el.addEventListener("change", (e) => {
        const r = e.target.dataset.ref;
        if (r === "size") { st.size = e.target.value; applySize(); queue(); }
        else if (r === "font") { st.font = e.target.value; applySize(); queue(); }
      });
      el.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.tpl) {
          if (!isEmpty() && !confirm("বর্তমান লেখা মুছে নতুন টেমপ্লেট লোড হবে। চালিয়ে যাবেন?")) return;
          const t = TPL[b.dataset.tpl];
          quill.setContents([]);
          if (t.html) quill.clipboard.dangerouslyPasteHTML(0, t.html);
          st.title = t.title;
          q1(el, '[data-ref="title"]').value = t.title;
          render();
          persist();
          quill.focus();
        } else if (b.dataset.act === "print") {
          if (isEmpty()) { toast("আগে কিছু লিখুন।"); return; }
          printHTML(docHTML(), SIZES[st.size].name, fileName().replace(/\.pdf$/, ""));
        } else if (b.dataset.act === "pdf") {
          if (isEmpty()) { toast("আগে কিছু লিখুন, তারপর PDF ডাউনলোড করুন।"); return; }
          const s = SIZES[st.size];
          exportPdf({
            html: `<div class="dp-doc" style="--ed-size:${s.fs}px;--ed-font:${FONTS[st.font]}">${quill.root.innerHTML}</div>`,
            width: `${s.w - 2 * s.m}mm`, margin: [s.m, s.m, s.m, s.m], name: fileName(), format: st.size,
            pagebreak: { mode: ["css", "legacy"], avoid: ["p", "li", "h1", "h2", "h3"] }, btn: b
          });
        }
      });
      return () => { clearTimeout(timer); stop(); };
    }).catch(() => {
      el.innerHTML = '<p class="dt-load">এডিটর লোড হয়নি। ইন্টারনেট সংযোগ দেখে পেজটি রিলোড করুন।</p>';
    });
  };

  const IMPL = { saved: mountSaved, settings: mountSettings, img: mountImg, qr: mountQr, editor: mountEditor };

  window.SiteTools = {
    has: (id) => !!(DOCS[id] || IMPL[id]),
    mount: (id, el, ctx) => {
      C = ctx;
      injectCss();
      el.classList.add("dt");
      const fn = DOCS[id] ? () => mountDoc(el, DOCS[id]) : () => IMPL[id](el);
      return Promise.resolve(fn()).then((stop) => (typeof stop === "function" ? stop : null));
    }
  };
})();
