/* ============================================================
   台州意园新材料科技有限公司 - 主脚本
   ============================================================ */

// ============ 导航栏 ============
function initNavbar() {
  const toggle = document.querySelector('.navbar-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const backToTop = document.querySelector('.back-to-top');

  if (!toggle || !mobileMenu) return;

  // 移动端菜单切换
  toggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const isOpen = mobileMenu.classList.contains('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // 关闭移动菜单（点击链接后）
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });

  // 滚动显示回到顶部按钮
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop?.classList.add('show');
    } else {
      backToTop?.classList.remove('show');
    }
  });

  // 回到顶部
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 高亮当前页面导航项
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-menu a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ============ 表单处理 ============
function initForm() {
  const form = document.querySelector('#inquiry-form');
  const formSuccess = document.querySelector('.form-success');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 清除旧错误
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

    // 验证
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
      const value = field.value.trim();
      if (!value) {
        field.closest('.form-group').classList.add('error');
        isValid = false;
      } else if (field.type === 'tel' && !/^1[3-9]\d{9}$/.test(value)) {
        field.closest('.form-group').classList.add('error');
        isValid = false;
      }
    });

    if (!isValid) {
      const firstError = form.querySelector('.form-group.error input, .form-group.error select, .form-group.error textarea');
      firstError?.focus();
      return;
    }

    // 收集表单数据
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // 保存到本地（实际项目中这里会发送到服务器）
    const inquiries = JSON.parse(localStorage.getItem('yy_inquiries') || '[]');
    inquiries.push({
      ...data,
      submittedAt: new Date().toISOString()
    });
    localStorage.setItem('yy_inquiries', JSON.stringify(inquiries));

    // 显示成功信息
    form.style.display = 'none';
    if (formSuccess) {
      formSuccess.classList.add('show');
    }

    // 更新成功信息中的时间
    const timeEl = formSuccess?.querySelector('.success-time');
    if (timeEl) {
      timeEl.textContent = new Date().toLocaleString('zh-CN');
    }
  });
}

// ============ 产品数量选择 ============
function initQuantity() {
  const minusBtn = document.querySelector('.qty-minus');
  const plusBtn = document.querySelector('.qty-plus');
  const input = document.querySelector('.qty-input');

  if (!minusBtn || !plusBtn || !input) return;

  minusBtn.addEventListener('click', () => {
    const val = parseInt(input.value) || 1;
    if (val > 1) input.value = val - 1;
  });

  plusBtn.addEventListener('click', () => {
    const val = parseInt(input.value) || 1;
    input.value = val + 1;
  });
}

// ============ 动画入场效果（Intersection Observer） ============
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.category-card, .feature-card, .product-card, .about-content, .about-img-placeholder').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ============ 产品筛选 ============
function filterProducts(category) {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const cardCat = card.dataset.category;
    if (category === 'all' || cardCat === category) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });

  // 更新标签高亮
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('btn-primary', btn.dataset.filter === category);
    btn.classList.toggle('btn-outline', btn.dataset.filter !== category);
  });
}

// ============ 产品点击询盘 ============
function initProductInquiry() {
  document.querySelectorAll('.product-card').forEach(card => {
    const name = card.querySelector('h3')?.textContent;
    const ctaBtn = card.querySelector('.btn-inquiry');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // 如果有询盘表单页面，跳转到询盘表单并预填产品名
        const inquiryForm = document.querySelector('#inquiry-form');
        const productField = document.querySelector('#product-name');
        if (inquiryForm && productField && name) {
          productField.value = name;
        }
        // 滚动到询盘表单
        document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
}

// ============ 初始化 ============
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initForm();
  initQuantity();
  initScrollAnimations();
  initProductInquiry();
});
