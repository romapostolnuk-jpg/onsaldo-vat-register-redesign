export type RegisterKind = 'sales' | 'purchases';

export type RegisterRecord = {
  id: number;
  vendor: string;
  date: string;
  document: string;
  ksef: string;
  identifier: string;
  year: string;
  month: string;
  operation: string;
  jpk: string;
  series: string;
  net: number;
  vat: number;
};

const monthNames = [
  ['01', 'styczeń'], ['02', 'luty'], ['03', 'marzec'], ['04', 'kwiecień'],
  ['05', 'maj'], ['06', 'czerwiec'], ['07', 'lipiec'], ['08', 'sierpień'],
  ['09', 'wrzesień'], ['10', 'październik'], ['11', 'listopad'], ['12', 'grudzień'],
] as const;

type Sample = Pick<RegisterRecord, 'vendor' | 'date' | 'document' | 'ksef' | 'identifier' | 'operation' | 'jpk' | 'series' | 'net'>;

const sales: Sample[] = [
  { vendor: 'Pracownia Łąka sp. z o.o.', date: '2026-10-01', document: 'FS/10/2026/014', ksef: 'Brak numeru · demo', identifier: 'NS-S-26-001', operation: 'Sprzedaż', jpk: 'Brak', series: 'SPRZ-A', net: 710 },
  { vendor: 'Bursztyn i Spółka', date: '2026-10-02', document: 'FS/BIS/1026/022', ksef: 'Poza zakresem · demo', identifier: 'NS-S-26-002', operation: 'Sprzedaż', jpk: 'GTU_12', series: 'SPRZ-A', net: 560 },
  { vendor: 'Rowerownia Nad Motławą', date: '2026-09-18', document: 'KOR/09/2026/03', ksef: 'Nie weryfikowano · demo', identifier: 'NS-S-26-003', operation: 'Korekta', jpk: 'MPP', series: 'SPRZ-KOR', net: 820 },
  { vendor: 'Studio Północne', date: '2026-10-04', document: 'FV/2026/10/041', ksef: 'Brak numeru · demo', identifier: 'NS-S-26-004', operation: 'Sprzedaż', jpk: 'WEW', series: 'SPRZ-B', net: 620 },
  { vendor: 'Zielony Stół sp. z o.o.', date: '2026-08-29', document: 'FS/ZS/0826/08', ksef: 'Nie dotyczy · demo', identifier: 'NS-S-26-005', operation: 'Sprzedaż', jpk: 'Brak', series: 'SPRZ-A', net: 760 },
  { vendor: 'Mostek Projekt', date: '2026-10-06', document: 'FV/MP/26/106', ksef: 'Status nieznany · demo', identifier: 'NS-S-26-006', operation: 'Sprzedaż', jpk: 'GTU_12', series: 'SPRZ-B', net: 690 },
  { vendor: 'Kobaltowa Przestrzeń', date: '2026-11-03', document: 'FS/11/2026/118', ksef: 'Brak numeru · demo', identifier: 'NS-S-26-007', operation: 'Sprzedaż', jpk: 'Brak', series: 'SPRZ-A', net: 540 },
  { vendor: 'Młynek i Ziarno', date: '2026-10-08', document: 'FV/MZ/10/26/9', ksef: 'Nie weryfikowano · demo', identifier: 'NS-S-26-008', operation: 'Sprzedaż', jpk: 'MPP', series: 'SPRZ-B', net: 730 },
  { vendor: 'Splot Rzeczy sp. z o.o.', date: '2026-09-09', document: 'FS/2026/09/209', ksef: 'Nie dotyczy · demo', identifier: 'NS-S-26-009', operation: 'Sprzedaż', jpk: 'Brak', series: 'SPRZ-A', net: 640 },
  { vendor: 'Fala Architektura', date: '2026-10-10', document: 'FV/FA/1010/26', ksef: 'Brak numeru · demo', identifier: 'NS-S-26-010', operation: 'Sprzedaż', jpk: 'GTU_12', series: 'SPRZ-B', net: 810 },
  { vendor: 'Kropla Ceramika', date: '2026-11-11', document: 'FS/KC/26/11/31', ksef: 'Nie dotyczy · demo', identifier: 'NS-S-26-011', operation: 'Sprzedaż', jpk: 'Brak', series: 'SPRZ-A', net: 580 },
  { vendor: 'Pajęczyna Studio', date: '2026-10-12', document: 'FV/12/2026/PS', ksef: 'Status nieznany · demo', identifier: 'NS-S-26-012', operation: 'Sprzedaż', jpk: 'WEW', series: 'SPRZ-B', net: 700 },
  { vendor: 'Cztery Deski', date: '2026-08-13', document: 'FS/CD/0813/26', ksef: 'Nie weryfikowano · demo', identifier: 'NS-S-26-013', operation: 'Sprzedaż', jpk: 'Brak', series: 'SPRZ-A', net: 650 },
  { vendor: 'Latarnia Rzemiosło', date: '2026-10-14', document: 'FV/LR/26/014', ksef: 'Brak numeru · demo', identifier: 'NS-S-26-014', operation: 'Sprzedaż', jpk: 'GTU_12', series: 'SPRZ-B', net: 890 },
];

