import React, { useState, useEffect } from 'react';

const PaymentControlSite = () => {
  // Estados
  const [activeTab, setActiveTab] = useState('pagos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightTheme, setLightTheme] = useState(false);
  const [allFaqOpen, setAllFaqOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Datos del Marketplace
  const marketData = [
    { 
      id:'m1', 
      name:'Publicaciones Pro', 
      price:'$9/mes', 
      icon:'📰', 
      desc:'Programa y publica en redes fácilmente.',
      features: ['Programación automática', 'Analytics avanzados', 'Multi-plataforma', 'API integrada'],
      rating: 4.8,
      users: '2.3k'
    },
    { 
      id:'m2', 
      name:'Logo Maker', 
      price:'$12/mes', 
      icon:'🎨', 
      desc:'Crea logos en segundos con IA.',
      features: ['IA generativa', 'Vectores HD', 'Marca completa', 'Exportación múltiple'],
      rating: 4.9,
      users: '1.8k'
    },
    { 
      id:'m3', 
      name:'WhatsApp Bots', 
      price:'$15/mes', 
      icon:'🤖', 
      desc:'Responde y automatiza conversaciones.',
      features: ['Respuestas inteligentes', 'Workflows', 'CRM integrado', 'Multimedia support'],
      rating: 4.7,
      users: '3.1k'
    },
    { 
      id:'m4', 
      name:'Editor de Imágenes', 
      price:'$7/mes', 
      icon:'🖼️', 
      desc:'Filtros y fondos inteligentes.',
      features: ['Edición automática', 'Efectos premium', 'Batch processing', 'Cloud storage'],
      rating: 4.6,
      users: '1.2k'
    },
    { 
      id:'m5', 
      name:'SEO Assistant', 
      price:'$10/mes', 
      icon:'🔍', 
      desc:'Optimiza títulos y descripciones.',
      features: ['Keywords research', 'Meta optimization', 'Ranking tracker', 'Competencia análisis'],
      rating: 4.8,
      users: '2.7k'
    },
    { 
      id:'m6', 
      name:'Video Shorts', 
      price:'$11/mes', 
      icon:'🎬', 
      desc:'Recorta clips listos para redes.',
      features: ['Auto-clips', 'Subtítulos IA', 'Multi-formato', 'Música library'],
      rating: 4.5,
      users: '1.9k'
    },
    { 
      id:'m7', 
      name:'Audio Cleaner', 
      price:'$8/mes', 
      icon:'🎧', 
      desc:'Reduce ruido en grabaciones.',
      features: ['Noise reduction', 'Voice enhance', 'Audio mastering', 'Real-time preview'],
      rating: 4.7,
      users: '890'
    },
    { 
      id:'m8', 
      name:'eCommerce Ads', 
      price:'$14/mes', 
      icon:'🛒', 
      desc:'Anuncios de catálogo automáticos.',
      features: ['Auto-campaigns', 'A/B testing', 'ROI tracking', 'Audience targeting'],
      rating: 4.8,
      users: '1.5k'
    }
  ];

  // Datos de las apps
  const appsData = {
    pagos: [
      { id: 'p1', title: 'Pagos', desc: 'Procesa cobros y gestiona estatus en tiempo real.', tag: 'Core', icon:'💳' },
      { id: 'p2', title: 'Conciliación', desc: 'Reconciliación automática con reglas y alertas.', tag: 'Auto', icon:'🔁' },
      { id: 'p3', title: 'Notificaciones', desc: 'Avisos de cobro y recordatorios multicanal.', tag: 'Comms', icon:'📣' }
    ],
    facturacion: [
      { id: 'f1', title: 'Facturación', desc: 'Emite, envía y rastrea facturas en un clic.', tag: 'Fiscal', icon:'🧾' },
      { id: 'f2', title: 'Catálogo', desc: 'Productos y precios con impuestos flexibles.', tag: 'Catálogo', icon:'🗂️' },
      { id: 'f3', title: 'Cobranza', desc: 'Seguimiento de cuentas por cobrar eficiente.', tag: 'Flujo', icon:'📥' }
    ],
    reportes: [
      { id: 'r1', title: 'Reportes', desc: 'KPIs y dashboards personalizables por equipo.', tag: 'Analytics', icon:'📊' },
      { id: 'r2', title: 'Exportación', desc: 'Descarga CSV/Excel para auditoría rápida.', tag: 'Datos', icon:'📤' },
      { id: 'r3', title: 'Alertas', desc: 'Umbrales y notificaciones proactivas.', tag: 'Alertas', icon:'🔔' }
    ],
    gastos: [
      { id: 'g1', title: 'Gastos', desc: 'Solicitudes y aprobaciones con políticas.', tag: 'Control', icon:'🧮' },
      { id: 'g2', title: 'Reembolsos', desc: 'Ciclos de pago claros y auditables.', tag: 'Equipo', icon:'💸' },
      { id: 'g3', title: 'Tarjetas', desc: 'Asignación virtual y límites por rol.', tag: 'Tarjetas', icon:'💳' }
    ],
    integraciones: [
      { id: 'i1', title: 'Integraciones', desc: 'Conecta ERP, CRM y data warehouse.', tag: 'API', icon:'🔌' },
      { id: 'i2', title: 'Webhooks', desc: 'Eventos para flujos automáticos.', tag: 'Eventos', icon:'🪝' },
      { id: 'i3', title: 'Single Source', desc: 'Catálogo central de entidades.', tag: 'Maestro', icon:'📚' }
    ]
  };

  // Funciones
  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  const toggleTheme = () => {
    setLightTheme(!lightTheme);
    showToast(lightTheme ? 'Tema oscuro activado.' : 'Tema claro activado.');
  };

  const toggleAllFaq = () => {
    setAllFaqOpen(!allFaqOpen);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAppOpen = (name) => {
    showToast(`Abriendo "${name}" (demostración)…`);
  };

  const handleMarketplaceBuy = (name) => {
    showToast(`Suscribiendo a "${name}" (demo)…`);
  };

  const handleMarketplaceTry = (name) => {
    showToast(`Probando "${name}" (demo)…`);
  };

  // Funciones del carrusel
  const itemsPerSlide = 1; // Solo una card por slide

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % marketData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + marketData.length) % marketData.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-slide del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % marketData.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [marketData.length]);

  // Estilos dinámicos basados en el tema
  const themeClasses = lightTheme 
    ? 'bg-white text-slate-900' 
    : 'bg-slate-900 text-white';

  const heroStyle = lightTheme 
    ? { background: 'linear-gradient(180deg, #F8FAFF 0%, #EAF1FF 100%)' }
    : {
        background: `radial-gradient(1200px 600px at 80% -10%, rgba(31,111,255,0.15), transparent 60%),
                     radial-gradient(900px 500px at 10% 20%, rgba(14,42,107,0.35), transparent 55%),
                     linear-gradient(180deg, #0B1020 0%, #0F1A3A 100%)`
      };

  return (
    <div className={`antialiased ${lightTheme ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
      <style>{`
        .btn-glow { box-shadow: 0 10px 25px rgba(31,111,255,0.35); }
        .card-hover { transition: transform .25s ease, box-shadow .25s ease, background-color .25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,.35); }
        .backdrop { backdrop-filter: blur(6px); }
        @keyframes linePulse { 0% { stroke-dashoffset: 260; } 100% { stroke-dashoffset: 0; } }
        .chart-line { stroke-dasharray: 260; animation: linePulse 1.6s ease forwards; }
      `}</style>

      {/* HEADER */}
      <header className={`sticky top-0 z-50 ${lightTheme ? 'bg-white/70' : 'bg-slate-900/70'} backdrop-blur border-b ${lightTheme ? 'border-slate-200' : 'border-white/10'}`}>
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 grid place-items-center shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12a8 8 0 1016 0 8 8 0 10-16 0Z" stroke="white" strokeOpacity=".85" strokeWidth="1.5"/>
                <path d="M8 15l2.8-7.2c.2-.5.9-.5 1.1 0L15 15" stroke="#AECBFF" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="12" cy="15" r="1.2" fill="#AECBFF"/>
              </svg>
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">The Original Lab</p>
              <p className={`text-xs ${lightTheme ? 'text-slate-500' : 'text-white/60'} -mt-0.5`}>Sistema de Control de Pago</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7">
            <a href="#apps" className={`${lightTheme ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'} transition`}>Apps</a>
            <a href="#beneficios" className={`${lightTheme ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'} transition`}>Beneficios</a>
            <a href="#market" className={`${lightTheme ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'} transition`}>Marketplace</a>
            <a href="#faq" className={`${lightTheme ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'} transition`}>Ayuda</a>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className={`rounded-full border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/15 hover:bg-white/5'} px-4 py-2 text-sm transition`}
            >
              Tema
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden rounded-full border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/15 hover:bg-white/5'} p-2 transition`}
              aria-label="Abrir menú"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${lightTheme ? 'border-slate-200 bg-white/95' : 'border-white/10 bg-slate-900/95'}`}>
            <div className="px-6 py-4 flex flex-col gap-3">
              <a href="#apps" className={`${lightTheme ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white'}`}>Apps</a>
              <a href="#beneficios" className={`${lightTheme ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white'}`}>Beneficios</a>
              <a href="#market" className={`${lightTheme ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white'}`}>Marketplace</a>
              <a href="#faq" className={`${lightTheme ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white'}`}>Ayuda</a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden" style={heroStyle}>
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
          {/* Contenido principal del hero */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 rounded-full border ${lightTheme ? 'border-slate-300 bg-slate-100' : 'border-white/15 bg-white/5'} px-3 py-1.5 text-xs ${lightTheme ? 'text-slate-600' : 'text-white/80'} mb-6`}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Pagos en tiempo real, sin complicaciones
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
              Control total de pagos para <span className={lightTheme ? 'text-blue-600' : 'text-blue-300'}>equipos de tecnología</span>
            </h1>
            <p className={`${lightTheme ? 'text-slate-600' : 'text-white/80'} text-lg max-w-3xl mx-auto mb-8`}>
              Centraliza cobros, conciliaciones, facturación y reportes en un solo lugar. Integrado con tus herramientas y listo para escalar.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <a href="#market" className={`rounded-full ${lightTheme ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-800 hover:bg-white/90'} px-6 py-3 font-semibold transition btn-glow`}>
                Explorar apps
              </a>
              <button className={`rounded-full border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/20 hover:bg-white/5'} px-6 py-3 font-semibold transition`}>
                Ver demo
              </button>
            </div>
            <div className={`flex flex-wrap justify-center items-center gap-8 ${lightTheme ? 'text-slate-500' : 'text-white/60'} text-sm`}>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l9 5v8l-9 5-9-5V8l9-5Z" stroke="currentColor" strokeOpacity=".6" strokeWidth="1.5"/>
                  <path d="M7 12l3 3 7-7" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Encriptado extremo a extremo
              </div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20Z" stroke="currentColor" strokeOpacity=".6" strokeWidth="1.5"/>
                  <path d="M12 6v6l4 2" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Reportes en tiempo real
              </div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7h16v10H4z" stroke="currentColor" strokeOpacity=".6" strokeWidth="1.5"/>
                  <path d="M4 7l8 6 8-6" stroke="#8B5CF6" strokeWidth="1.8"/>
                </svg>
                Integración automática
              </div>
            </div>
          </div>

          {/* Panel resumido prominente */}
          <div className="max-w-5xl mx-auto">
            <div className={`${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border rounded-2xl p-6 lg:p-8 backdrop-blur relative`}>
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background: lightTheme ? 'radial-gradient(800px 300px at 50% 0%, rgba(59,130,246,0.1), transparent)' : 'radial-gradient(800px 300px at 50% 0%, rgba(31,111,255,0.12), transparent)'}}></div>
              
              {/* Header del panel */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  </div>
                  <h3 className="text-lg font-bold">Panel de Control en Tiempo Real</h3>
                </div>
                <span className={`text-xs ${lightTheme ? 'text-slate-500' : 'text-white/60'} px-3 py-1 rounded-full ${lightTheme ? 'bg-slate-200' : 'bg-white/10'}`}>
                  Actualizado hace 30s
                </span>
              </div>
              
              {/* Métricas principales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className={`rounded-xl ${lightTheme ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-white/10'} border p-4 card-hover`}>
                  <p className={`text-xs ${lightTheme ? 'text-slate-500' : 'text-white/60'}`}>Ingresos hoy</p>
                  <p className="mt-2 text-2xl font-extrabold">$ 18,240</p>
                  <p className="text-xs text-emerald-400 mt-1">+8.1%</p>
                </div>
                <div className={`rounded-xl ${lightTheme ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-white/10'} border p-4 card-hover`}>
                  <p className={`text-xs ${lightTheme ? 'text-slate-500' : 'text-white/60'}`}>Pagos pendientes</p>
                  <p className="mt-2 text-2xl font-extrabold">62</p>
                  <p className="text-xs text-amber-300 mt-1">-12 en 24h</p>
                </div>
                <div className={`rounded-xl ${lightTheme ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-white/10'} border p-4 card-hover`}>
                  <p className={`text-xs ${lightTheme ? 'text-slate-500' : 'text-white/60'}`}>Tasa de éxito</p>
                  <p className="mt-2 text-2xl font-extrabold">98.4%</p>
                  <p className="text-xs text-emerald-400 mt-1">+0.3%</p>
                </div>
                <div className={`rounded-xl ${lightTheme ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-white/10'} border p-4 card-hover`}>
                  <p className={`text-xs ${lightTheme ? 'text-slate-500' : 'text-white/60'}`}>Apps activas</p>
                  <p className="mt-2 text-2xl font-extrabold">12</p>
                  <p className="text-xs text-blue-400 mt-1">3 nuevas</p>
                </div>
              </div>
              
              {/* Gráfico de flujo */}
              <div className={`rounded-xl ${lightTheme ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-white/10'} border p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-lg font-semibold ${lightTheme ? 'text-slate-900' : 'text-white'}`}>Flujo de pagos</p>
                    <p className={`text-sm ${lightTheme ? 'text-slate-600' : 'text-white/70'}`}>Últimos 7 días</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 text-xs ${lightTheme ? 'text-slate-500' : 'text-white/60'}`}>
                      <span className="w-3 h-3 rounded-full bg-blue-400"></span> Volumen
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${lightTheme ? 'text-slate-500' : 'text-white/60'}`}>
                      <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Exitosos
                    </div>
                  </div>
                </div>
                <svg viewBox="0 0 400 120" className="w-full h-32">
                  <defs>
                    <linearGradient id="gradBlue" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4A8DFF" stopOpacity="0.7"/>
                      <stop offset="100%" stopColor="#4A8DFF" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="gradGreen" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.7"/>
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Línea principal */}
                  <path d="M20 80 C 60 40, 100 60, 140 45 S 220 75, 260 50 S 340 40, 380 65"
                        className="chart-line" stroke="#4A8DFF" strokeWidth="3" fill="none"></path>
                  <path d="M20 80 C 60 40, 100 60, 140 45 S 220 75, 260 50 S 340 40, 380 65 L 380 110 L 20 110 Z"
                        fill="url(#gradBlue)"></path>
                  
                  {/* Línea secundaria */}
                  <path d="M20 85 C 60 50, 100 70, 140 55 S 220 80, 260 60 S 340 50, 380 75"
                        stroke="#10B981" strokeWidth="2.5" fill="none"></path>
                  <path d="M20 85 C 60 50, 100 70, 140 55 S 220 80, 260 60 S 340 50, 380 75 L 380 110 L 20 110 Z"
                        fill="url(#gradGreen)" fillOpacity="0.3"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPS */}
      <section id="apps" className="relative">
        <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" style={{background: 'radial-gradient(800px 300px at 15% 10%, #1F6FFF33, transparent), radial-gradient(700px 280px at 85% 30%, #0E2A6B66, transparent)'}}></div>

        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20 relative">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full border ${lightTheme ? 'border-slate-300 bg-slate-100' : 'border-white/10 bg-white/5'} px-3 py-1 text-xs ${lightTheme ? 'text-slate-600' : 'text-white/80'} mb-3`}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                Suite modular y escalable
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold">Suite de Apps</h2>
              <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} mt-2 max-w-2xl`}>Incluye elementos gráficos y categorías claras para descubrir más rápido.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.keys(appsData).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  activeTab === tab 
                    ? 'bg-white text-slate-800 font-semibold' 
                    : `border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/15 hover:bg-white/5'}`
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Barra de estado */}
          <div className={`mb-6 rounded-xl border ${lightTheme ? 'border-slate-300 bg-slate-100' : 'border-white/10 bg-slate-800/30'} p-3 flex items-center justify-between`}>
            <div className={`flex items-center gap-2 text-sm ${lightTheme ? 'text-slate-600' : 'text-white/70'}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Listo para usar: cambia de pestaña para ver módulos.
            </div>
            <div className={`hidden sm:flex items-center gap-2 text-xs ${lightTheme ? 'text-slate-500' : 'text-white/60'}`}>
              <span className={`w-24 h-1 rounded-full ${lightTheme ? 'bg-slate-200' : 'bg-white/10'} overflow-hidden`}>
                <span className="block h-full bg-blue-400" style={{width: '60%'}}></span>
              </span>
              Popularidad
            </div>
          </div>

          {/* Carrusel de tarjetas */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-transform">
              {appsData[activeTab]?.map((app) => (
                <article 
                  key={app.id}
                  className={`rounded-2xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-5 card-hover flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg">{app.icon} {app.title}</h4>
                      <span className={`text-xs rounded-full ${lightTheme ? 'bg-slate-200 border-slate-300 text-slate-600' : 'bg-slate-600/30 border-white/10 text-blue-300'} border px-2 py-1`}>{app.tag}</span>
                    </div>
                    <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} mt-2`}>{app.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button 
                      onClick={() => handleAppOpen(app.title)}
                      className="rounded-full bg-blue-500 hover:bg-blue-400 px-4 py-2 text-sm font-semibold text-white btn-glow"
                    >
                      Abrir
                    </button>
                    <button className={`rounded-full border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/20 hover:bg-white/5'} px-4 py-2 text-sm`}>
                      Favorito
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS + MÉTRICAS */}
      <section id="beneficios" className="relative">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          {/* Métricas destacadas */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`rounded-2xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-5 card-hover`}>
              <p className={`${lightTheme ? 'text-slate-500' : 'text-white/60'} text-xs`}>Volumen mensual</p>
              <p className="mt-2 text-3xl font-extrabold">$2.4M</p>
              <div className={`mt-3 h-1.5 ${lightTheme ? 'bg-slate-200' : 'bg-white/10'} rounded-full overflow-hidden`}>
                <span className="block h-full bg-blue-400" style={{width: '78%'}}></span>
              </div>
            </div>
            <div className={`rounded-2xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-5 card-hover`}>
              <p className={`${lightTheme ? 'text-slate-500' : 'text-white/60'} text-xs`}>Órdenes procesadas</p>
              <p className="mt-2 text-3xl font-extrabold">38,210</p>
              <p className="text-emerald-400 text-xs mt-1">+12% este mes</p>
            </div>
            <div className={`rounded-2xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-5 card-hover`}>
              <p className={`${lightTheme ? 'text-slate-500' : 'text-white/60'} text-xs`}>Tiempo medio de pago</p>
              <p className="mt-2 text-3xl font-extrabold">2.3h</p>
              <p className={`${lightTheme ? 'text-slate-500' : 'text-white/60'} text-xs mt-1`}>P95: 5.1h</p>
            </div>
            <div className={`rounded-2xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-5 card-hover`}>
              <p className={`${lightTheme ? 'text-slate-500' : 'text-white/60'} text-xs`}>Tasa de éxito</p>
              <p className="mt-2 text-3xl font-extrabold">98.9%</p>
              <div className={`mt-3 h-1.5 ${lightTheme ? 'bg-slate-200' : 'bg-white/10'} rounded-full overflow-hidden`}>
                <span className="block h-full bg-emerald-400" style={{width: '98.9%'}}></span>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className={`rounded-2xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-6 card-hover`}>
              <div className={`w-10 h-10 rounded-lg ${lightTheme ? 'bg-slate-200' : 'bg-slate-600/30'} grid place-items-center mb-4`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7h16v10H4z" stroke="#8AB4FF" strokeWidth="1.6"/>
                  <path d="M4 7l8 6 8-6" stroke="#4A8DFF" strokeWidth="1.6"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg">Conciliación inteligente</h3>
              <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} mt-2`}>Cruce automático de transacciones con reglas claras y trazables.</p>
            </div>
            <div className={`rounded-2xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-6 card-hover`}>
              <div className={`w-10 h-10 rounded-lg ${lightTheme ? 'bg-slate-200' : 'bg-slate-600/30'} grid place-items-center mb-4`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v20M2 12h20" stroke="#8AB4FF" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg">Escalable por diseño</h3>
              <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} mt-2`}>Desde startups hasta grandes equipos sin perder rendimiento.</p>
            </div>
            <div className={`rounded-2xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-6 card-hover`}>
              <div className={`w-10 h-10 rounded-lg ${lightTheme ? 'bg-slate-200' : 'bg-slate-600/30'} grid place-items-center mb-4`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l9 5-9 5-9-5 9-5Z" stroke="#8AB4FF" strokeWidth="1.6"/>
                  <path d="M12 13v8" stroke="#4A8DFF" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg">Seguridad avanzada</h3>
              <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} mt-2`}>Roles, auditoría y cifrado para cumplir con estándares.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section id="market" className="relative">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full border ${lightTheme ? 'border-slate-300 bg-slate-100' : 'border-white/10 bg-white/5'} px-3 py-1 text-xs ${lightTheme ? 'text-slate-600' : 'text-white/80'} mb-3`}>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Herramientas integradas y listas para usar
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold">Marketplace de Apps</h2>
              <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} mt-2 max-w-2xl`}>Descubre cada herramienta en detalle. Navega por nuestra colección de apps especializadas, cada una diseñada para potenciar tu sistema de pagos.</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={prevSlide}
                className={`rounded-full border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/15 hover:bg-white/5'} p-3 transition group`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button 
                onClick={nextSlide}
                className={`rounded-full border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/15 hover:bg-white/5'} p-3 transition group`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Carrusel */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {marketData.map((item, index) => (
                <div key={item.id} className="w-full flex-shrink-0 flex justify-center">
                  <article className={`rounded-3xl ${lightTheme ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-white/10'} border p-8 card-hover flex max-w-6xl w-full group shadow-lg`}>
                    
                    {/* Lado izquierdo - Imagen/Preview */}
                    <div className="flex-1 pr-8">
                      <div className={`w-full h-80 rounded-2xl ${lightTheme ? 'bg-slate-200' : 'bg-slate-700/50'} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform overflow-hidden`}>
                        <div className="text-center">
                          <div className="text-6xl mb-4">{item.icon}</div>
                          <div className={`text-lg font-medium ${lightTheme ? 'text-slate-600' : 'text-white/70'}`}>Vista previa del sitio web</div>
                          <div className={`text-sm ${lightTheme ? 'text-slate-500' : 'text-white/50'} mt-2`}>Interfaz interactiva de {item.name}</div>
                        </div>
                      </div>
                      
                      {/* Contador de slide */}
                      <div className={`text-center text-sm ${lightTheme ? 'text-slate-400' : 'text-white/40'}`}>
                        {index + 1} de {marketData.length}
                      </div>
                    </div>

                    {/* Lado derecho - Información */}
                    <div className="flex-1 flex flex-col">
                      {/* Header de la card */}
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h4 className="font-bold text-3xl mb-2">{item.name}</h4>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FCD34D"/>
                              </svg>
                              <span className={`text-lg font-medium ${lightTheme ? 'text-slate-700' : 'text-white/90'}`}>{item.rating}</span>
                            </div>
                            <span className={`text-base ${lightTheme ? 'text-slate-500' : 'text-white/60'}`}>({item.users} usuarios)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl rounded-2xl bg-emerald-400/20 text-emerald-300 px-6 py-3 font-bold">{item.price}</span>
                        </div>
                      </div>

                      {/* Descripción */}
                      <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} text-xl mb-8 leading-relaxed`}>{item.desc}</p>

                      {/* Features en 2x2 */}
                      <div className="flex-grow mb-8">
                        <h5 className={`text-sm font-semibold ${lightTheme ? 'text-slate-500' : 'text-white/60'} uppercase tracking-wide mb-6`}>Características destacadas</h5>
                        <div className="grid grid-cols-2 gap-4">
                          {item.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className={`flex items-center gap-3 text-base ${lightTheme ? 'text-slate-600' : 'text-white/80'} p-4 rounded-xl ${lightTheme ? 'bg-slate-100' : 'bg-slate-700/30'}`}>
                              <div className="flex-shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"/>
                                </svg>
                              </div>
                              <span className="font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Acción - Solo botón de suscripción */}
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleMarketplaceBuy(item.name)}
                          className="w-full max-w-sm rounded-2xl bg-blue-500 hover:bg-blue-400 px-8 py-4 text-lg font-semibold text-white btn-glow transition-all transform hover:scale-105"
                        >
                          Suscribirse ahora
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores del carrusel */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {marketData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'bg-blue-500 w-8' 
                    : lightTheme ? 'bg-slate-300 hover:bg-slate-400' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Navegación móvil */}
          <div className="md:hidden flex justify-center gap-4 mt-6">
            <button 
              onClick={prevSlide}
              className={`rounded-full border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/15 hover:bg-white/5'} p-3 transition`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              className={`rounded-full border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/15 hover:bg-white/5'} p-3 transition`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Stats del marketplace */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-xl ${lightTheme ? 'bg-slate-100' : 'bg-slate-800/30'}`}>
              <div className="text-2xl font-bold text-blue-500">{marketData.length}+</div>
              <div className={`text-sm ${lightTheme ? 'text-slate-600' : 'text-white/70'}`}>Apps disponibles</div>
            </div>
            <div className={`text-center p-4 rounded-xl ${lightTheme ? 'bg-slate-100' : 'bg-slate-800/30'}`}>
              <div className="text-2xl font-bold text-emerald-500">98%</div>
              <div className={`text-sm ${lightTheme ? 'text-slate-600' : 'text-white/70'}`}>Satisfacción</div>
            </div>
            <div className={`text-center p-4 rounded-xl ${lightTheme ? 'bg-slate-100' : 'bg-slate-800/30'}`}>
              <div className="text-2xl font-bold text-purple-500">12k+</div>
              <div className={`text-sm ${lightTheme ? 'text-slate-600' : 'text-white/70'}`}>Usuarios activos</div>
            </div>
            <div className={`text-center p-4 rounded-xl ${lightTheme ? 'bg-slate-100' : 'bg-slate-800/30'}`}>
              <div className="text-2xl font-bold text-amber-500">24/7</div>
              <div className={`text-sm ${lightTheme ? 'text-slate-600' : 'text-white/70'}`}>Soporte técnico</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl lg:text-3xl font-extrabold">Preguntas frecuentes</h2>
            <button 
              onClick={toggleAllFaq}
              className={`rounded-full border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/15 hover:bg-white/5'} px-4 py-2 text-sm`}
            >
              {allFaqOpen ? 'Cerrar todo' : 'Abrir todo'}
            </button>
          </div>
          <div className="space-y-3">
            <details className={`group rounded-xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-5`} open={allFaqOpen}>
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-semibold">¿Se integra con nuestras herramientas?</span>
                <span className="transition group-open:rotate-45">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="#8AB4FF" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </span>
              </summary>
              <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} mt-3`}>Sí, contamos con conectores para ERPs, CRMs y servicios de datos. La configuración es asistida.</p>
            </details>
            <details className={`group rounded-xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-5`} open={allFaqOpen}>
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-semibold">¿Cómo es la seguridad?</span>
                <span className="transition group-open:rotate-45">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="#8AB4FF" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </span>
              </summary>
              <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} mt-3`}>Seguimos mejores prácticas de la industria, con controles de acceso, auditoría y cifrado de datos.</p>
            </details>
            <details className={`group rounded-xl ${lightTheme ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-800/40 border-white/10'} border p-5`} open={allFaqOpen}>
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-semibold">¿Puedo empezar por un módulo?</span>
                <span className="transition group-open:rotate-45">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="#8AB4FF" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </span>
              </summary>
              <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} mt-3`}>Claro, activa sólo las apps que necesites y añade más cuando haga falta.</p>
            </details>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`relative border-t ${lightTheme ? 'border-slate-200' : 'border-white/10'}`}>
        <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true" style={{background: 'radial-gradient(700px 250px at 80% -10%, #1F6FFF, transparent)'}}></div>
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 grid place-items-center shadow-lg">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 12a8 8 0 1016 0 8 8 0 10-16 0Z" stroke="white" strokeOpacity=".85" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <p className="font-extrabold">The Original Lab</p>
                  <p className={`text-xs ${lightTheme ? 'text-slate-500' : 'text-white/60'} -mt-0.5`}>Control de Pago</p>
                </div>
              </div>
              <p className={`${lightTheme ? 'text-slate-600' : 'text-white/70'} text-sm max-w-xs`}>Plataforma modular para gestionar pagos, facturas y reportes con seguridad y escala.</p>
            </div>
            <div>
              <p className="font-semibold mb-3">Productos</p>
              <ul className={`space-y-2 ${lightTheme ? 'text-slate-600' : 'text-white/70'} text-sm`}>
                <li><a href="#apps" className={`${lightTheme ? 'hover:text-slate-900' : 'hover:text-white'}`}>Pagos</a></li>
                <li><a href="#apps" className={`${lightTheme ? 'hover:text-slate-900' : 'hover:text-white'}`}>Facturación</a></li>
                <li><a href="#apps" className={`${lightTheme ? 'hover:text-slate-900' : 'hover:text-white'}`}>Reportes</a></li>
                <li><a href="#apps" className={`${lightTheme ? 'hover:text-slate-900' : 'hover:text-white'}`}>Gastos</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3">Recursos</p>
              <ul className={`space-y-2 ${lightTheme ? 'text-slate-600' : 'text-white/70'} text-sm`}>
                <li><a href="#faq" className={`${lightTheme ? 'hover:text-slate-900' : 'hover:text-white'}`}>Centro de ayuda</a></li>
                <li><a href="#market" className={`${lightTheme ? 'hover:text-slate-900' : 'hover:text-white'}`}>Marketplace</a></li>
                <li><button onClick={() => showToast('Suscripción demo: sin envío real.')} className={`${lightTheme ? 'hover:text-slate-900' : 'hover:text-white'}`}>Newsletter (demo)</button></li>
              </ul>
              <div className="mt-4 flex items-center gap-3">
                <button 
                  onClick={scrollToTop}
                  className={`rounded-full border ${lightTheme ? 'border-slate-300 hover:bg-slate-50' : 'border-white/15 hover:bg-white/5'} px-3 py-1.5 text-xs`}
                >
                  Volver arriba
                </button>
              </div>
            </div>
          </div>
          <div className={`mt-10 pt-6 border-t ${lightTheme ? 'border-slate-200' : 'border-white/10'} flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
            <div className={`${lightTheme ? 'text-slate-500' : 'text-white/60'} text-xs`}>© {new Date().getFullYear()} The Original Lab · Todos los derechos reservados.</div>
            <div className={`${lightTheme ? 'text-slate-500' : 'text-white/60'} text-xs`}>Demo informativa. No recoge datos sensibles ni procesa pagos reales.</div>
          </div>
        </div>
      </footer>

      {/* TOAST */}
      {toastVisible && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70]">
          <div className={`rounded-full ${lightTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} px-4 py-2 shadow-xl font-medium`}>
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentControlSite;