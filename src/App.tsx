import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircle, ArrowDownToLine, Banknote, Bell, BriefcaseBusiness, CalendarDays, Check,
  ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardList, FileSpreadsheet,
  Filter, Landmark, ListChecks, MoreHorizontal, Printer, Search, Tag, X,
} from 'lucide-react';
import { filterRecords, formatPLN, months, recordsByKind, type RegisterKind, type RegisterRecord } from './registerData';

type DemoState = 'populated' | 'empty' | 'error';
type MenuTarget = { record: RegisterRecord; above: boolean } | null;
type Filters = { year: string; month: string; operation: string; jpk: string; series: string };

const emptyFilters: Filters = { year: '', month: '', operation: '', jpk: '', series: '' };
const stateOptions: { value: DemoState; label: string }[] = [
  { value: 'populated', label: 'Dane przykładowe' },
  { value: 'empty', label: 'Pusty rejestr' },
  { value: 'error', label: 'Błąd wczytywania' },
];

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

type AppPage = 'areas' | 'vat' | 'bookkeeping' | 'assets' | 'checks';

const pageFromHash = (): AppPage => {
  const page = window.location.hash.slice(1);
  return ['areas', 'vat', 'bookkeeping', 'assets', 'checks'].includes(page) ? page as AppPage : 'areas';
};

export default function App() {
  const [page, setPage] = useState<AppPage>(pageFromHash);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [navScroll, setNavScroll] = useState({ overflow: false, hasMore: false });
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const syncPage = () => setPage(pageFromHash());
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const syncScrollState = () => setNavScroll({
      overflow: nav.scrollWidth > nav.clientWidth + 1,
      hasMore: nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 1,
    });
    syncScrollState();
    nav.addEventListener('scroll', syncScrollState, { passive: true });
    window.addEventListener('resize', syncScrollState);
    return () => {
      nav.removeEventListener('scroll', syncScrollState);
      window.removeEventListener('resize', syncScrollState);
    };
  }, []);
  const navigate = (next: AppPage) => {
    if (page !== next) window.location.hash = next;
    setPage(next);
  };
  const activeTitle: Record<AppPage, string> = {
    areas: 'Obszary księgowe', vat: 'Rejestry i VAT', bookkeeping: 'Księgowania', assets: 'Majątek', checks: 'Kontrole',
  };
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#areas" onClick={() => navigate('areas')} aria-label="Onsaldo — obszary księgowe">
          <span className="brand-mark" aria-hidden="true">o</span><span>onsaldo</span><span className="workspace">/</span><span className="workspace">Demo Firma</span>
        </a>
        <div className="top-actions">
          <span className="context-label"><span>Ewidencje</span><ChevronRight size={14} />{activeTitle[page]}</span>
          <div className="notification-wrap">
            <button className="header-icon" aria-label="Powiadomienia — 0 nowych" aria-expanded={noticeOpen} onClick={() => setNoticeOpen(open => !open)}><Bell size={17} /><span className="notification-count">0</span></button>
            {noticeOpen && <div className="notification-popover" role="status"><strong>Powiadomienia demonstracyjne</strong><span>Nie ma nowych powiadomień dla Demo Firma.</span></div>}
          </div>
          <div className="avatar" aria-label="Użytkownik demonstracyjny" title="Użytkownik demonstracyjny">AK</div>
        </div>
      </header>
      <nav className="primary-nav" aria-label="Główna nawigacja">
        <div
          ref={navRef}
          className={`primary-nav-inner ${navScroll.overflow ? 'is-scrollable' : ''}`}
          role="group"
          aria-label={navScroll.overflow ? 'Pozioma lista sekcji. Użyj strzałek lub Tab, aby zobaczyć dalsze sekcje.' : undefined}
          tabIndex={navScroll.overflow ? 0 : undefined}
          onKeyDown={event => {
            if (event.target !== event.currentTarget || !navScroll.overflow) return;
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              event.currentTarget.scrollBy({ left: event.key === 'ArrowRight' ? 96 : -96, behavior: 'smooth' });
            }
          }}
        >
          <button className={page === 'areas' ? 'active' : ''} aria-current={page === 'areas' ? 'page' : undefined} onClick={() => navigate('areas')}><ClipboardList size={16} />Obszary</button>
          <button className={page === 'vat' ? 'active' : ''} aria-current={page === 'vat' ? 'page' : undefined} onClick={() => navigate('vat')}><FileSpreadsheet size={16} />Rejestry i VAT</button>
          <button className={page === 'bookkeeping' ? 'active' : ''} aria-current={page === 'bookkeeping' ? 'page' : undefined} onClick={() => navigate('bookkeeping')}><Landmark size={16} />Księgowania</button>
          <button className={page === 'assets' ? 'active' : ''} aria-current={page === 'assets' ? 'page' : undefined} onClick={() => navigate('assets')}><BriefcaseBusiness size={16} />Majątek</button>
          <button className={page === 'checks' ? 'active' : ''} aria-current={page === 'checks' ? 'page' : undefined} onClick={() => navigate('checks')}><ListChecks size={16} />Kontrole</button>
        </div>
        {navScroll.overflow && navScroll.hasMore && <span className="nav-scroll-cue" aria-hidden="true"><ChevronRight size={16} /></span>}
      </nav>
      {page === 'areas' ? <AreasPage onOpenVat={() => navigate('vat')} />
        : page === 'vat' ? <RegisterPage />
          : <InformationalPage page={page} onBack={() => navigate('areas')} />}
    </div>
  );
}

