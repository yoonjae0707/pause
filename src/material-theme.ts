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
@media(prefers-reduced-motion:reduce){button{transition:none}}
@media(forced-colors:active){button,textarea,select,.panel,.dialog{border:1px solid CanvasText}button:focus-visible,textarea:focus-visible,select:focus-visible{outline-color:Highlight}}
`;
export const materialActionCSS=`
button{background:var(--action-bg,#f2f2f2);color:var(--action-fg,#0f0f0f)}button:hover{background:var(--action-bg,#f2f2f2);box-shadow:inset 0 0 0 999px #0000000d}button:active{box-shadow:inset 0 0 0 999px #00000018}
:host([data-dark]) button{background:var(--action-bg,#ffffff1a);color:var(--action-fg,#f1f1f1)}:host([data-dark]) button:hover{box-shadow:inset 0 0 0 999px #ffffff14}:host([data-dark]) button:focus-visible{outline-color:#a8c7fa}
@media(forced-colors:active){button{background:ButtonFace;color:ButtonText;border:1px solid ButtonText}button:hover{box-shadow:none}}
`;
export const materialPopupCSS=`
:root{font-family:Roboto,Arial,system-ui,sans-serif;color-scheme:light;--bg:#f8f9fa;--fg:#202124;--muted:#5f6368;--accent:#0b57d0}
body{margin:0;background:var(--bg);color:var(--fg)}main{box-sizing:border-box;width:340px;padding:24px}h1{font-size:26px;font-weight:500;letter-spacing:-1px;margin:0}p{line-height:1.6}label{display:flex;gap:10px;align-items:center}input{accent-color:var(--accent);width:18px;height:18px}input:focus-visible{outline:2px solid var(--accent);outline-offset:3px}small{display:block;line-height:1.6;color:var(--muted)}
@media(prefers-color-scheme:dark){:root{color-scheme:dark;--bg:#292a2d;--fg:#e8eaed;--muted:#bdc1c6;--accent:#a8c7fa}}
`;
