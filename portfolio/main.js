/**
 * 王花生个人作品集 · 交互逻辑
 * 负责：导航交互、滚动动画、内容渲染（从 data.js 读取）
 */

/* ── 工具函数 ─────────────────────────────────────────────── */

/** 安全转义 HTML，防止 XSS */
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 图标映射（社交媒体） */
const ICONS = {
  wechat:  "💬",
  github:  "🐙",
  weibo:   "🌐",
  email:   "✉️",
  default: "🔗"
};

/* ── 导航栏 ───────────────────────────────────────────────── */

function initNavbar() {
  const navbar    = document.getElementById("navbar");
  const toggle    = document.getElementById("navToggle");
  const mobileNav = document.getElementById("navMobile");

  // 滚动时导航背景变化
  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 汉堡菜单
  toggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // 点击移动端菜单链接后关闭菜单
  mobileNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // 点击页面其他区域关闭移动端菜单
  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target)) {
      mobileNav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ── 当前区块高亮（Intersection Observer）────────────────── */

function initActiveSection() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a, .nav-mobile a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute("href");
            link.classList.toggle("active", href === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach(section => observer.observe(section));
}

/* ── 滚动淡入动画 ─────────────────────────────────────────── */

function initScrollAnimation() {
  const elements = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach(el => observer.observe(el));
}

/* ── 渲染：关于我 ─────────────────────────────────────────── */

function renderAbout() {
  const { profile, highlights } = SITE_DATA;

  // 简介
  const bioEl = document.getElementById("aboutBio");
  if (bioEl) bioEl.textContent = profile.bio;

  // 标签
  const tagsEl = document.getElementById("aboutTags");
  if (tagsEl) {
    tagsEl.innerHTML = profile.tags
      .map(tag => `<span class="tag" role="listitem">${esc(tag)}</span>`)
      .join("");
  }

  // 亮点卡片
  const highlightsEl = document.getElementById("highlightsGrid");
  if (highlightsEl) {
    highlightsEl.innerHTML = highlights.map(h => `
      <div class="highlight-card" role="listitem">
        <div class="highlight-icon" aria-hidden="true">${esc(h.icon)}</div>
        <div>
          <div class="highlight-value">${esc(h.value)}</div>
          <div class="highlight-label">${esc(h.label)}</div>
        </div>
      </div>
    `).join("");
  }
}

/* ── 渲染：工作经历 ───────────────────────────────────────── */

function renderExperience() {
  const timelineEl = document.getElementById("timeline");
  if (!timelineEl) return;

  timelineEl.innerHTML = SITE_DATA.experience.map(exp => `
    <div class="timeline-item" role="listitem">
      <div class="timeline-card" data-id="${esc(exp.id)}" tabindex="0"
           role="button" aria-expanded="false"
           aria-label="${esc(exp.company)} - ${esc(exp.role)}，点击展开详情">
        <div class="timeline-header">
          <div class="timeline-meta">
            <div class="timeline-company">${esc(exp.company)}</div>
            <div class="timeline-role">${esc(exp.role)}</div>
            <div class="timeline-period">${esc(exp.period)}</div>
            <div class="timeline-summary">${esc(exp.summary)}</div>
          </div>
          <div class="timeline-toggle" aria-hidden="true">▾</div>
        </div>
        <div class="timeline-detail">
          <p>${esc(exp.desc)}</p>
          <div class="achievements" role="list" aria-label="关键成就">
            ${exp.achievements.map(a =>
              `<span class="achievement-badge" role="listitem">${esc(a)}</span>`
            ).join("")}
          </div>
        </div>
      </div>
    </div>
  `).join("");

  // 展开/收起交互
  timelineEl.querySelectorAll(".timeline-card").forEach(card => {
    function toggle() {
      const isExpanded = card.classList.toggle("expanded");
      card.setAttribute("aria-expanded", String(isExpanded));
    }
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
}

/* ── 渲染：技能专长 ───────────────────────────────────────── */

function renderSkills() {
  const skillsEl = document.getElementById("skillsGrid");
  if (!skillsEl) return;

  const categories = [
    { key: "industry", label: "行业技能" },
    { key: "digital",  label: "数字技能" },
    { key: "ai",       label: "AI 工具" }
  ];

  skillsEl.innerHTML = categories.map(cat => {
    const skills = SITE_DATA.skills[cat.key] || [];
    return `
      <div class="skill-category" role="listitem">
        <div class="skill-category-title">${esc(cat.label)}</div>
        <div class="skill-tags" role="list" aria-label="${esc(cat.label)}技能列表">
          ${skills.map(s => `
            <span class="skill-tag" role="listitem">
              ${esc(s.name)}
              <span class="level">${esc(s.level)}</span>
            </span>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");
}

/* ── 渲染：项目作品集 ─────────────────────────────────────── */

function renderProjects() {
  const gridEl = document.getElementById("projectsGrid");
  if (!gridEl) return;

  if (SITE_DATA.projects.length === 0) {
    gridEl.innerHTML = `<p style="color:var(--text-muted)">项目即将上线，敬请期待。</p>`;
    return;
  }

  gridEl.innerHTML = SITE_DATA.projects.map(p => `
    <a href="projects/${esc(p.id)}.html" class="project-card" role="listitem"
       aria-label="${esc(p.title)} - ${esc(p.desc)}">
      <div class="project-image">
        ${p.image
          ? `<img src="${esc(p.image)}" alt="${esc(p.title)}项目截图" loading="lazy" />`
          : `<div class="project-image-placeholder" aria-hidden="true">🚀</div>`
        }
        ${p.status ? `<span class="project-status">${esc(p.status)}</span>` : ""}
      </div>
      <div class="project-body">
        <h3 class="project-title">${esc(p.title)}</h3>
        <p class="project-desc">${esc(p.desc)}</p>
        <div class="project-tags" role="list" aria-label="技术标签">
          ${p.tags.map(t => `<span class="project-tag" role="listitem">${esc(t)}</span>`).join("")}
        </div>
      </div>
    </a>
  `).join("");
}

/* ── 渲染：航海案例 ───────────────────────────────────────── */

function renderVoyage() {
  const gridEl = document.getElementById("voyageGrid");
  if (!gridEl) return;

  if (SITE_DATA.voyage.length === 0) {
    gridEl.innerHTML = `<p style="color:var(--text-muted)">航海案例整理中，敬请期待。</p>`;
    return;
  }

  gridEl.innerHTML = SITE_DATA.voyage.map(v => `
    <a href="voyage/${esc(v.id)}.html" class="voyage-card" role="listitem"
       aria-label="${esc(v.title)}">
      <div class="voyage-cover">
        ${v.coverImage
          ? `<img src="${esc(v.coverImage)}" alt="${esc(v.title)}封面" loading="lazy" />`
          : `<span aria-hidden="true">⛵</span>`
        }
      </div>
      <div class="voyage-body">
        <h3 class="voyage-title">${esc(v.title)}</h3>
        <p class="voyage-bg">${esc(v.background)}</p>
        <div class="voyage-tools" role="list" aria-label="使用工具">
          ${v.tools.map(t => `<span class="voyage-tool" role="listitem">${esc(t)}</span>`).join("")}
        </div>
      </div>
    </a>
  `).join("");
}

/* ── 渲染：联系方式 ───────────────────────────────────────── */

function renderContact() {
  const { contact } = SITE_DATA;

  const introEl = document.getElementById("contactIntro");
  if (introEl) introEl.textContent = contact.intro;

  const responseEl = document.getElementById("contactResponse");
  if (responseEl) responseEl.textContent = contact.responseTime;

  const linksEl = document.getElementById("contactLinks");
  if (!linksEl) return;

  const items = [];

  // 邮箱
  if (contact.email) {
    items.push(`
      <a href="mailto:${esc(contact.email)}" class="contact-link" role="listitem"
         aria-label="发送邮件至 ${esc(contact.email)}">
        <div class="contact-link-icon" aria-hidden="true">✉️</div>
        <div>
          <div class="contact-link-label">电子邮件</div>
          <div class="contact-link-value">${esc(contact.email)}</div>
        </div>
      </a>
    `);
  } else {
    items.push(`
      <div class="contact-link" role="listitem">
        <div class="contact-link-icon" aria-hidden="true">✉️</div>
        <div>
          <div class="contact-link-label">电子邮件</div>
          <div class="contact-link-value" style="color:var(--text-muted)">（即将更新）</div>
        </div>
      </div>
    `);
  }

  // 社交媒体
  contact.social.forEach(s => {
    const icon = ICONS[s.icon] || ICONS.default;
    const inner = `
      <div class="contact-link-icon" aria-hidden="true">${icon}</div>
      <div>
        <div class="contact-link-label">${esc(s.label)}</div>
        <div class="contact-link-value">${s.url ? esc(s.name) : "（即将更新）"}</div>
      </div>
    `;
    if (s.url) {
      items.push(`
        <a href="${esc(s.url)}" class="contact-link" role="listitem"
           target="_blank" rel="noopener noreferrer"
           aria-label="访问 ${esc(s.label)}">
          ${inner}
        </a>
      `);
    } else {
      items.push(`<div class="contact-link" role="listitem">${inner}</div>`);
    }
  });

  linksEl.innerHTML = items.join("");
}

/* ── 初始化 ───────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  // 渲染内容
  renderAbout();
  renderExperience();
  renderSkills();
  renderProjects();
  renderVoyage();
  renderContact();

  // 交互
  initNavbar();
  initActiveSection();
  initScrollAnimation();
});
