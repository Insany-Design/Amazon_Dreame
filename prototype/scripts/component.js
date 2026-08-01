class Component extends DCLogic {
  state = { model: 0, modelOpen: false, video: 0, pet: 1, slide: 0, acc: 2, sticky: false, daysP: 0, navTop: window.innerWidth <= 767 ? 96 : 60, navVisible: true };
  daysEl = React.createRef();
  productStageEl = React.createRef();
  productVideoEl = React.createRef();
  dockVideoEl = React.createRef();
  componentDidMount() {
    this._onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const s = scrollTop > 720;
      const amazonHeader = document.querySelector('.amazon-header');
      const amazonHeight = amazonHeader ? amazonHeader.getBoundingClientRect().height : (window.innerWidth <= 767 ? 96 : 60);
      const navTop = Math.max(0, amazonHeight - scrollTop);
      const previousScrollTop = this._lastScrollTop ?? scrollTop;
      const scrollDelta = scrollTop - previousScrollTop;
      let navVisible = this.state.navVisible;
      if (scrollTop <= amazonHeight) navVisible = true;
      else if (scrollDelta > 2) navVisible = false;
      else if (scrollDelta < -2) navVisible = true;
      this._lastScrollTop = scrollTop;
      const nextState = {};
      if (s !== this.state.sticky) nextState.sticky = s;
      if (Math.abs(navTop - this.state.navTop) > 0.5) nextState.navTop = navTop;
      if (navVisible !== this.state.navVisible) nextState.navVisible = navVisible;
      const el = this.daysEl.current;
      if (el) {
        const total = Math.max(1, el.offsetHeight - window.innerHeight);
        const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
        if (Math.abs(p - this.state.daysP) > 0.003 || (p === 1) !== (this.state.daysP === 1)) nextState.daysP = p;
      }
      const productStage = this.productStageEl.current;
      if (productStage) {
        const total = Math.max(1, productStage.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -productStage.getBoundingClientRect().top / total));
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        productStage.style.setProperty('--product-zoom', reduceMotion ? '1' : (1 + progress * 0.2).toFixed(4));
      }
      if (this._progressEl) {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        this._progressEl.style.transform = 'scaleX(' + Math.min(1, Math.max(0, scrollTop / maxScroll)) + ')';
      }
      if (this._navSectionLinks) {
        let activeId = 'overview';
        this._navSectionLinks.forEach(({ target }) => {
          if (target.getBoundingClientRect().top <= 150) activeId = target.id;
        });
        if (activeId !== this._activeSection) {
          this._activeSection = activeId;
          this._navSectionLinks.forEach(({ link, target }) => {
            const active = target.id === activeId;
            link.classList.toggle('is-current', active);
            if (active) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
          });
        }
      }
      if (Object.keys(nextState).length) this.setState(nextState);
    };
    this._scheduleScroll = () => {
      if (this._scrollFrame) return;
      this._scrollFrame = window.requestAnimationFrame(() => {
        this._scrollFrame = null;
        this._onScroll();
      });
    };
    window.addEventListener('scroll', this._scheduleScroll, { passive: true });
    window.addEventListener('resize', this._scheduleScroll, { passive: true });
    document.addEventListener('scroll', this._scheduleScroll, { passive: true, capture: true });
    if (document.body) document.body.addEventListener('scroll', this._scheduleScroll, { passive: true });
    this._navClickHandlers = [];
    this._navSectionLinks = [];
    document.querySelectorAll('.main-nav a[href^="#"]').forEach((link) => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section) this._navSectionLinks.push({ link, target: section });
      const handler = (event) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        if (this._navScrollFrame) window.cancelAnimationFrame(this._navScrollFrame);
        const scrollingEl = document.scrollingElement || document.documentElement || document.body;
        const start = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const destination = Math.max(0, start + target.getBoundingClientRect().top - 68);
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const duration = reduceMotion ? 0 : 720;
        const startedAt = performance.now();
        const setScroll = (value) => {
          if (scrollingEl) scrollingEl.scrollTop = value;
          document.documentElement.scrollTop = value;
          document.body.scrollTop = value;
        };
        const animate = (now) => {
          const progress = duration === 0 ? 1 : Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setScroll(start + (destination - start) * eased);
          if (progress < 1) this._navScrollFrame = window.requestAnimationFrame(animate);
          else {
            this._navScrollFrame = null;
            if (history.replaceState) history.replaceState(null, '', link.getAttribute('href'));
          }
        };
        this._navScrollFrame = window.requestAnimationFrame(animate);
      };
      link.addEventListener('click', handler);
      this._navClickHandlers.push({ link, handler });
    });
    const featureVideo = this.productVideoEl.current;
    if (featureVideo) {
      featureVideo.muted = true;
      featureVideo.loop = true;
      featureVideo.playsInline = true;
      featureVideo.load();
      const playback = featureVideo.play();
      if (playback && playback.catch) playback.catch(() => {});
    }
    const dockVideo = this.dockVideoEl.current;
    if (dockVideo) {
      dockVideo.muted = true;
      dockVideo.loop = true;
      dockVideo.playsInline = true;
      dockVideo.load();
      const playback = dockVideo.play();
      if (playback && playback.catch) playback.catch(() => {});
    }
    const dockControl = document.querySelector('.dock-control');
    if (dockControl && 'IntersectionObserver' in window) {
      this._dockControlObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this._dockControlObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.45, rootMargin: '0px 0px -8% 0px' });
      this._dockControlObserver.observe(dockControl);
    } else if (dockControl) dockControl.classList.add('is-visible');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Keep fixed and sticky compositions out of transformed containers. A transformed
    // ancestor changes the containing block of position:fixed elements such as the header.
    const motionTargets = Array.from(document.querySelectorAll('.sc-host > section, .sc-host > footer'));
    motionTargets.forEach((target) => target.classList.add('motion-section'));
    if (!reduceMotion && 'IntersectionObserver' in window) {
      this._motionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('motion-visible');
          this._motionObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });
      motionTargets.forEach((target) => this._motionObserver.observe(target));
    } else motionTargets.forEach((target) => target.classList.add('motion-visible'));
    if (!document.documentElement.classList.contains('figma-export') && !reduceMotion) {
      this._progressEl = document.createElement('div');
      this._progressEl.className = 'page-progress';
      this._progressEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this._progressEl);
    }
    this._onScroll();
    window.requestAnimationFrame(() => document.documentElement.classList.remove('prototype-loading'));
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this._scheduleScroll);
    window.removeEventListener('resize', this._scheduleScroll);
    document.removeEventListener('scroll', this._scheduleScroll, true);
    if (document.body) document.body.removeEventListener('scroll', this._scheduleScroll);
    if (this._scrollFrame) window.cancelAnimationFrame(this._scrollFrame);
    if (this._navScrollFrame) window.cancelAnimationFrame(this._navScrollFrame);
    if (this.productVideoEl.current) this.productVideoEl.current.pause();
    if (this.dockVideoEl.current) this.dockVideoEl.current.pause();
    if (this._dockControlObserver) this._dockControlObserver.disconnect();
    if (this._motionObserver) this._motionObserver.disconnect();
    if (this._progressEl) this._progressEl.remove();
    (this._navClickHandlers || []).forEach(({ link, handler }) => link.removeEventListener('click', handler));
  }
  renderVals() {
    const st = this.state;
    const models = [
      { name: 'Dreame L50 Ultra' },
      { name: 'Dreame X50 Ultra' },
      { name: 'Dreame L40 Ultra' }
    ];
    const headerModelOptions = models.map((m, i) => ({
      name: m.name,
      on: () => this.setState({ model: i, modelOpen: false }),
      style: {
        width: '100%', border: 0, borderRadius: '9px', cursor: 'pointer', textAlign: 'left',
        padding: '11px 12px', font: (i === st.model ? '600' : '400') + ' 13px Manrope,sans-serif',
        color: i === st.model ? '#fff' : 'rgba(255,255,255,.68)',
        background: i === st.model ? 'rgba(255,255,255,.11)' : 'transparent'
      }
    }));
    const videos = [
      { label: 'Threshold Climbing', time: 0, desc: 'Driven by the ProLeap™ system and its retractable legs, L50 Ultra climbs obstacles up to 2.36in* high and single vertical steps up to 1.65in*, with a shock-absorbing design rated for 30,000 cleaning cycles.' },
      { label: 'Anti-Tangle DuoBrush', time: 10, desc: 'HyperStream™ Detangling DuoBrush handles hair up to 11.81in* long. Strong suction and its innovative air duct design capture hair while preventing tangles, ensuring a calm, low-noise cleaning experience.' },
      { label: 'Dual Flex Arm Reach', time: 20, desc: 'Extendable side brush and mop reach tight corners, narrow gaps, and areas under low-profile furniture, ensuring a 100%* clean of hidden debris.' }
    ];
    const videoTabs = videos.map((v, i) => ({
      label: v.label,
      on: () => {
        this.setState({ video: i });
        window.requestAnimationFrame(() => {
          const media = this.productVideoEl.current;
          if (media) {
            media.muted = true;
            media.loop = true;
            media.currentTime = v.time;
            const playback = media.play();
            if (playback && playback.catch) playback.catch(() => {});
          }
        });
      },
      style: {
        font: (i === st.video ? '600' : '400') + ' 17px Inter,sans-serif',
        color: i === st.video ? '#fff' : '#77777c',
        cursor: 'pointer'
      }
    }));
    const vtWrap = (i) => ({
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer',
      color: i === st.video ? '#fff' : '#5a5a5f'
    });
    const vt0 = { on: videoTabs[0].on, style: videoTabs[0].style, wrap: vtWrap(0) };
    const vt1 = { on: videoTabs[1].on, style: videoTabs[1].style, wrap: vtWrap(1) };
    const vt2 = { on: videoTabs[2].on, style: videoTabs[2].style, wrap: vtWrap(2) };
    const pets = [
      { label: 'Spot People & Pets', image: './assets/official/pet-spot.webp' },
      { label: 'Pet-Finding Mode', image: './assets/official/pet-find.webp' },
      { label: 'Remote Pet Monitoring', image: './assets/official/pet-monitor.webp' }
    ];
    const petTabs = pets.map((p, i) => ({
      label: p.label,
      on: () => this.setState({ pet: i }),
      style: {
        font: (i === st.pet ? '600' : '500') + ' 15px Inter,sans-serif',
        color: i === st.pet ? '#b88449' : '#77777c',
        cursor: 'pointer'
      }
    }));
    const petProgressStyle = {
      position: 'absolute', top: 0, bottom: 0, left: (st.pet * 33.3333) + '%',
      width: '33.3333%', background: '#c79f6c', borderRadius: '99px',
      transition: 'left .25s ease'
    };
    const slides = [
      { title: '2.36in Double-Layer Threshold', image: './assets/official/threshold.webp' },
      { title: '1.65in Single Vertical Step', image: './assets/official/flex-arm.webp' },
      { title: 'Door Tracks & Uneven Floors', image: './assets/official/l50-threshold-profile.jpg' }
    ];
    const cards = [
      { title: 'Matter Compatible', image: './assets/generated/l50-matter-connected-home.jpg', position: '58% center', desc: 'Synchronized connectivity across all smart home devices with Matter protocol compatibility*. Control cleaning with a single app or voice assistant.' },
      { title: 'Custom Carpet Strategies', image: './assets/official/l50-carpet-coverage.jpg', desc: 'Choose mop removal, mop lifting, carpet avoidance, intensive cleaning or suction boost, tailored per carpet in the Dreamehome App.' },
      { title: 'Pet-Finding Mode', image: './assets/official/pet-find.webp', desc: 'Find your pet, capture a photo, and connect through real-time video and two-way voice in the Dreamehome App.' },
      { title: 'Voice Control', image: './assets/generated/l50-voice-control.jpg', position: '70% center', desc: 'Intuitive compatibility with Alexa, Siri, and Google Home* voice assistants for smooth, uninterrupted hands-free control.' },
      { title: 'Instant Sync with Apple Watch', image: './assets/generated/l50-apple-watch-control.jpg', position: '78% center', desc: 'Start, pause, or resume cleaning quickly from your Apple Watch.' },
      { title: 'Long-Lasting Battery Life', image: './assets/generated/l50-internal-battery-cutaway.jpg', position: '64% center', desc: 'A 6,400mAh battery delivers up to 200 minutes* of cleaning and covers up to 2,002ft²* on a single charge, with 30% faster charging.' }
    ];
    const accCards = cards.map((c, i) => ({
      title: c.title,
      icon: i === st.acc ? '×' : '+',
      on: () => this.setState({ acc: i }),
      cardStyle: {
        minHeight: '60px', boxSizing: 'border-box',
        background: i === st.acc ? '#fff' : 'rgba(145,147,152,.26)',
        backdropFilter: i === st.acc ? 'none' : 'blur(14px)',
        WebkitBackdropFilter: i === st.acc ? 'none' : 'blur(14px)',
        border: i === st.acc ? '1px solid #fff' : '1px solid rgba(255,255,255,.14)',
        borderRadius: '14px', padding: '12px 16px', cursor: 'pointer',
        boxShadow: i === st.acc ? '0 14px 38px rgba(0,0,0,.22)' : 'none',
        display: 'flex', alignItems: 'center', gap: '12px',
        transform: 'translateX(0)', transition: 'background .3s ease, box-shadow .3s ease'
      },
      titleStyle: {
        font: '600 15px Inter,sans-serif',
        color: i === st.acc ? '#1d1d1f' : 'rgba(255,255,255,.78)'
      },
      iconStyle: {
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: i === st.acc ? '#1d1d1f' : 'rgba(255,255,255,.12)',
        color: i === st.acc ? '#fff' : 'rgba(255,255,255,.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: '400 16px Inter,sans-serif'
      }
    }));
    const activeCard = cards[st.acc] || cards[0];
    const exportMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('figma') === '1';
    const dp = exportMode ? 1 : st.daysP;
    return {
      daysRef: this.daysEl,
      productVideoRef: this.productVideoEl,
      productStageRef: this.productStageEl,
      dockVideoRef: this.dockVideoEl,
      daysCount: Math.round(dp * 120),
      daysImgStyle: {
        position: 'relative', width: '100%', maxWidth: '1280px', height: 'calc(100vh - 80px)', maxHeight: '720px', borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: "#171a22 url('./assets/official/l50-120-days-water-management.jpg') right center/auto 100% no-repeat",
        overflow: 'hidden',
        transform: 'scale(' + (0.68 + 0.32 * dp) + ')', transformOrigin: 'center center'
      },
      gridOn: !!(this.props.showGrid ?? false),
      gridCols: Array.from({ length: 12 }, (_, i) => i),
      modelOpen: st.modelOpen,
      modelExpanded: st.modelOpen ? 'true' : 'false',
      selectedModelName: models[st.model].name,
      toggleModelMenu: () => this.setState(s => ({ modelOpen: !s.modelOpen })),
      modelChevronStyle: {
        width: '14px', height: '14px', flexShrink: 0,
        transform: st.modelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform .2s ease'
      },
      siteHeaderStyle: {
        position: 'fixed', left: 0, right: 0, top: st.navTop + 'px', width: '100%', maxWidth: 'none', margin: 0,
        paddingLeft: 'max(20px, calc((100vw - 1280px) / 2))', paddingRight: 'max(20px, calc((100vw - 1280px) / 2))',
        height: '68px', display: 'flex', alignItems: 'center',
        justifyContent: 'flex-start', gap: '18px', boxSizing: 'border-box', zIndex: 100,
        background: 'rgba(31,32,34,.78)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,.1)', boxShadow: '0 8px 28px rgba(0,0,0,.16)',
        transform: st.navVisible ? 'translateY(0)' : 'translateY(-115%)',
        transition: 'transform .28s cubic-bezier(.3,.8,.3,1), top .08s linear'
      },
      headerModelOptions, petTabs, petProgressStyle, accCards, vt0, vt1, vt2,
      videoProgressStyle: {
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: (((st.video + 1) / 3) * 100) + '%',
        borderRadius: '99px', background: '#c79f6c',
        transition: 'width .35s ease'
      },
      accTitle: activeCard.title,
      accDesc: activeCard.desc,
      accStageStyle: {
        maxWidth: '1280px', height: '760px', margin: '0 auto', position: 'relative',
        overflow: 'hidden', borderRadius: '28px', backgroundColor: '#202124',
        backgroundImage: "url('" + activeCard.image + "')", backgroundSize: 'cover', backgroundPosition: activeCard.position || 'center', backgroundRepeat: 'no-repeat',
        boxShadow: '0 24px 70px rgba(25,25,25,.14)'
      },
      videoMediaStyle: {
        position: 'relative', height: '560px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1d1d20', overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,.24)'
      },
      videoDesc: videos[st.video].desc,
      petMediaStyle: {
        height: '660px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: "#ecece9 url('" + pets[st.pet].image + "') center/cover no-repeat", overflow: 'hidden'
      },
      slideTitle: slides[st.slide].title,
      slideMediaStyle: {
        flex: 1, height: '600px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: "#1d1d20 url('" + slides[st.slide].image + "') center/cover no-repeat", overflow: 'hidden'
      },
      nextSlideMediaStyle: {
        width: '180px', height: '600px', borderRadius: '12px', flexShrink: 0,
        background: "#161618 url('" + slides[(st.slide + 1) % slides.length].image + "') center/cover no-repeat", overflow: 'hidden'
      },
      slideCount: '0' + (st.slide + 1) + ' / 03',
      prevSlide: () => this.setState(s => ({ slide: (s.slide + 2) % 3 })),
      nextSlide: () => this.setState(s => ({ slide: (s.slide + 1) % 3 })),
      packageItems: [
        { name: 'Robot Vacuum', qty: 'x1', src: './assets/package/robot-vacuum.png' },
        { name: 'Base Station', qty: 'x1', src: './assets/package/base-station.png' },
        { name: 'Main Brush (pre-installed)', qty: 'x1', src: './assets/package/main-brush.png' },
        { name: 'Brush Guard (pre-installed)', qty: 'x1', src: './assets/package/brush-guard.png' },
        { name: 'Side Brush (pre-installed)', qty: 'x1', src: './assets/package/side-brush.png' },
        { name: 'Scale Inhibitor (pre-installed)', qty: 'x1', src: './assets/package/scale-inhibitor.png' },
        { name: 'Dust Box (pre-installed, incl. filter)', qty: 'x1', src: './assets/package/dust-box.png' },
        { name: 'Mop Pad Holder', qty: 'x2', src: './assets/package/mop-pad-holder.png' },
        { name: 'Mop Pad', qty: 'x2', src: './assets/package/mop-pad.png' },
        { name: 'Dust Bag (pre-installed x1)', qty: 'x2', src: './assets/package/dust-bag.png' },
        { name: '200ml Cleaning Solution', qty: 'x1', src: './assets/package/cleaning-solution.png' },
        { name: 'Base Station Ramp Extension', qty: 'x1', src: './assets/package/ramp-extension.png' }
      ],
      socials: [
        { name: 'Instagram', src: 'https://cdn.simpleicons.org/instagram/FFFFFF' },
        { name: 'YouTube', src: 'https://cdn.simpleicons.org/youtube/FFFFFF' },
        { name: 'X', src: 'https://cdn.simpleicons.org/x/FFFFFF' },
        { name: 'Facebook', src: 'https://cdn.simpleicons.org/facebook/FFFFFF' }
      ],
      payments: [
        { name: 'American Express', src: 'https://cdn.simpleicons.org/americanexpress' },
        { name: 'Diners Club', src: 'https://cdn.simpleicons.org/dinersclub' },
        { name: 'Discover', src: 'https://cdn.simpleicons.org/discover' },
        { name: 'JCB', src: 'https://cdn.simpleicons.org/jcb' },
        { name: 'Mastercard', src: 'https://cdn.simpleicons.org/mastercard' },
        { name: 'PayPal', src: 'https://cdn.simpleicons.org/paypal' },
        { name: 'Visa', src: 'https://cdn.simpleicons.org/visa' },
        { name: 'Klarna', src: 'https://cdn.simpleicons.org/klarna' }
      ],
      stickyStyle: {
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 90,
        background: 'rgba(24,24,26,.92)', backdropFilter: 'blur(14px)',
        borderTop: '1px solid rgba(255,255,255,.12)',
        transform: st.sticky ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform .35s cubic-bezier(.3,.8,.3,1)'
      }
    };
  }
}
