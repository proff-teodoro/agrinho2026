/* ============================================================
   AGRO FORTE, FUTURO SUSTENTÁVEL
   script.js — Interatividade e animações
   ============================================================ */

'use strict';

/* ── Barra de progresso de leitura ─────────────────────────── */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = progresso + '%';
  }, { passive: true });
}

/* ── Menu mobile ───────────────────────────────────────────── */
function initMenuMobile() {
  const toggle = document.getElementById('menu-toggle');
  const links  = document.getElementById('navbar-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const aberto = links.classList.toggle('aberto');
    toggle.setAttribute('aria-expanded', String(aberto));
  });

  // Fechar ao clicar em link
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('aberto');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── Navbar scroll: sombra ao rolar ────────────────────────── */
function initNavbarScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(0,0,0,0.25)' : 'none';
  }, { passive: true });
}

/* ── IntersectionObserver genérico para .reveal ────────────── */
function initReveal() {
  const elementos = document.querySelectorAll('.reveal');
  if (!elementos.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Atraso escalonado para grupos de cards
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visivel');
        }, Number(delay));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elementos.forEach(el => obs.observe(el));
}

/* ── Contador animado ──────────────────────────────────────── */
function animarContador(el, inicio, fim, duracao, sufixo = '') {
  let startTime = null;
  const easingOut = t => 1 - Math.pow(1 - t, 3);

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progresso = Math.min((timestamp - startTime) / duracao, 1);
    const valor = Math.round(inicio + (fim - inicio) * easingOut(progresso));
    el.textContent = valor.toLocaleString('pt-BR') + sufixo;
    if (progresso < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initContadores() {
  const contadores = document.querySelectorAll('[data-contador]');
  if (!contadores.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const fim    = parseFloat(el.dataset.contador);
        const sufixo = el.dataset.sufixo || '';
        const dur    = parseInt(el.dataset.duracao || '1800');
        animarContador(el, 0, fim, dur, sufixo);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  contadores.forEach(el => obs.observe(el));
}

/* ── Barras animadas (biomas / comparativo) ────────────────── */
function initBarras() {
  const barras = document.querySelectorAll('[data-largura]');
  if (!barras.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.largura + '%';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  barras.forEach(el => obs.observe(el));
}

/* ── Accordion (Mitos & Verdades) ──────────────────────────── */
function initAccordion() {
  const botoes = document.querySelectorAll('.accordion-btn');
  if (!botoes.length) return;

  botoes.forEach(btn => {
    btn.addEventListener('click', () => {
      const conteudo = btn.nextElementSibling;
      const estaAberto = conteudo.classList.contains('aberto');

      // Fecha todos
      document.querySelectorAll('.accordion-conteudo').forEach(c => c.classList.remove('aberto'));
      document.querySelectorAll('.accordion-btn').forEach(b => b.classList.remove('ativo'));

      // Abre o clicado (se estava fechado)
      if (!estaAberto) {
        conteudo.classList.add('aberto');
        btn.classList.add('ativo');
      }
    });
  });
}

/* ── Gráfico de barras: produção de grãos ──────────────────── */
const dadosGrafico = [
  { ano: '2000/01', valor: 98.8,  cor: 'verde' },
  { ano: '2005/06', valor: 119.1, cor: 'verde' },
  { ano: '2010/11', valor: 161.4, cor: 'verde' },
  { ano: '2015/16', valor: 185.2, cor: 'verde' },
  { ano: '2018/19', valor: 239.2, cor: 'verde' },
  { ano: '2020/21', valor: 251.8, cor: 'verde' },
  { ano: '2022/23', valor: 322.0, cor: 'laranja' },
  { ano: '2023/24', valor: 312.8, cor: 'laranja' },
];

function buildGrafico() {
  const wrap = document.getElementById('grafico-graos');
  if (!wrap) return;

  const maxVal = Math.max(...dadosGrafico.map(d => d.valor));

  wrap.innerHTML = dadosGrafico.map(d => {
    const pct = (d.valor / maxVal * 100).toFixed(1);
    return `
      <div class="bar-row reveal">
        <span class="bar-ano">${d.ano}</span>
        <div class="bar-outer" role="progressbar" aria-valuenow="${d.valor}" aria-valuemin="0" aria-valuemax="${maxVal}" aria-label="Produção ${d.ano}">
          <div class="bar-inner ${d.cor}" data-largura="${pct}"></div>
        </div>
        <span class="bar-valor">${d.valor.toLocaleString('pt-BR')} Mt</span>
      </div>`;
  }).join('');
}

/* ── Tooltip simples nos cards ─────────────────────────────── */
function initTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      const tip = document.createElement('div');
      tip.className = 'tooltip-box';
      tip.textContent = el.dataset.tooltip;
      tip.style.cssText = `
        position:fixed; background:#1E2D24; color:#F0F4F1;
        padding:6px 12px; border-radius:6px; font-size:0.78rem;
        pointer-events:none; z-index:9999; max-width:220px;
        line-height:1.5; box-shadow:0 4px 16px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(tip);

      const mover = (ev) => {
        tip.style.left = (ev.clientX + 14) + 'px';
        tip.style.top  = (ev.clientY - 30) + 'px';
      };
      el.addEventListener('mousemove', mover);
      el.addEventListener('mouseleave', () => {
        tip.remove();
        el.removeEventListener('mousemove', mover);
      }, { once: true });
    });
  });
}

/* ── Smooth scroll para âncoras ────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const alvo = document.querySelector(link.getAttribute('href'));
      if (!alvo) return;
      e.preventDefault();
      const topo = alvo.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: topo, behavior: 'smooth' });
    });
  });
}

/* ── Botão "voltar ao topo" ────────────────────────────────── */
function initVoltarTopo() {
  const btn = document.getElementById('btn-topo');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 500 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 500 ? 'auto' : 'none';
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Adiciona atrasos escalonados aos cards em grupos ──────── */
function escalonarCards() {
  document.querySelectorAll('.cards-producao, .biomas-grid, .comp-grid').forEach(grupo => {
    grupo.querySelectorAll('.reveal').forEach((card, i) => {
      card.dataset.delay = i * 100;
    });
  });
}

/* ── Ano dinâmico no rodapé ────────────────────────────────── */
function initAnoRodape() {
  const el = document.getElementById('ano-atual');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── Destaque de link ativo na navbar ──────────────────────── */
function initNavAtivo() {
  const secoes = document.querySelectorAll('section[id]');
  const links  = document.querySelectorAll('.navbar-links a');
  if (!secoes.length || !links.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('ativo-nav'));
        const link = document.querySelector(`.navbar-links a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('ativo-nav');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  secoes.forEach(s => obs.observe(s));
}

/* ── Inicialização geral ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildGrafico();       // Constrói gráfico antes de iniciar observers
  escalonarCards();     // Aplica delays antes do IntersectionObserver
  initProgressBar();
  initMenuMobile();
  initNavbarScroll();
  initReveal();
  initContadores();
  initBarras();
  initAccordion();
  initTooltips();
  initSmoothScroll();
  initVoltarTopo();
  initAnoRodape();
  initNavAtivo();
});
