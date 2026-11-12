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
.panel.notes-card{--card-tonal:#f1f3f4;--card-accent-tonal:#d3e3fd;--card-on-accent-tonal:#041e49;--card-error:#b3261e;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI Variable Text","Segoe UI",Roboto,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;border-radius:20px;box-shadow:0 1px 2px #0000000f,0 10px 32px #00000024;-webkit-font-smoothing:antialiased}
:host([data-dark]) .panel.notes-card{--card-tonal:#303134;--card-accent-tonal:#0842a0;--card-on-accent-tonal:#d3e3fd;--card-error:#f2b8b5;box-shadow:0 10px 32px #0008}
:host([data-pause-sidebar]) .panel.notes-card{border:1px solid var(--pause-line);box-shadow:0 1px 2px #0000000d}
.notes-card .notes-header{min-height:128px;border-radius:19px 19px 0 0}
.notes-card .notes-thumbnail-fade{background:linear-gradient(to bottom,transparent 0%,color-mix(in srgb,var(--pause-bg) 35%,transparent) 45%,var(--pause-bg) 94%)}
.notes-card .notes-header h2{padding:88px 20px 0;font-size:20px;font-weight:700;letter-spacing:-.4px;line-height:1.3}
.notes-card .notes-close{top:10px;right:10px;width:32px;height:32px;min-height:32px;background:#0000004d;color:#fff;box-shadow:none;-webkit-backdrop-filter:blur(12px) saturate(1.6);backdrop-filter:blur(12px) saturate(1.6)}
.notes-card .notes-close:hover:not(:disabled){background:#00000070;filter:none}.notes-card .notes-close svg{width:18px;height:18px}
.notes-card .notes-header:not(:has(img)) .notes-close{background:var(--card-tonal);color:var(--pause-fg)}
.notes-card .notes-body{padding:0 20px 20px}
.notes-tagline{margin:2px 0 14px;font-size:13px;line-height:1.4;color:var(--pause-muted)}
.notes-card textarea{display:block;width:100%;margin:0;min-height:112px;padding:12px 14px;border:0;border-radius:14px;background:var(--card-tonal);font-size:14px;line-height:1.55;resize:vertical}
.notes-card textarea::placeholder{color:var(--pause-muted);opacity:.85}.notes-card textarea:focus-visible{outline:2px solid var(--pause-accent);outline-offset:0}
.notes-actions{display:flex;align-items:center;gap:12px;margin-top:10px}
.notes-hint{flex:1;margin:0;font-size:12px;line-height:1.45;color:var(--pause-muted)}.notes-hint.is-live{color:var(--pause-accent);font-weight:500}
.notes-card .primary{flex:none;min-height:36px;padding:8px 20px;font-weight:600;letter-spacing:.1px}
.notes-list{margin-top:18px;padding-top:14px;border-top:1px solid var(--pause-line)}
.notes-list-title{display:flex;align-items:center;gap:6px;margin:0 0 4px;font-size:13px;font-weight:600;color:var(--pause-muted)}.notes-list-title span{min-width:20px;padding:0 6px;border-radius:999px;background:var(--card-tonal);font-size:12px;text-align:center}
.notes-card .note{display:flex;gap:12px;align-items:flex-start;margin:0;padding:10px 0;white-space:normal}.notes-card .note+.note{border-top:1px solid var(--pause-line)}
.notes-time{flex:none;min-height:26px;padding:3px 10px;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;background:var(--card-accent-tonal);color:var(--card-on-accent-tonal)}
.notes-card .note p{margin:2px 0 0;font-size:14px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}
.notes-card [role=alert]{margin:12px 0 0;font-size:13px;line-height:1.5;color:var(--card-error)}
@media(max-width:480px){.notes-card .notes-body{padding:0 16px 16px}.notes-card .notes-header h2{padding-inline:16px}}
@media(forced-colors:active){.notes-card textarea,.notes-time{border:1px solid CanvasText}.notes-card .notes-close{background:ButtonFace;color:ButtonText;backdrop-filter:none}}
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
