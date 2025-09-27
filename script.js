// ===== Música autoplay con bypass de restricciones =====
const bgAudio = document.getElementById('bgAudio');
bgAudio.play().catch(()=>{ 
  console.log('Autoplay bloqueado, esperando interacción del usuario');
});
document.body.addEventListener('click', function enableAudio(){
  bgAudio.muted = false;
  bgAudio.play();
  document.body.removeEventListener('click', enableAudio);
});

// ===== Utilidades =====
const $ = (q,ctx=document)=>ctx.querySelector(q);
const pad = n => n<10 ? '0'+n : ''+n;

const body = document.body;
const isoWhen = body.dataset.when;
const place   = body.dataset.lugar || '';
const addr    = body.dataset.dir   || '';
const names   = body.dataset.name  || 'Derian Hernandez & Leslin Bernales';
const ages    = body.dataset.edad  || '30 & 28 años';
const waNum   = body.dataset.wa    || '51988343240';

// ===== Partículas minimalistas =====
(function particles(){
  const chars = ['◆','●','✦'];
  const layers = [$('#layerA'), $('#layerB'), $('#layerC')];
  const counts = [22, 18, 14];
  layers.forEach((layer, idx)=>{
    for(let i=0;i<counts[idx];i++){
      const el = document.createElement('i');
      el.className = 'particle';
      const ch = chars[Math.floor(Math.random()*chars.length)];
      el.dataset.char = ch;
      el.dataset.shape = (ch==='●'?'dot': (ch==='◆'?'diamond':'star'));
      el.style.left = (Math.random()*100)+'vw';
      el.style.bottom = (-10 - Math.random()*30)+'vh';
      el.style.animationDuration = (18 + Math.random()*12) * (1 + idx*0.25) + 's';
      el.style.animationDelay = (Math.random()*10)+'s';
      el.style.fontSize = (10 + Math.random()*20) + 'px';
      el.style.setProperty('--z', (-120 + idx*60)+'px');
      layer.appendChild(el);
    }
  });
})();

// ===== Countdown y fecha legible =====
(function countdown(){
  const target = new Date(isoWhen);
  const dd=$('#dd'), hh=$('#hh'), mm=$('#mm'), ss=$('#ss'), human=$('#humanWhen');
  try{
    const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' };
    human.textContent = target.toLocaleString('es-PE', opts);
  }catch(e){ human.textContent = target.toString(); }

  function tick(){
    const now = new Date();
    let diff = Math.max(0, target - now);
    const S=1000, M=60*S, H=60*M, D=24*H;
    const d = Math.floor(diff/D); diff%=D;
    const h = Math.floor(diff/H); diff%=H;
    const m = Math.floor(diff/M); diff%=M;
    const s = Math.floor(diff/S);
    dd.textContent = pad(d); hh.textContent = pad(h); mm.textContent = pad(m); ss.textContent = pad(s);
  }
  tick(); setInterval(tick, 1000);
})();

// ===== Acciones: Maps / Share / ICS =====
(function actions(){
  const btnMaps = $('#btnMaps');
  const q = encodeURIComponent((place? (place+', '):'') + addr);
  btnMaps.href = 'https://www.google.com/maps?q=' + q;
  btnMaps.target = '_blank';

  $('#btnShare')?.addEventListener('click', async ()=>{
    const title = `Invitación • ${names}`;
    const text  = `¡Acompáñanos! ${names} (${ages})\n${place} - ${addr}`;
    try{
      if (navigator.share){
        await navigator.share({title, text, url: location.href});
      } else {
        await navigator.clipboard.writeText(location.href);
        alert('Enlace copiado. ¡Compártelo!');
      }
    }catch(e){}
  });

  $('#btnICS')?.addEventListener('click', ()=>{
    const start = new Date(isoWhen);
    const end = new Date(start.getTime() + 4*60*60*1000);
    function fmtUTC(d){
      const y=d.getUTCFullYear();
      const m=String(d.getUTCMonth()+1).padStart(2,'0');
      const dd=String(d.getUTCDate()).padStart(2,'0');
      const hh=String(d.getUTCHours()).padStart(2,'0');
      const mm=String(d.getUTCMinutes()).padStart(2,'0');
      const ss=String(d.getUTCSeconds()).padStart(2,'0');
      return `${y}${m}${dd}T${hh}${mm}${ss}Z`;
    }
    const SUMMARY = `Invitación • ${names}`;
    const LOCATION= `${place}${place&&addr?', ':''}${addr}`;
    const DESCRIPTION = `Cumpleaños compartido de ${names} (${ages})`;
    const ICS =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Invitacion HTML Pura//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${crypto.randomUUID ? crypto.randomUUID() : ('inv-'+Date.now())}@inv-html
DTSTAMP:${fmtUTC(new Date())}
DTSTART:${fmtUTC(start)}
DTEND:${fmtUTC(end)}
SUMMARY:${SUMMARY.replace(/[,;]/g,'')}
LOCATION:${LOCATION.replace(/[,;]/g,'')}
DESCRIPTION:${DESCRIPTION.replace(/[,;]/g,'')}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([ICS], {type:'text/calendar;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'evento.ics';
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1000);
  });
})();

// ===== RSVP por WhatsApp y Confetti =====
(function rsvp(){
  const form = $('#rsvpForm');
  const msg = $('#rsvpMsg');
  const waBlank = $('#btnWAblank');
  const confetti = $('#confetti');

  function blastConfetti(x, y){
    confetti.innerHTML=''; const N=120;
    const vw = Math.max(1, innerWidth), vh = Math.max(1, innerHeight);
    const cx = x ?? vw/2, cy = y ?? (vh*0.3);
    for(let i=0;i<N;i++){
      const b=document.createElement('b');
      const dx=(Math.random()*2-1)*(vw*.35);
      const dy=(Math.random()*2-0.2)*(vh*.45);
      b.style.setProperty('--x', cx+'px');
      b.style.setProperty('--y', cy+'px');
      b.style.setProperty('--dx', dx+'px');
      b.style.setProperty('--dy', dy+'px');
      confetti.appendChild(b);
    }
    setTimeout(()=>confetti.innerHTML='', 1100);
  }

  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = form.name?.value?.trim() || '';
    const will = form.will?.value || '';
    if (!name || !will){
      msg.textContent = 'Por favor completa tu nombre y si asistirás.';
      return;
    }
    let t = `Hola, soy ${name}.\n`;
    t += `RSVP: ${will==='yes'?'Asistiremos ✅':'No asistiremos ❌'}\n`;
    t += `Evento: Cumpleaños de ${names} (${ages})\n${place} - ${addr}\n`;
    t += `Fecha: ${new Date(isoWhen).toLocaleString('es-PE',{dateStyle:'full', timeStyle:'short'})}`;

    const url = `https://wa.me/${waNum}?text=${encodeURIComponent(t)}`;
    window.open(url, '_blank');
    msg.innerHTML = '<span class="ok">¡Gracias! Se abrió WhatsApp para enviar tu confirmación.</span>';
    blastConfetti();
    form.reset();
  });

  waBlank?.addEventListener('click', (e)=>{
    e.preventDefault();
    window.open(`https://wa.me/${waNum}`, '_blank');
  });
})();
