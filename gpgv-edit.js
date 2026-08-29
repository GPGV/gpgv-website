/* GPGV public helpers only.
   Security note: Admin/editor features are intentionally not shipped to public pages.
   /admin.html is protected by Vercel Edge Middleware Basic Auth. */
(function(){
  var API="https://n8n-production-c95fe.up.railway.app/webhook";
  var PAGE=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  function applyMap(map){
    if(!map) return;
    Object.keys(map).forEach(function(sel){
      try{
        var el=document.querySelector(sel); if(!el)return; var v=map[sel];
        if(v&&typeof v==='object'){
          if('html'in v)el.innerHTML=v.html;
          if('src'in v&&el.tagName==='IMG')el.src=v.src;
          if('bg'in v){el.style.backgroundImage='url('+v.bg+')';el.style.backgroundSize='cover';el.style.backgroundPosition='center';}
          if('href'in v&&el.tagName==='A')el.setAttribute('href',v.href);
        } else el.innerHTML=v;
      }catch(e){}
    });
  }

  // Apply published content only. No public live-publish/editor code is included here.
  (async function(){
    try{
      var r=await fetch(API+'/gpgv-content',{cache:'no-store'});
      if(r.ok){var p=await r.json(); if(p&&p[PAGE]) applyMap(p[PAGE]);}
    }catch(e){}
  })();

  window.gpgvSignup=function(form,source){
    try{
      var get=function(sel){var e=form.querySelector(sel);return e?e.value.trim():'';};
      var email=get('input[type=email]')||get('[name=email]');
      var name=get('[name=name]')||'';
      var phone=get('[name=phone]')||'';
      var body=new URLSearchParams();
      body.set('name',name); body.set('email',email); body.set('phone',phone);
      body.set('business',source||PAGE); body.set('industry','website signup');
      body.set('notes','Signup via '+(source||PAGE)+' — '+location.href);
      fetch(API+'/contact',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()}).catch(function(){});
    }catch(e){}
    return true;
  };

  window.gpgvShare=function(opts){
    opts=opts||{}; var url=opts.url||location.href, title=opts.title||document.title, text=opts.text||title;
    function esc(s){return String(s==null?'':s).replace(/[<>&]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c];});}
    var enc=encodeURIComponent, u=enc(url), t=enc(text);
    var items=[
      {l:'📋 Copy link',f:function(){(navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(function(){c.textContent='✓ Link copied!';},function(){window.prompt('Copy this link:',url);});}},
      {l:'𝕏  Post on X',h:'https://twitter.com/intent/tweet?text='+t+'&url='+u},
      {l:'f  Facebook',h:'https://www.facebook.com/sharer/sharer.php?u='+u},
      {l:'✆  WhatsApp',h:'https://wa.me/?text='+t+'%20'+u},
      {l:'✉  Email',h:'mailto:?subject='+enc(title)+'&body='+t+'%0A%0A'+u}
    ];
    if(navigator.share)items.unshift({l:'📱 Share…',f:function(){navigator.share({title:title,text:text,url:url}).catch(function(){});}});
    var ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:1000000;display:flex;align-items:center;justify-content:center;padding:20px';
    var box=document.createElement('div');box.style.cssText='background:#16131c;border:1px solid #2a2536;border-radius:16px;padding:20px;max-width:330px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.5)';
    box.innerHTML='<div style="font:700 16px system-ui;color:#f1eef5;margin-bottom:3px">Share</div><div style="font:13px system-ui;color:#9a93a8;margin-bottom:14px">'+esc(title)+'</div>';
    items.forEach(function(it){var b=document.createElement(it.h?'a':'button');b.textContent=it.l;b.style.cssText='display:block;width:100%;text-align:left;background:#221d2c;color:#eee;border:1px solid #2a2536;border-radius:10px;padding:11px 14px;margin:7px 0;cursor:pointer;font:600 14px system-ui;text-decoration:none';if(it.h){b.href=it.h;b.target='_blank';b.rel='noopener';b.onclick=function(){setTimeout(close,250);};}else b.onclick=function(){it.f();};box.appendChild(b);});
    var c=document.createElement('button');c.textContent='Close';c.style.cssText='display:block;width:100%;background:none;color:#9a93a8;border:none;padding:11px;margin-top:6px;cursor:pointer;font:13px system-ui';c.onclick=close;box.appendChild(c);
    function close(){ov.remove();}
    ov.onclick=function(e){if(e.target===ov)close();};ov.appendChild(box);document.body.appendChild(ov);
  };

  function wireSignups(){
    document.querySelectorAll('form[data-signup]').forEach(function(f){
      if(f.getAttribute('data-wired'))return; f.setAttribute('data-wired','1');
      var label=f.getAttribute('data-signup')||PAGE;
      var msg=f.getAttribute('data-thanks')||"You're in — we'll be in touch. 🌿";
      f.addEventListener('submit',function(ev){ev.preventDefault();gpgvSignup(f,label);f.innerHTML='<p style="font-size:16px;line-height:1.5">'+msg+'</p>';});
    });
  }
  if(document.readyState!=='loading') wireSignups(); else window.addEventListener('DOMContentLoaded',wireSignups);
})();
