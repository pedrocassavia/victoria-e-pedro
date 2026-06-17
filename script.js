/* ============================================================
   APP — Victoria & Pedro · 26.12.2026
   Tudo encapsulado em IIFE; listeners passivos onde aplicável.
   ============================================================ */
(function(){
  'use strict';

  /* --------------------------------------------------------
     1. CONTAGEM REGRESSIVA — 26/12/2026 às 18h00 (BRT)
        • Sem limite de dígitos: funciona com qualquer nº de dias.
        • Atualiza o aria-label com texto legível por leitores de tela.
     -------------------------------------------------------- */
  (function countdown(){
    var target = new Date('2026-12-26T18:00:00-03:00').getTime();
    var grid = document.querySelector('.count-grid');
    var el = {
      d: document.getElementById('cd-days'),
      h: document.getElementById('cd-hours'),
      m: document.getElementById('cd-mins'),
      s: document.getElementById('cd-secs')
    };
    var pad = function(n){ return String(n).padStart(2,'0'); };
    var timer;

    function render(){
      var diff = target - Date.now();

      if (diff <= 0){
        el.d.textContent = el.h.textContent = el.m.textContent = el.s.textContent = '00';
        if (grid) grid.setAttribute('aria-label', 'O grande dia chegou!');
        clearInterval(timer);
        return;
      }

      var SEC = 1000, MIN = SEC*60, HR = MIN*60, DAY = HR*24;
      var days  = Math.floor(diff / DAY);
      var hours = Math.floor((diff % DAY) / HR);
      var mins  = Math.floor((diff % HR) / MIN);
      var secs  = Math.floor((diff % MIN) / SEC);

      /* Sem padStart nos dias: nunca limita a quantidade de dígitos */
      el.d.textContent = String(days);
      el.h.textContent = pad(hours);
      el.m.textContent = pad(mins);
      el.s.textContent = pad(secs);

      if (grid){
        grid.setAttribute('aria-label',
          'Faltam ' + days + ' dias, ' + hours + ' horas, ' + mins +
          ' minutos e ' + secs + ' segundos para o casamento.');
      }
    }

    render();
    timer = setInterval(render, 1000);

    /* Performance: pausa o contador quando a aba está oculta (economiza CPU/bateria) */
    document.addEventListener('visibilitychange', function(){
      if (document.hidden){
        clearInterval(timer);
      } else {
        render();
        timer = setInterval(render, 1000);
      }
    });
  })();

  /* --------------------------------------------------------
     2. REVEAL ON SCROLL (IntersectionObserver)
     -------------------------------------------------------- */
  (function reveal(){
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)){
      els.forEach(function(e){ e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold:.16, rootMargin:'0px 0px -8% 0px' });
    els.forEach(function(e){ io.observe(e); });
  })();

  /* --------------------------------------------------------
     3. NAVBAR — fundo sólido ao rolar + menu mobile
     -------------------------------------------------------- */
  (function navbar(){
    var nav    = document.getElementById('nav');
    var toggle = document.getElementById('nav-toggle');
    var links  = document.getElementById('nav-links');

    /* Estado sólido: usa rAF para evitar trabalho a cada evento de scroll */
    var ticking = false;
    function onScroll(){
      if (!ticking){
        window.requestAnimationFrame(function(){
          nav.classList.toggle('nav--solid', window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();

    /* Abrir/fechar menu mobile */
    function setMenu(open){
      nav.classList.toggle('nav--open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    toggle.addEventListener('click', function(){
      setMenu(!nav.classList.contains('nav--open'));
    });

    /* Fecha ao clicar num link */
    links.addEventListener('click', function(e){
      if (e.target.tagName === 'A') setMenu(false);
    });

    /* Fecha com a tecla Esc (acessibilidade por teclado) */
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && nav.classList.contains('nav--open')) setMenu(false);
    });

    /* Fecha o menu ao voltar para desktop (evita estado preso ao girar/redimensionar) */
    var mq = window.matchMedia('(min-width:761px)');
    function handleMq(e){ if (e.matches) setMenu(false); }
    if (mq.addEventListener){ mq.addEventListener('change', handleMq); }
    else if (mq.addListener){ mq.addListener(handleMq); }   /* fallback navegadores antigos */
  })();

  /* --------------------------------------------------------
     4. COPIAR CHAVE PIX (com fallback) + toast acessível
     -------------------------------------------------------- */
  (function copyPix(){
    var btn   = document.getElementById('copy-pix');
    var key   = document.getElementById('pix-key').textContent.trim();
    var toast = document.getElementById('toast');
    var timer;

    function showToast(){
      toast.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(function(){ toast.classList.remove('show'); }, 2600);
    }

    btn.addEventListener('click', function(){
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(key).then(showToast).catch(legacyCopy);
      } else {
        legacyCopy();
      }
    });

    function legacyCopy(){
      var t = document.createElement('textarea');
      t.value = key; t.setAttribute('readonly','');
      t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch(_){}
      document.body.removeChild(t);
      showToast();
    }
  })();

})();