const purchases: Sample[] = [
  { vendor: 'Dąb i Tynk', date: '2026-10-01', document: 'FZ/DT/26/044', ksef: 'Brak numeru · demo', identifier: 'NS-Z-26-001', operation: 'Zakup', jpk: 'Brak', series: 'ZAK-KRAJ', net: 420 },
  { vendor: 'Morska Kawa', date: '2026-10-02', document: 'FV/MK/1026/07', ksef: 'Nie weryfikowano · demo', identifier: 'NS-Z-26-002', operation: 'Zakup', jpk: 'GTU_12', series: 'ZAK-KRAJ', net: 310 },
  { vendor: 'Tkanina i Kształt', date: '2026-09-17', document: 'FZ/TK/2026/311', ksef: 'Nie dotyczy · demo', identifier: 'NS-Z-26-003', operation: 'Import usług', jpk: 'Brak', series: 'ZAK-USL', net: 680 },
  { vendor: 'Narzędziownia Fala', date: '2026-10-04', document: 'FV/NF/04/10/26', ksef: 'Brak numeru · demo', identifier: 'NS-Z-26-004', operation: 'Zakup', jpk: 'MPP', series: 'ZAK-KRAJ', net: 275 },
  { vendor: 'Podmuch Serwis', date: '2026-08-25', document: 'FZ/PS/26/085', ksef: 'Nie dotyczy · demo', identifier: 'NS-Z-26-005', operation: 'Zakup', jpk: 'WEW', series: 'ZAK-KRAJ', net: 590 },
  { vendor: 'Linia Druku', date: '2026-10-06', document: 'FV/LD/2026/62', ksef: 'Status nieznany · demo', identifier: 'NS-Z-26-006', operation: 'Zakup', jpk: 'Brak', series: 'ZAK-KRAJ', net: 380 },
  { vendor: 'Smukły Karton', date: '2026-11-02', document: 'FZ/SK/11/26/18', ksef: 'Brak numeru · demo', identifier: 'NS-Z-26-007', operation: 'WNT', jpk: 'Brak', series: 'ZAK-WNT', net: 720 },
  { vendor: 'Zasób Oświetlenie', date: '2026-10-08', document: 'FV/ZO/26/0108', ksef: 'Nie weryfikowano · demo', identifier: 'NS-Z-26-008', operation: 'Zakup', jpk: 'GTU_12', series: 'ZAK-KRAJ', net: 465 },
  { vendor: 'Kobalt Zasilanie', date: '2026-09-10', document: 'FZ/KZ/2026/9', ksef: 'Nie dotyczy · demo', identifier: 'NS-Z-26-009', operation: 'Zakup', jpk: 'MPP', series: 'ZAK-KRAJ', net: 540 },
  { vendor: 'Cegła i Kamień', date: '2026-10-10', document: 'FV/CK/1010/26', ksef: 'Brak numeru · demo', identifier: 'NS-Z-26-010', operation: 'Zakup', jpk: 'Brak', series: 'ZAK-KRAJ', net: 330 },
  { vendor: 'Laboratorium Splot', date: '2026-11-05', document: 'FZ/LS/26/011', ksef: 'Status nieznany · demo', identifier: 'NS-Z-26-011', operation: 'Import usług', jpk: 'WEW', series: 'ZAK-USL', net: 610 },
  { vendor: 'Usługi Przybywa', date: '2026-10-28', document: 'FV/UP/2026/212', ksef: 'Nie dotyczy · demo', identifier: 'NS-Z-26-012', operation: 'Zakup', jpk: 'Brak', series: 'ZAK-KRAJ', net: 295 },
  { vendor: 'Brzozowy Prąd', date: '2026-08-13', document: 'FZ/BP/08/26/73', ksef: 'Nie weryfikowano · demo', identifier: 'NS-Z-26-013', operation: 'Zakup', jpk: 'GTU_12', series: 'ZAK-KRAJ', net: 475 },
  { vendor: 'Koperta Studio', date: '2026-10-14', document: 'FV/KS/26/1014', ksef: 'Brak numeru · demo', identifier: 'NS-Z-26-014', operation: 'WNT', jpk: 'Brak', series: 'ZAK-WNT', net: 730 },
];

function withComputedVat(records: Sample[]): RegisterRecord[] {
  return records.map((record, index) => ({
    ...record,
    id: index + 1,
    year: record.date.slice(0, 4),
    month: record.date.slice(5, 7),
    vat: Number((record.net * 0.23).toFixed(2)),
  }));
}

export const recordsByKind: Record<RegisterKind, RegisterRecord[]> = {
  sales: withComputedVat(sales).sort((a, b) => b.date.localeCompare(a.date)),
  purchases: withComputedVat(purchases).sort((a, b) => b.date.localeCompare(a.date)),
};

export const months = monthNames;

export function filterRecords(
  records: RegisterRecord[],
  filters: { query: string; year: string; month: string; operation: string; jpk: string; series: string },
) {
  const query = filters.query.trim().toLocaleLowerCase('pl-PL');
  return records.filter((record) => {
    const matchesQuery = !query || [record.vendor, record.date, record.document, record.ksef, record.identifier, record.operation, record.jpk, record.series]
      .some((value) => value.toLocaleLowerCase('pl-PL').includes(query));
    return matchesQuery
      && (!filters.year || record.year === filters.year)
      && (!filters.month || record.month === filters.month)
      && (!filters.operation || record.operation === filters.operation)
      && (!filters.jpk || record.jpk === filters.jpk)
      && (!filters.series || record.series === filters.series);
  });
}

export function formatPLN(value: number) {
  const [integer, decimals] = value.toFixed(2).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  return `${grouped},${decimals} zł`;
}