function AreasPage({ onOpenVat }: { onOpenVat: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const areas = [
    { name: 'KPiR', icon: Landmark, status: 'Wymaga konfiguracji', copy: 'Księga przychodów i rozchodów nie jest dostępna w tym prototypie. Żadne wpisy nie zostaną utworzone.' },
    { name: 'Ewidencja przychodów', icon: Banknote, status: 'Wymaga konfiguracji', copy: 'Ewidencja ryczałtowa jest pokazana jako obszar produktu; konfiguracja i ewidencjonowanie nie są częścią podglądu.' },
    { name: 'Pełne księgi', icon: ClipboardList, status: 'Wymaga konfiguracji', copy: 'Moduł pełnych ksiąg nie jest uruchomiony w tym demonstracyjnym środowisku.' },
    { name: 'Majątek', icon: BriefcaseBusiness, status: 'Podgląd informacyjny', copy: 'Ewidencja środków trwałych i wyposażenia nie jest dostępna w tym prototypie.' },
    { name: 'Kontrole', icon: ListChecks, status: 'Podgląd informacyjny', copy: 'Kontrole wymagają skonfigurowanych ewidencji. W tym podglądzie nie uruchamiamy walidacji księgowych.' },
  ];
  return <main className="main areas-main">
    <div className="heading-row"><div><div className="eyebrow">EWIDENCJE <span className="demo-chip">DEMO</span></div><h1>Obszary księgowe</h1><p className="subtitle">Mapa obszarów księgowych dostępnych dla aktywnej organizacji.</p></div></div>
    <div className="notice"><CircleHelp size={16} /><span>Podgląd demonstracyjny. Tylko Rejestr VAT ma tu działający widok; pozostałe obszary nie wykonują operacji księgowych.</span></div>
    <section className="period-card" aria-labelledby="period-title">
      <div className="period-icon"><CalendarDays size={20} /></div><div className="period-copy"><h2 id="period-title">Okres księgowy <span>2026</span></h2><p>Rok rozliczeniowy Demo Firma</p><span className="status-badge needs-config">Wymaga konfiguracji</span></div>
    </section>
    <section className="vat-destination" aria-labelledby="vat-destination-title">
      <span className="vat-destination-icon"><FileSpreadsheet size={19} /></span>
      <div className="vat-destination-copy"><span className="eyebrow">DOSTĘPNE W PODGLĄDZIE</span><h2 id="vat-destination-title">Rejestr VAT</h2><p>Dokumenty sprzedaży i zakupów · dane demonstracyjne</p></div>
      <span className="status-badge demo-available">Demo</span>
      <button className="area-open" onClick={onOpenVat}>Otwórz rejestr <ChevronRight size={15} /></button>
    </section>
    <section className="areas-panel" aria-labelledby="areas-title"><div className="areas-panel-heading"><h2 id="areas-title">Pozostałe obszary</h2><p>Informacje o dostępności w tej demonstracji.</p></div>
      <div className="areas-grid">{areas.map(area => { const Icon = area.icon; const isOpen = expanded === area.name; return <article className={`area-item ${isOpen ? 'expanded' : ''}`} key={area.name}>
        <div className="area-item-row"><Icon size={16} aria-hidden="true" /><strong>{area.name}</strong><span className={`status-badge ${area.status.startsWith('Wymaga') ? 'needs-config' : ''}`}>{area.status}</span>
          <button className="area-expand" aria-expanded={isOpen} aria-label={`${isOpen ? 'Zwiń' : 'Pokaż'} informacje: ${area.name}`} onClick={() => setExpanded(isOpen ? null : area.name)}><ChevronDown size={16} /></button>
        </div>
        {isOpen && <p className="area-explanation">{area.copy}</p>}
      </article>; })}</div>
    </section>
    <footer className="areas-footer"><span>Aktywna organizacja: <strong>Demo Firma</strong></span><span>Podgląd demonstracyjny · bez połączenia z backendem</span></footer>
  </main>;
}

function InformationalPage({ page, onBack }: { page: Exclude<AppPage, 'areas' | 'vat'>; onBack: () => void }) {
  const content = {
    bookkeeping: { title: 'Księgowania', icon: Landmark, text: 'KPiR, ewidencja przychodów i pełne księgi wymagają konfiguracji organizacji. Te moduły nie są aktywne w demonstracji.' },
    assets: { title: 'Majątek', icon: BriefcaseBusiness, text: 'Ewidencja majątku jest widoczna jako obszar produktu, ale nie jest uruchomiona w tym prototypie.' },
    checks: { title: 'Kontrole', icon: ListChecks, text: 'Kontrole będą dostępne po skonfigurowaniu ewidencji. W tej demonstracji nie wykonujemy walidacji księgowych.' },
  }[page];
  const Icon = content.icon;
  return <main className="main info-main"><section className="info-panel"><span className="eyebrow">OBSZARY KSIĘGOWE</span><div className="info-icon"><Icon size={23} /></div><h1>{content.title}</h1><p>{content.text}</p><span className="status-badge needs-config">Wymaga konfiguracji</span><button className="primary-button" onClick={onBack}>Wróć do obszarów księgowych</button></section></main>;
}

function RegisterPage() {
  const [kind, setKind] = useState<RegisterKind>('sales');
  const [demoState, setDemoState] = useState<DemoState>('populated');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({ year: '2026', month: '', operation: '', jpk: '', series: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [menu, setMenu] = useState<MenuTarget>(null);
  const [detail, setDetail] = useState<RegisterRecord | null>(null);
  const [marked, setMarked] = useState<Set<string>>(() => new Set());
  const [registerMarked, setRegisterMarked] = useState<Set<RegisterKind>>(() => new Set());
  const [toast, setToast] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const salesTabRef = useRef<HTMLButtonElement>(null);
  const purchasesTabRef = useRef<HTMLButtonElement>(null);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);

  const baseRecords = recordsByKind[kind];
  const filteredRecords = useMemo(() => filterRecords(baseRecords, { ...filters, query }), [baseRecords, filters, query]);
  const visibleRecords = demoState === 'populated' ? filteredRecords : [];
  const hasResults = visibleRecords.length > 0;
  const totals = visibleRecords.reduce((total, record) => ({
    net: total.net + record.net,
    vat: total.vat + record.vat,
  }), { net: 0, vat: 0 });
  const pageCount = Math.max(1, Math.ceil(visibleRecords.length / pageSize));
  const pageRows = visibleRecords.slice((page - 1) * pageSize, page * pageSize);
  const start = visibleRecords.length ? (page - 1) * pageSize : 0;
  const hasFilters = Boolean(query || Object.values(filters).some(Boolean));
  const activeFilterCount = [filters.jpk, filters.series].filter(Boolean).length;
  const currentPeriod = [
    filters.month && months.find(([number]) => number === filters.month)?.[1],
    filters.year,
  ].filter(Boolean).join(' ');
  const registerTitle = kind === 'sales' ? 'Rejestr VAT sprzedaży' : 'Rejestr VAT zakupów';
  const closeDetail = () => {
    setDetail(null);
    window.setTimeout(() => detailTriggerRef.current?.focus(), 0);
  };
  const switchKind = (next: RegisterKind) => {
    if (kind === next) return;
    setKind(next);
    setPage(1);
    setMenu(null);
    setFilters(current => ({ ...current, operation: '', jpk: '', series: '' }));
  };

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setMenu(null);
        setFiltersOpen(false);
        if (detail) closeDetail();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [detail]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setQuery('');
    setPage(1);
  };

  const markedKey = (record: RegisterRecord) => `${kind}:${record.id}`;
  const isMarked = (record: RegisterRecord) => marked.has(markedKey(record));
  const toggleMarked = (record: RegisterRecord) => {
    const key = markedKey(record);
    setMarked(current => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setMenu(null);
    notify(isMarked(record) ? 'Usunięto lokalne oznaczenie' : 'Oznaczono dokument w podglądzie');
  };

  const exportCsv = () => {
    const header = ['Kontrahent', 'Data', 'Numer dokumentu', 'Status KSeF · demo', 'Identyfikator', 'Rodzaj operacji', 'Kod JPK V7', 'Seria', 'Netto', 'VAT', 'Brutto'];
    const rows = visibleRecords.map(record => [
      record.vendor, record.date, record.document, record.ksef, record.identifier,
      record.operation, record.jpk, record.series, record.net, record.vat, Number((record.net + record.vat).toFixed(2)),
    ]);
    const csv = [header, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `rejestr-vat-${kind === 'sales' ? 'sprzedaz' : 'zakupy'}-demo.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Pobrano CSV dla aktualnego widoku');
  };

  const copyIdentifier = async (record: RegisterRecord) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(record.identifier);
      notify('Skopiowano identyfikator');
    } catch {
      notify('Schowek jest niedostępny w tej przeglądarce');
    }
    setMenu(null);
  };

  return (
      <>
      <main className="main register-main" onClick={() => menu && setMenu(null)}>
        <div className="heading-row">
          <div>
            <div className="eyebrow">EWIDENCJE <span className="demo-chip">DEMO</span></div>
            <h1>Rejestry i VAT</h1>
            <p className="subtitle">Okres: <strong>{currentPeriod || 'wszystkie okresy'}</strong> · dane demonstracyjne</p>
          </div>
        </div>

        <div className="notice register-notice"><CircleHelp size={15} /><span>Podgląd przykładowych dokumentów — bez połączenia z ewidencją firmy ani KSeF.</span></div>

        <section className="summary" aria-label="Podsumowanie VAT">
          <div className="summary-head">
            <span className="section-kicker">PODSUMOWANIE {kind === 'sales' ? 'SPRZEDAŻY' : 'ZAKUPÓW'}</span>
            <span className="demo-note">{hasResults ? `${visibleRecords.length} ${visibleRecords.length === 1 ? 'dokument w wyniku' : 'dokumentów w wynikach'}` : 'Brak danych'}</span>
          </div>
          <div className="totals">
            <div className="total-item"><span>Netto</span><strong>{hasResults ? formatPLN(totals.net) : '—'}</strong></div>
            <div className="total-item"><span>VAT</span><strong>{hasResults ? formatPLN(totals.vat) : '—'}</strong></div>
            <div className="total-item total-gross"><span>Brutto</span><strong>{hasResults ? formatPLN(totals.net + totals.vat) : '—'}</strong></div>
          </div>
        </section>

        <section className="register" role="tabpanel" id="register-panel" aria-labelledby={kind === 'sales' ? 'sales-tab' : 'purchases-tab'} aria-label={registerTitle}>
          <div className="register-heading">
            <div className="register-tabs" role="tablist" aria-label="Rodzaj rejestru">
              <button id="sales-tab" aria-controls="register-panel" ref={salesTabRef} role="tab" tabIndex={kind === 'sales' ? 0 : -1} aria-selected={kind === 'sales'} className={kind === 'sales' ? 'active' : ''} onKeyDown={event => { if (event.key === 'ArrowRight') { switchKind('purchases'); purchasesTabRef.current?.focus(); } }} onClick={() => switchKind('sales')}>
                Rejestr VAT sprzedaży
              </button>
              <button id="purchases-tab" aria-controls="register-panel" ref={purchasesTabRef} role="tab" tabIndex={kind === 'purchases' ? 0 : -1} aria-selected={kind === 'purchases'} className={kind === 'purchases' ? 'active' : ''} onKeyDown={event => { if (event.key === 'ArrowLeft') { switchKind('sales'); salesTabRef.current?.focus(); } }} onClick={() => switchKind('purchases')}>
                Rejestr VAT zakupów
              </button>
            </div>
            <span className="record-count">{demoState === 'populated' ? `${filteredRecords.length} ${filteredRecords.length === 1 ? 'dokument' : 'dokumentów'}` : 'Podgląd demonstracyjny'}</span>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <Search size={17} aria-hidden="true" />
              <input
                ref={searchRef}
                aria-label="Szukaj w rejestrze"
                placeholder="Szukaj kontrahenta, dokumentu, identyfikatora lub KSeF…"
                value={query}
                onChange={event => { setQuery(event.target.value); setPage(1); }}
              />
              <kbd aria-hidden="true">⌘ K</kbd>
              {query && <button className="clear-search" aria-label="Wyczyść wyszukiwanie" onClick={() => { setQuery(''); setPage(1); }}><X size={15} /></button>}
            </div>
            <div className="toolbar-actions">
              <button
                className={`icon-button ${registerMarked.has(kind) ? 'selected' : ''}`}
                aria-label={registerMarked.has(kind) ? 'Usuń oznaczenie rejestru' : 'Oznacz rejestr'}
                aria-pressed={registerMarked.has(kind)}
                title={registerMarked.has(kind) ? 'Usuń oznaczenie rejestru' : 'Oznacz rejestr'}
                onClick={() => {
                  const next = new Set(registerMarked);
                  if (next.has(kind)) { next.delete(kind); notify('Usunięto lokalne oznaczenie rejestru'); }
                  else { next.add(kind); notify('Rejestr oznaczony w podglądzie'); }
                  setRegisterMarked(next);
                }}
              ><Tag size={17} /></button>
              <button className="icon-button" aria-label="Drukuj rejestr" title="Drukuj rejestr" onClick={() => window.print()}><Printer size={17} /></button>
              <button className="icon-button" aria-label="Pobierz CSV" title={hasResults ? 'Pobierz CSV z widocznych wyników' : 'Brak dokumentów do pobrania'} disabled={!hasResults} onClick={exportCsv}><ArrowDownToLine size={17} /></button>
            </div>
          </div>

          <div className="filter-row common-filter-row" aria-label="Najczęstsze filtry">
            <SelectFilter label="Rok" value={filters.year} onChange={value => updateFilter('year', value)} options={[
              ['', 'Wszystkie lata'], ...Array.from(new Set(baseRecords.map(record => record.year))).sort((a, b) => b.localeCompare(a)).map(value => [value, value] as [string, string]),
            ]} />
            <SelectFilter label="Miesiąc" value={filters.month} onChange={value => updateFilter('month', value)} options={[
              ['', 'Wszystkie miesiące'], ...months.map(([number, name]) => [number, name] as [string, string]),
            ]} />
            <SelectFilter label="Rodzaj operacji" value={filters.operation} onChange={value => updateFilter('operation', value)} options={[
              ['', 'Wszystkie'], ...Array.from(new Set(baseRecords.map(record => record.operation))).map(value => [value, value] as [string, string]),
            ]} />
            <button className={`filter-trigger ${filtersOpen ? 'open' : ''}`} aria-expanded={filtersOpen} onClick={() => setFiltersOpen(open => !open)}>
              <Filter size={15} /> Więcej filtrów{activeFilterCount > 0 && <span className="active-count">{activeFilterCount}</span>} <ChevronDown size={15} />
            </button>
            {hasFilters && <button className="clear-filters" onClick={clearFilters}>Wyczyść filtry <X size={14} /></button>}
          </div>

          {filtersOpen && (
            <div className="advanced-filters" aria-label="Filtry dodatkowe">
              <SelectFilter label="Kod JPK V7" value={filters.jpk} onChange={value => updateFilter('jpk', value)} options={[
                ['', 'Wszystkie kody'], ...Array.from(new Set(baseRecords.map(record => record.jpk))).map(value => [value, value === 'Brak' ? 'Brak kodu' : value] as [string, string]),
              ]} />
              <SelectFilter label="Seria dokumentów" value={filters.series} onChange={value => updateFilter('series', value)} options={[
                ['', 'Wszystkie serie'], ...Array.from(new Set(baseRecords.map(record => record.series))).map(value => [value, value] as [string, string]),
              ]} />
            </div>
          )}

          {hasFilters && <ActiveFilters query={query} filters={filters} onRemoveQuery={() => setQuery('')} onRemove={updateFilter} />}

          {demoState === 'error' ? (
            <div className="state-panel error-state" role="alert">
              <AlertCircle size={19} />
              <div><strong>Nie udało się wczytać rejestru</strong><p>Wystąpił problem z wyświetleniem danych demonstracyjnych.</p></div>
              <button className="text-button" onClick={() => setDemoState('populated')}>Spróbuj ponownie</button>
            </div>
          ) : demoState === 'empty' ? (
            <div className="state-panel empty-state">
              <FileSpreadsheet size={19} />
              <div><strong>Rejestr jest pusty</strong><p>W tym widoku nie ma jeszcze żadnych dokumentów.</p></div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="state-panel empty-state">
              <Search size={19} />
              <div><strong>Nie znaleziono dokumentów</strong><p>Zmień kryteria wyszukiwania lub użyj „Wyczyść filtry” powyżej.</p></div>
            </div>
          ) : (
            <>
              <RegisterTable
                records={pageRows}
                marked={isMarked}
                menuRecord={menu?.record ?? null}
                menuAbove={menu?.above ?? false}
                onOpenMenu={(record, above) => setMenu(current => current?.record.id === record.id && current.record.identifier === record.identifier ? null : { record, above })}
                onPreview={(record, trigger) => { detailTriggerRef.current = trigger; setDetail(record); setMenu(null); }}
                onCopy={copyIdentifier}
                onToggleMark={toggleMarked}
              />
              <Pagination
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                start={start}
                resultCount={visibleRecords.length}
                onPage={setPage}
                onPageSize={size => { setPageSize(size); setPage(1); }}
              />
            </>
          )}
        </section>

        <footer className="page-footer">
          <span>Podgląd demonstracyjny · bez połączenia z backendem</span>
          <label className="demo-state-select">Stan podglądu
            <select aria-label="Stan podglądu" value={demoState} onChange={event => setDemoState(event.target.value as DemoState)}>
              {stateOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </footer>
      </main>
      {detail && <RecordDetails record={detail} kind={kind} onClose={closeDetail} />}
      {toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}
      </>
  );
}

function SelectFilter({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="quick-select">
      <span>{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => <option key={`${label}-${optionValue}`} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function ActiveFilters({ query, filters, onRemoveQuery, onRemove }: {
  query: string;
  filters: Filters;
  onRemoveQuery: () => void;
  onRemove: (key: keyof Filters, value: string) => void;
}) {
  const chips: { key: keyof Filters; label: string }[] = [
    { key: 'year', label: `Rok: ${filters.year}` },
    { key: 'month', label: `Miesiąc: ${months.find(([number]) => number === filters.month)?.[1] ?? ''}` },
    { key: 'operation', label: `Operacja: ${filters.operation}` },
    { key: 'jpk', label: `JPK: ${filters.jpk === 'Brak' ? 'brak kodu' : filters.jpk}` },
    { key: 'series', label: `Seria: ${filters.series}` },
  ];
  return (
    <div className="active-filters" aria-label="Aktywne filtry">
      {query && <button onClick={onRemoveQuery}>Szukaj: „{query}” <X size={13} /></button>}
      {chips.filter(chip => filters[chip.key]).map(chip => (
        <button key={chip.key} onClick={() => onRemove(chip.key, '')}>{chip.label}<X size={13} /></button>
      ))}
    </div>
  );
}

function RegisterTable({ records, marked, menuRecord, menuAbove, onOpenMenu, onPreview, onCopy, onToggleMark }: {
  records: RegisterRecord[];
  marked: (record: RegisterRecord) => boolean;
  menuRecord: RegisterRecord | null;
  menuAbove: boolean;
  onOpenMenu: (record: RegisterRecord, above: boolean) => void;
  onPreview: (record: RegisterRecord, trigger: HTMLButtonElement | null) => void;
  onCopy: (record: RegisterRecord) => void;
  onToggleMark: (record: RegisterRecord) => void;
}) {
  const actionMenu = (record: RegisterRecord, index: number) => (
    <div className="row-menu-wrap">
      <button className="row-menu" aria-label={`Akcje dla ${record.vendor}`} aria-expanded={menuRecord?.id === record.id && menuRecord.identifier === record.identifier} onClick={event => { event.stopPropagation(); onOpenMenu(record, index >= records.length - 2); }}>
        <MoreHorizontal size={18} />
      </button>
      {menuRecord?.id === record.id && menuRecord.identifier === record.identifier && (
        <div className={`row-popover ${menuAbove ? 'menu-above' : ''}`} onClick={event => event.stopPropagation()}>
          <strong>{record.document}</strong>
          <button onClick={event => onPreview(record, event.currentTarget.closest('.row-menu-wrap')?.querySelector<HTMLButtonElement>('.row-menu') ?? null)}>Podgląd dokumentu</button>
          <button onClick={() => onCopy(record)}>Kopiuj identyfikator</button>
          <button onClick={() => onToggleMark(record)}>{marked(record) ? 'Usuń oznaczenie' : 'Oznacz do sprawdzenia'}</button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Kontrahent</th><th>Data</th><th>Numer dokumentu</th><th>KSeF · demo</th><th>Identyfikator</th><th className="actions-col"><span className="sr-only">Akcje</span></th></tr></thead>
          <tbody>{records.map((record, index) => (
            <tr key={record.id} className={marked(record) ? 'marked-row' : ''}>
              <td><span className="vendor-name" title={record.vendor}>{record.vendor}</span>{marked(record) && <span className="marked-label"><Tag size={11} /> Do sprawdzenia</span>}</td>
              <td className="date-cell">{record.date}</td>
              <td><span className="doc-number" title={record.document}>{record.document}</span></td>
              <td><span className="status-pill" title="Status przykładowy; brak połączenia z KSeF">{record.ksef}</span></td>
              <td><span className="identifier" title={record.identifier}>{record.identifier}</span></td>
              <td className="actions-col">{actionMenu(record, index)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="mobile-records">
        {records.map((record, index) => (
          <article className={`record-card ${marked(record) ? 'marked-row' : ''}`} key={record.id}>
            <div className="record-card-head">
              <div className="record-card-identity"><strong>{record.vendor}</strong><span className="doc-number" title={record.document}>{record.document}</span>{marked(record) && <span className="marked-label"><Tag size={11} /> Do sprawdzenia</span>}</div>
              {actionMenu(record, index)}
            </div>
            <div className="mobile-data">
              <div className="mobile-meta-line"><span>{record.date}</span><span className="status-pill" title="Informacja demonstracyjna · bez połączenia z KSeF">{record.ksef}</span></div>
              <DataField label="Identyfikator"><span className="identifier" title={record.identifier}>{record.identifier}</span></DataField>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function DataField({ label, children }: { label: string; children: ReactNode }) {
  return <div><span className="record-label">{label}</span><span>{children}</span></div>;
}

function Pagination({ page, pageCount, pageSize, start, resultCount, onPage, onPageSize }: {
  page: number;
  pageCount: number;
  pageSize: number;
  start: number;
  resultCount: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}) {
  return (
    <footer className="pagination">
      <span className="range">{start + 1}–{Math.min(start + pageSize, resultCount)} <span>z {resultCount} zapisów</span></span>
      <div className="page-controls">
        <label className="page-size"><span className="sr-only">Liczba wierszy na stronie</span>
          <select value={pageSize} onChange={event => onPageSize(Number(event.target.value))}>
            <option value={10}>10 wierszy</option><option value={5}>5 wierszy</option><option value={14}>Wszystkie</option>
          </select><ChevronDown size={14} />
        </label>
        <div className="page-stepper">
          <button aria-label="Poprzednia strona" disabled={page === 1} onClick={() => onPage(Math.max(1, page - 1))}><ChevronLeft size={16} /></button>
          <span>{page} <i>/</i> {pageCount}</span>
          <button aria-label="Następna strona" disabled={page >= pageCount} onClick={() => onPage(Math.min(pageCount, page + 1))}><ChevronRight size={16} /></button>
        </div>
      </div>
    </footer>
  );
}

function RecordDetails({ record, kind, onClose }: { record: RegisterRecord; kind: RegisterKind; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener('keydown', onKeyDown);
    return () => dialog.removeEventListener('keydown', onKeyDown);
  }, []);
  return (
    <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="record-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title" tabIndex={-1}>
        <div className="dialog-heading">
          <div><span className="record-label">{kind === 'sales' ? 'REJESTR SPRZEDAŻY' : 'REJESTR ZAKUPÓW'}</span><h2 id="detail-title">{record.vendor}</h2></div>
          <button className="dialog-close" aria-label="Zamknij podgląd" autoFocus onClick={onClose}><X size={18} /></button>
        </div>
        <p className="dialog-document">{record.document} <span>{record.date}</span></p>
        <dl className="detail-grid">
          <div><dt>Status KSeF · demo</dt><dd>{record.ksef}</dd></div>
          <div><dt>Identyfikator</dt><dd>{record.identifier}</dd></div>
          <div><dt>Okres</dt><dd>{record.month}/{record.year}</dd></div>
          <div><dt>Rodzaj operacji</dt><dd>{record.operation}</dd></div>
          <div><dt>Kod JPK V7</dt><dd>{record.jpk === 'Brak' ? 'Brak kodu' : record.jpk}</dd></div>
          <div><dt>Seria dokumentów</dt><dd>{record.series}</dd></div>
          <div><dt>Netto · demo</dt><dd>{formatPLN(record.net)}</dd></div>
          <div><dt>VAT · demo</dt><dd>{formatPLN(record.vat)}</dd></div>
        </dl>
        <div className="dialog-footer"><span>Wartości przykładowe — podgląd nie jest dokumentem księgowym.</span><button className="primary-button" onClick={onClose}>Gotowe</button></div>
      </section>
    </div>
  );
}
