// Shared Material-inspired neutral surfaces. No remote fonts or runtime theme dependency.
export const materialSurfaceCSS=`
:host{--pause-bg:#f8f9fa;--pause-fg:#202124;--pause-muted:#5f6368;--pause-line:#dadce0;--pause-input:#fff;--pause-control:#e8eaed;--pause-accent:#0b57d0;--pause-on-accent:#fff;color-scheme:light;font-family:Roboto,Arial,system-ui,sans-serif}
:host([data-dark]){--pause-bg:#292a2d;--pause-fg:#e8eaed;--pause-muted:#bdc1c6;--pause-line:#5f6368;--pause-input:#202124;--pause-control:#3c4043;--pause-accent:#a8c7fa;--pause-on-accent:#062e6f;color-scheme:dark}
.panel,.dialog{border-radius:24px;box-shadow:0 6px 24px #0003;background:var(--pause-bg);color:var(--pause-fg)}
button{border-radius:999px;background:var(--pause-control);color:var(--pause-fg);font-weight:500;min-height:36px;transition:background-color .15s}
.primary{background:var(--pause-accent);color:var(--pause-on-accent)}
textarea,select{font:inherit;color:var(--pause-fg);background:var(--pause-input);border:1px solid var(--pause-line);border-radius:12px;padding:12px;box-sizing:border-box}
textarea:focus-visible,select:focus-visible,button:focus-visible{outline:3px solid var(--pause-accent);outline-offset:2px}
.backdrop{background:#202124bb}.exclusion{margin-block:16px;padding-block:16px;border-block:1px solid var(--pause-line)}.exclusion label{display:block;font-size:14px;font-weight:500;margin-bottom:8px}.exclusion select{width:100%;min-height:44px}.exclusion .muted{margin-bottom:0;font-size:12px}
.panel.notes-card{padding:0;isolation:isolate}.notes-header{position:relative;min-height:190px;background:var(--pause-control);border-radius:23px 23px 0 0;overflow:hidden}.notes-thumbnail{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;pointer-events:none}.notes-thumbnail-fade{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 5%,var(--pause-bg) 95%);pointer-events:none}.notes-header h2{position:relative;padding:148px 20px 10px;margin:0;color:var(--pause-fg);line-height:1.4}.notes-close{position:absolute;top:12px;right:12px;z-index:2;display:grid;place-items:center;width:40px;height:40px;min-height:40px;padding:0;background:var(--pause-bg);color:var(--pause-fg);border:1px solid var(--pause-line);box-shadow:0 2px 6px #0002}.notes-close svg{display:block}.notes-body{padding:0 20px 20px}.notes-body>.muted:first-child{margin-top:4px}
@media(max-width:480px){.panel.notes-card{padding:0}.notes-body{padding-inline:16px}.notes-header h2{padding-inline:16px}}
@media(forced-colors:active){.notes-thumbnail,.notes-thumbnail-fade{display:none}.notes-header{background:Canvas}.notes-close{background:ButtonFace;color:ButtonText}}
.panel,.dialog,textarea,select,button,.note,.exclusion,.notes-close{border:0}.notes-thumbnail-fade{border:0}.dialog.reflection-card{padding:0;overflow:auto}.reflection-card .notes-header{min-height:190px}.reflection-body{padding:0 24px 24px}.reflection-body>h2{font-size:22px}.note{border:0;margin-top:8px;padding-top:16px}
.notes-reveal{opacity:0}.presence-sidebar{height:0;overflow:hidden}.presence-sidebar>.notes-reveal-clip{min-height:0;overflow:hidden}.presence-floating,.presence-reflection{position:fixed;inset:0;pointer-events:none;z-index:2147483646}.presence-reflection{z-index:2147483647}.presence-floating .panel,.presence-reflection .backdrop{pointer-events:auto}.notes-reveal[aria-hidden="true"]{pointer-events:none}.notes-reveal[aria-hidden="true"] .panel,.notes-reveal[aria-hidden="true"] .backdrop{pointer-events:none}.backdrop{background:transparent}
:host([data-fullscreen]) .panel{right:24px;bottom:80px;width:360px;max-height:calc(100dvh - 112px)}.notes-fab-icon{display:none}:host([data-fullscreen]) .notes-button{top:20px;right:20px;bottom:auto;width:44px;height:44px;padding:0;display:grid;place-items:center;background:#202124cc;color:#fff;box-shadow:none}:host([data-fullscreen]) .notes-button[hidden]{display:none}:host([data-fullscreen]) .notes-fab-label{display:none}:host([data-fullscreen]) .notes-fab-icon{display:block}:host([data-fullscreen]) .backdrop{background:transparent}
@media(max-width:480px){:host([data-fullscreen]) .panel{left:12px;right:12px;width:auto}}
@media(prefers-reduced-motion:reduce){button{transition:none}}
:host .presence-reflection>.notes-reveal-clip>.backdrop{background:rgba(0,0,0,.32);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.panel.notes-card{--card-bg:#f5f5f7;--card-fill:#fff;--card-chip:#7676801f;--card-fg:#1d1d1f;--card-muted:#6e6e73;--card-cta:#1d1d1f;--card-on-cta:#fff;--card-focus:#1d1d1f66;--card-error:#d70015;background:var(--card-bg);color:var(--card-fg);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable Text","Segoe UI","Apple SD Gothic Neo","Malgun Gothic",Roboto,sans-serif;border:0;border-radius:22px;box-shadow:0 12px 40px #0000002e;-webkit-font-smoothing:antialiased}
:host([data-dark]) .panel.notes-card{--card-bg:#1c1c1e;--card-fill:#2c2c2e;--card-chip:#7676803d;--card-fg:#f5f5f7;--card-muted:#98989d;--card-cta:#f5f5f7;--card-on-cta:#1d1d1f;--card-focus:#f5f5f766;--card-error:#ff6961;box-shadow:0 12px 40px #00000080}
:host([data-pause-sidebar]) .panel.notes-card{box-shadow:none}
.notes-card .notes-header{display:flex;flex-direction:column;justify-content:flex-end;aspect-ratio:16/9;min-height:0;border-radius:22px 22px 0 0;background:var(--card-chip)}
.notes-card .notes-header:not(:has(img)){aspect-ratio:auto;padding-top:60px;background:none}
.notes-card .notes-thumbnail-fade{background:linear-gradient(to bottom,transparent 28%,color-mix(in srgb,var(--card-bg) 55%,transparent) 58%,color-mix(in srgb,var(--card-bg) 92%,transparent) 80%,var(--card-bg) 100%)}
.notes-eyebrow{position:relative;margin:0 20px 3px;font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;line-height:1.2;color:var(--card-muted)}
.notes-card .notes-header h2{position:relative;margin:0 20px 2px;padding:0;font-size:19px;font-weight:650;letter-spacing:-.45px;line-height:1.3;color:var(--card-fg);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;overflow-wrap:anywhere}
.notes-card .notes-close{top:12px;right:12px;width:30px;height:30px;min-height:30px;border:0;background:#0000004d;color:#fff;box-shadow:none;-webkit-backdrop-filter:blur(16px) saturate(1.8);backdrop-filter:blur(16px) saturate(1.8)}
.notes-card .notes-close:hover:not(:disabled){background:#00000070;filter:none}.notes-card .notes-close svg{width:16px;height:16px}
.notes-card .notes-header:not(:has(img)) .notes-close{background:var(--card-chip);color:var(--card-muted);backdrop-filter:none}
.notes-card .notes-body{padding:16px 20px 20px}
.notes-card textarea{display:block;width:100%;margin:0;min-height:112px;padding:12px 14px;border:0;border-radius:14px;background:var(--card-fill);color:var(--card-fg);font-size:15px;line-height:1.5;letter-spacing:-.2px;resize:vertical}
.notes-card textarea::placeholder{color:var(--card-muted);opacity:.8}
.notes-card textarea:focus-visible,.notes-card button:focus-visible{outline:2px solid var(--card-focus);outline-offset:2px}
.notes-actions{display:flex;align-items:center;gap:12px;margin-top:12px}
.notes-hint{flex:1;margin:0;font-size:12px;line-height:1.45;color:var(--card-muted)}.notes-hint.is-live{color:var(--card-fg);font-weight:500}
.notes-card .primary{flex:none;min-height:34px;padding:7px 18px;border:0;background:var(--card-cta);color:var(--card-on-cta);font-size:14px;font-weight:600;letter-spacing:-.1px;transition:opacity .15s}
.notes-card .primary:hover:not(:disabled){filter:none;opacity:.85}.notes-card .primary:disabled{opacity:.25}
.notes-list{margin-top:22px}
.notes-list-title{display:flex;align-items:center;gap:6px;margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:-.1px;color:var(--card-muted)}.notes-list-title span{min-width:20px;padding:0 6px;border-radius:999px;background:var(--card-chip);font-size:12px;text-align:center}
.notes-card .note{display:flex;gap:12px;align-items:flex-start;margin:0;padding:9px 0;border:0;white-space:normal}
.notes-time{flex:none;min-height:24px;padding:3px 9px;border:0;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;background:var(--card-chip);color:var(--card-fg)}
.notes-time:hover:not(:disabled){filter:none;opacity:.75}
.notes-card .note p{margin:1px 0 0;font-size:14px;line-height:1.5;letter-spacing:-.15px;white-space:pre-wrap;overflow-wrap:anywhere}
.notes-card [role=alert]{margin:12px 0 0;font-size:13px;line-height:1.5;color:var(--card-error)}
@media(max-width:480px){.notes-card .notes-body{padding:14px 16px 16px}.notes-card .notes-header h2,.notes-eyebrow{margin-inline:16px}}
@media(forced-colors:active){.notes-card textarea,.notes-time,.notes-card .primary{border:1px solid CanvasText}.notes-card .notes-close{background:ButtonFace;color:ButtonText;backdrop-filter:none}.notes-card .notes-header h2,.notes-eyebrow{color:CanvasText}}
@media(forced-colors:active){button,textarea,select,.panel,.dialog{border:1px solid CanvasText}button:focus-visible,textarea:focus-visible,select:focus-visible{outline-color:Highlight}}
`;
export const materialActionCSS=`
button{border:0;background:var(--action-bg,#f2f2f2);color:var(--action-fg,#0f0f0f)}button:hover{background:var(--action-bg,#f2f2f2);box-shadow:inset 0 0 0 999px #0000000d}button:active{box-shadow:inset 0 0 0 999px #00000018}
:host([data-dark]) button{background:var(--action-bg,#ffffff1a);color:var(--action-fg,#f1f1f1)}:host([data-dark]) button:hover{box-shadow:inset 0 0 0 999px #ffffff14}:host([data-dark]) button:focus-visible{outline-color:#a8c7fa}
@media(forced-colors:active){button{background:ButtonFace;color:ButtonText;border:1px solid ButtonText}button:hover{box-shadow:none}}
`;
export const materialPopupCSS=`
:root{font-family:Roboto,Arial,system-ui,sans-serif;color-scheme:light;--bg:#f8f9fa;--fg:#202124;--muted:#5f6368;--accent:#0b57d0}
body{margin:0;background:var(--bg);color:var(--fg)}main{box-sizing:border-box;width:340px;padding:24px}h1{font-size:26px;font-weight:500;letter-spacing:-1px;margin:0}p{line-height:1.6}label{display:flex;gap:10px;align-items:center}input{accent-color:var(--accent);width:18px;height:18px}button{font:inherit;border:0;border-radius:999px;padding:12px 18px;background:#d3e3fd;color:#062e6f;cursor:pointer}input:focus-visible,button:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:3px}small{display:block;line-height:1.6;color:var(--muted)}
@media(prefers-color-scheme:dark){:root{color-scheme:dark;--bg:#292a2d;--fg:#e8eaed;--muted:#bdc1c6;--accent:#a8c7fa}}
`;
