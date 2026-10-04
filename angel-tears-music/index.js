// ===== Angel Tears Music Player · 天使泪 =====
(function () {
  if (window.top._atPlayerLoaded) return;
  window.top._atPlayerLoaded = true;

  const TOP = window.top;
  const DOC = TOP.document;
  const LS_KEY = 'angel_tears_config';

  // 默认配置 —— 已指向 ruby-jiyu/L 仓库
  const DEFAULTS = {
    user: 'ruby-jiyu',
    repo: 'L',
    branch: 'main',
    path: '',
    token: '',
    mirror: '',
    volume: 80,
    loop: true,
    shuffle: false,
    silKA: false,
    posX: null, posY: null,
  };

  const S = {
    pl: [], cur: -1, playing: false,
    loop: true, shuffle: false, silKA: false,
    sa: null, audioEl: null,
    config: loadConfig(),
  };
  S.loop = S.config.loop;
  S.shuffle = S.config.shuffle;
  S.silKA = S.config.silKA;

  function loadConfig() {
    try {
      const r = JSON.parse(TOP.localStorage.getItem(LS_KEY) || '{}');
      return Object.assign({}, DEFAULTS, r);
    } catch { return { ...DEFAULTS }; }
  }
  function saveConfig() {
    try { TOP.localStorage.setItem(LS_KEY, JSON.stringify(S.config)); } catch {}
  }

  const I = {
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM9.5 12l8.5 6V6z"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    loop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c0 0-7 7.5-7 12a7 7 0 0 0 14 0c0-4.5-7-12-7-12z" opacity="0.85"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  };

  function mountUI() {
    if (DOC.getElementById('at-root')) return;
    const root = DOC.createElement('div');
    root.id = 'at-root';

    const posX = S.config.posX, posY = S.config.posY;
    if (posX !== null && posY !== null) {
      root.style.left = posX + 'px';
      root.style.top = posY + 'px';
    } else {
      root.style.right = '24px';
      root.style.bottom = '24px';
    }

    root.innerHTML = `
      <div id="at-panel" class="at-panel">
        <div class="at-head">
          <div class="at-brand"><span class="at-drop">${I.drop}</span><span>ANGEL TEARS · 天使泪</span></div>
          <span class="at-x" id="at-x">${I.close}</span>
        </div>
        <div class="at-tabs">
          <div class="at-tab on" data-p="main">播放</div>
          <div class="at-tab" data-p="repo">仓库</div>
          <div class="at-tab" data-p="set">保活</div>
        </div>

        <div class="at-page on" data-p="main">
          <div class="at-now">
            <div class="at-trk" id="at-trk">— 未选择曲目 —</div>
            <div class="at-sub" id="at-sub">点击加载仓库歌单开始</div>
          </div>
          <div class="at-prog">
            <input type="range" id="at-bar" min="0" max="100" value="0" step="0.1">
            <div class="at-time"><span id="at-cur">0:00</span><span id="at-dur">0:00</span></div>
          </div>
          <div class="at-ctrls">
            <button class="at-btn" id="at-pv" title="上一首">${I.prev}</button>
            <button class="at-btn main" id="at-pp" title="播放/暂停">${I.play}</button>
            <button class="at-btn" id="at-nx" title="下一首">${I.next}</button>
            <button class="at-btn ${S.loop?'on':''}" id="at-lp" title="循环">${I.loop}</button>
            <button class="at-btn ${S.shuffle?'on':''}" id="at-sf" title="随机">${I.shuffle}</button>
          </div>
          <div class="at-vol">
            <span class="at-vlbl">♪</span>
            <input type="range" id="at-vl" min="0" max="100" step="1" value="${S.config.volume}">
            <span class="at-vnum" id="at-vnum">${S.config.volume}</span>
          </div>
          <div class="at-list" id="at-list"><div class="at-empty">歌单为空，去「仓库」页加载</div></div>
          <div class="at-log" id="at-log">就绪</div>
        </div>

        <div class="at-page" data-p="repo">
          <div class="at-form">
            <div class="at-field"><label>用户名</label><input class="at-inp" id="r-user" value="${esc(S.config.user)}"></div>
            <div class="at-field"><label>仓库名</label><input class="at-inp" id="r-repo" value="${esc(S.config.repo)}"></div>
            <div class="at-field"><label>分支</label><input class="at-inp" id="r-branch" value="${esc(S.config.branch)}"></div>
            <div class="at-field"><label>子目录（空=根目录）</label><input class="at-inp" id="r-path" value="${esc(S.config.path)}" placeholder="例 music"></div>
            <div class="at-field"><label>Token（私有仓库）</label><input class="at-inp" id="r-token" type="password" value="${esc(S.config.token)}" placeholder="ghp_…"></div>
            <div class="at-field"><label>镜像前缀（可选）</label><input class="at-inp" id="r-mirror" value="${esc(S.config.mirror)}" placeholder="https://mirror.ghproxy.com"></div>
          </div>
          <button class="at-load" id="at-load">${I.refresh} 加载仓库歌单</button>
          <div class="at-hint">默认已指向 <b>ruby-jiyu/L</b> 根目录。公开仓库无需 Token，递归扫描所有音频文件。</div>
        </div>

        <div class="at-page" data-p="set">
          <div class="at-ka">
            <span>🔒 静音保活（防后台被杀）</span>
            <label class="at-tog"><input type="checkbox" id="at-st" ${S.silKA?'checked':''}><span class="at-track"></span><span class="at-thumb"></span></label>
          </div>
          <div class="at-hint">本地生成 30s 静音 WAV + MediaSession 注册，独立于歌曲播放，暂停也不中断。长按悬浮球可拖动，位置自动记忆。</div>
          <div class="at-ka-status" id="at-ka-status">保活：关闭</div>
        </div>
      </div>
      <div id="at-orb" class="at-orb"><span class="at-drop-big">${I.drop}</span></div>
    `;
    DOC.body.appendChild(root);
    bind(root);
    console.log('[AngelTears] UI 挂载完成');
  }

  function g(id) { return DOC.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function log(m) { const e=g('at-log'); if(e) e.textContent=m; }

  function bind(root) {
    const panel = g('at-panel'), orb = g('at-orb');
    DOC.querySelectorAll('.at-tab').forEach(t => {
      t.addEventListener('click', () => {
        DOC.querySelectorAll('.at-tab').forEach(x=>x.classList.remove('on'));
        t.classList.add('on');
        DOC.querySelectorAll('.at-page').forEach(p=>p.classList.remove('on'));
        DOC.querySelector(`.at-page[data-p="${t.dataset.p}"]`).classList.add('on');
      });
    });

    ['user','repo','branch','path','token','mirror'].forEach(k => {
      g('r-'+k).addEventListener('input', e => { S.config[k]=e.target.value; saveConfig(); });
    });
    g('at-load').addEventListener('click', loadRepo);

    orb.addEventListener('click', e => { if(!orb._dragged) panel.classList.toggle('open'); });
    g('at-x').addEventListener('click', () => panel.classList.remove('open'));

    g('at-pp').addEventListener('click', toggle);
    g('at-pv').addEventListener('click', () => skip(-1));
    g('at-nx').addEventListener('click', () => skip(1));

    g('at-lp').addEventListener('click', () => {
      S.loop = !S.loop; if(S.loop) S.shuffle=false;
      S.config.loop = S.loop; S.config.shuffle = S.shuffle; saveConfig();
      syncBgmMode(); syncUI();
    });
    g('at-sf').addEventListener('click', () => {
      S.shuffle = !S.shuffle; if(S.shuffle) S.loop=false;
      S.config.loop = S.loop; S.config.shuffle = S.shuffle; saveConfig();
      syncBgmMode(); syncUI();
    });

    g('at-vl').addEventListener('input', e => {
      S.config.volume = parseInt(e.target.value);
      g('at-vnum').textContent = S.config.volume;
      saveConfig();
      try { setAudioSettings('bgm', { volume: S.config.volume }); } catch {}
    });

    const bar = g('at-bar');
    let seeking=false;
    bar.addEventListener('mousedown', ()=>seeking=true);
    bar.addEventListener('touchstart', ()=>seeking=true, {passive:true});
    const onSeek = () => {
      seeking=false;
      if (S.audioEl && isFinite(S.audioEl.duration)) {
        S.audioEl.currentTime = (bar.value/100)*S.audioEl.duration;
      }
    };
    bar.addEventListener('mouseup', onSeek);
    bar.addEventListener('touchend', onSeek);

    g('at-st').addEventListener('change', function() {
      S.silKA = this.checked; S.config.silKA = S.silKA; saveConfig();
      if (S.silKA) startSA(); else stopSA();
      syncUI();
    });

    setupDrag(root, orb, panel);
    attachAudioObserver();
  }

  function attachAudioObserver() {
    const find = () => {
      const a = DOC.getElementById('bgm_audio') || DOC.querySelector('audio#bgm_audio');
      if (a && a !== S.audioEl) {
        S.audioEl = a;
        a.addEventListener('timeupdate', updateProg);
        a.addEventListener('loadedmetadata', updateDur);
        a.addEventListener('play', ()=>{ S.playing=true; syncUI(); });
        a.addEventListener('pause', ()=>{ S.playing=false; syncUI(); });
        a.addEventListener('ended', onEnded);
      }
    };
    find();
    const mo = new MutationObserver(find);
    mo.observe(DOC.body, { childList:true, subtree:true });
  }
  function updateProg() {
    const a=S.audioEl; if(!a||!isFinite(a.duration)) return;
    const bar=g('at-bar'), cur=g('at-cur');
    if(bar){ bar.value=(a.currentTime/a.duration)*100; bar.style.setProperty('--p',bar.value+'%'); }
    if(cur) cur.textContent=fmt(a.currentTime);
  }
  function updateDur() {
    const a=S.audioEl, d=g('at-dur');
    if(a&&d&&isFinite(a.duration)) d.textContent=fmt(a.duration);
  }
  function fmt(s){ if(!isFinite(s))return'0:00'; const m=Math.floor(s/60),x=Math.floor(s%60); return `${m}:${x.toString().padStart(2,'0')}`; }

  function onEnded() {
    if (S.shuffle) playIdx(Math.floor(Math.random()*S.pl.length));
    else if (S.loop) playIdx((S.cur+1)%S.pl.length);
    else { S.playing=false; syncUI(); }
  }

  async function loadRepo() {
    const c = S.config;
    if (!c.user || !c.repo) { log('⚠ 请填用户名和仓库名'); return; }
    const btn = g('at-load'); btn.disabled=true; btn.innerHTML='⏳ 加载中…';
    const branch = c.branch || 'main';
    const mirror = (c.mirror||'').replace(/\/+$/,'');
    const apiBase = `https://api.github.com/repos/${encodeURIComponent(c.user)}/${encodeURIComponent(c.repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
    const url = mirror ? `${mirror}/${apiBase}` : apiBase;
    try {
      const h = {};
      if (c.token) h['Authorization']='token '+c.token;
      const res = await fetch(url, { headers:h });
      if (!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      if (!data.tree) throw new Error('仓库为空');
      const ext = /\.(mp3|m4a|ogg|wav|flac|aac|opus)$/i;
      const prefix = c.path ? (c.path.replace(/^\/+|\/+$/g,'')+'/') : '';
      const files = data.tree.filter(f => f.type==='blob' && ext.test(f.path) && (!prefix || f.path.startsWith(prefix)));
      if (!files.length) { log('⚠ 未找到音频文件'); return; }
      const rawOrigin = `https://raw.githubusercontent.com/${c.user}/${c.repo}/${branch}`;
      const rawBase = mirror ? `${mirror}/${rawOrigin}` : rawOrigin;
      S.pl = files.map(f => {
        const name = decodeURIComponent(f.path.split('/').pop());
        const title = name.replace(/\.[^.]+$/,'');
        const u = `${rawBase}/${f.path.split('/').map(encodeURIComponent).join('/')}`;
        return { title, url:u };
      });
      try { replaceAudioList('bgm', S.pl); } catch(e){ console.warn(e); }
      log(`✅ 已加载 ${S.pl.length} 首`);
      if (S.cur<0) S.cur=0;
      renderPL(); syncUI();
      DOC.querySelector('.at-tab[data-p="main"]').click();
    } catch(e) {
      log('⚠ 加载失败: '+e.message);
      console.error(e);
    } finally {
      btn.disabled=false; btn.innerHTML=I.refresh+' 加载仓库歌单';
    }
  }

  function syncBgmMode() {
    try {
      const mode = S.shuffle ? 'shuffle' : (S.loop ? 'repeat_all' : 'play_one_and_stop');
      setAudioSettings('bgm', { enabled:true, muted:false, volume:S.config.volume, mode });
    } catch(e){}
  }
  function playIdx(i) {
    if (i<0 || i>=S.pl.length) return;
    S.cur = i;
    const t = S.pl[i];
    log('▶ '+t.title);
    try {
      setAudioSettings('bgm', { enabled:true, muted:false, volume:S.config.volume });
      playAudio('bgm', { title:t.title, url:t.url });
    } catch(e){ log('播放失败: '+e.message); }
    S.playing = true;
    renderPL(); syncUI();
  }
  function toggle() {
    if (!S.pl.length) { log('⚠ 歌单为空，请先加载仓库'); return; }
    if (S.cur<0) { playIdx(0); return; }
    if (S.playing) {
      try { pauseAudio('bgm'); } catch(e){}
      S.playing=false; log('⏸ 暂停');
    } else {
      try {
        setAudioSettings('bgm', { enabled:true, muted:false });
        playAudio('bgm', { title:S.pl[S.cur].title, url:S.pl[S.cur].url });
      } catch(e){ log('播放失败: '+e.message); }
      S.playing=true; log('▶ 继续');
    }
    syncUI();
  }
  function skip(d) {
    if (!S.pl.length) return;
    playIdx(S.shuffle ? Math.floor(Math.random()*S.pl.length) : (S.cur+d+S.pl.length)%S.pl.length);
  }

  function renderPL() {
    const list = g('at-list'); if(!list) return;
    if (!S.pl.length) { list.innerHTML='<div class="at-empty">歌单为空，去「仓库」页加载</div>'; return; }
    list.innerHTML = S.pl.map((t,i)=>`
      <div class="at-item ${i===S.cur?'on':''}" data-i="${i}">
        <span class="at-idx">${i===S.cur&&S.playing?'♪':i+1}</span>
        <span class="at-name" title="${esc(t.title)}">${esc(t.title)}</span>
        <span class="at-del" data-d="${i}">${I.trash}</span>
      </div>`).join('');
    list.querySelectorAll('.at-item').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.closest('.at-del')) return;
        playIdx(+el.dataset.i);
      });
    });
    list.querySelectorAll('.at-del').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        const i=+b.dataset.d, n=S.pl[i].title;
        S.pl.splice(i,1);
        try { replaceAudioList('bgm', S.pl); } catch(e){}
        if (i===S.cur) { S.cur=-1; S.playing=false; try{pauseAudio('bgm');}catch(e){} }
        else if (i<S.cur) S.cur--;
        renderPL(); syncUI(); log('🗑 '+n);
      });
    });
  }

  function syncUI() {
    const pp=g('at-pp'), trk=g('at-trk'), sub=g('at-sub'), lp=g('at-lp'), sf=g('at-sf');
    if(pp) pp.innerHTML = S.playing ? I.pause : I.play;
    if(trk) trk.textContent = S.cur>=0 && S.pl[S.cur] ? S.pl[S.cur].title : '— 未选择曲目 —';
    if(sub) sub.textContent = S.pl.length ? `第 ${S.cur+1} 首 / 共 ${S.pl.length} 首` : '点击加载仓库歌单开始';
    if(lp) lp.classList.toggle('on', S.loop);
    if(sf) sf.classList.toggle('on', S.shuffle);
    const ks=g('at-ka-status');
    if(ks) ks.textContent = '保活：' + (S.sa ? '运行中' : '关闭');
  }

  function startSA() {
    if (S.sa) return;
    try {
      const sr=44100, sec=30, ch=1, bps=16;
      const len = sr*sec*ch*(bps/8);
      const buf = new ArrayBuffer(44+len);
      const v = new DataView(buf);
      const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
      ws(0,'RIFF'); v.setUint32(4,36+len,true); ws(8,'WAVE');
      ws(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true);
      v.setUint16(22,ch,true); v.setUint32(24,sr,true);
      v.setUint32(28,sr*ch*(bps/8),true); v.setUint16(32,ch*(bps/8),true);
      v.setUint16(34,bps,true); ws(36,'data'); v.setUint32(40,len,true);
      const blob = new Blob([buf], {type:'audio/wav'});
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      a.loop=true; a.volume=0.01;
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title:'保活中', artist:'Angel Tears' });
        navigator.mediaSession.playbackState = 'playing';
      }
      a.play().then(()=>{ log('🔇 静音保活已启动'); syncUI(); })
        .catch(e=>{ log('⚠ 保活启动失败: '+e.message); URL.revokeObjectURL(url); S.sa=null; syncUI(); });
      S.sa = a; S.sa._url = url;
    } catch(e) { log('⚠ startSA 异常: '+e.message); }
    syncUI();
  }
  function stopSA() {
    if (S.sa) {
      try { S.sa.pause(); S.sa.src=''; } catch(e){}
      if (S.sa._url) try { URL.revokeObjectURL(S.sa._url); } catch(e){}
      S.sa=null;
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState='none';
      log('🔓 静音保活已停止');
    }
    syncUI();
  }

  function setupDrag(root, orb, panel) {
    let drag=false, sx=0, sy=0, ox=0, oy=0, moved=false;
    const onStart=(cx,cy)=>{ drag=true; moved=false; orb._dragged=false; const r=root.getBoundingClientRect(); sx=cx; sy=cy; ox=r.left; oy=r.top; orb.classList.add('drag'); };
    const onMove=(cx,cy)=>{
      if(!drag) return;
      const dx=cx-sx, dy=cy-sy;
      if(Math.abs(dx)+Math.abs(dy)>4){ moved=true; orb._dragged=true; }
      const w=TOP.innerWidth, h=TOP.innerHeight;
      const nx=Math.max(0,Math.min(w-48,ox+dx)), ny=Math.max(0,Math.min(h-48,oy+dy));
      root.style.left=nx+'px'; root.style.top=ny+'px'; root.style.right='auto'; root.style.bottom='auto';
      panel.classList.toggle('above', ny>h/2);
      panel.classList.toggle('below', ny<=h/2);
      panel.classList.toggle('right', nx>w/2);
      panel.classList.toggle('left', nx<=w/2);
    };
    const onEnd=()=>{
      if(!drag) return; drag=false; orb.classList.remove('drag');
      if(moved){ const r=root.getBoundingClientRect(); S.config.posX=r.left; S.config.posY=r.top; saveConfig(); setTimeout(()=>{orb._dragged=false;},100); }
    };
    orb.addEventListener('mousedown', e=>{ onStart(e.clientX,e.clientY); e.preventDefault(); });
    DOC.addEventListener('mousemove', e=>onMove(e.clientX,e.clientY));
    DOC.addEventListener('mouseup', onEnd);
    orb.addEventListener('touchstart', e=>{const t=e.touches[0]; onStart(t.clientX,t.clientY);},{passive:true});
    DOC.addEventListener('touchmove', e=>{if(!drag)return; const t=e.touches[0]; onMove(t.clientX,t.clientY);},{passive:true});
    DOC.addEventListener('touchend', onEnd);
  }

  function init() {
    mountUI();
    renderPL();
    syncUI();
    try { setAudioSettings('bgm', { enabled:true, muted:false, volume:S.config.volume, mode: S.shuffle?'shuffle':'repeat_all' }); } catch(e){}
    if (S.silKA) startSA();
    console.log('[AngelTears] 天使泪播放器已启动 ✨');
  }

  if (DOC.readyState === 'loading') DOC.addEventListener('DOMContentLoaded', init);
  else init();
})();
