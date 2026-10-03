/**
 * LOGIBOX Iraq - Core Platform Engine
 * Advanced Transportation, Customs (ASYCUDA) & Supply-Chain Logic
 */

// Exchange rate USD to IQD
const USD_TO_IQD_RATE = 1315;
let currentCurrency = 'USD'; // 'USD' or 'IQD'

// Pre-configured Routes Database
const ROUTES_DB = {
  'ist_erbil': { origin: 'Istanbul (TR)', destination: 'Erbil (IQ)', distanceKm: 1840, baseRate: 2400, borderFee: 350, borderGate: 'Ibrahim Khalil / Habur', waitHours: 18, riskFactor: 1.12 },
  'ist_baghdad': { origin: 'Istanbul (TR)', destination: 'Baghdad (IQ)', distanceKm: 2250, baseRate: 3100, borderFee: 450, borderGate: 'Ibrahim Khalil / Habur', waitHours: 24, riskFactor: 1.18 },
  'mer_erbil': { origin: 'Mersin (TR)', destination: 'Erbil (IQ)', distanceKm: 1150, baseRate: 1950, borderFee: 350, borderGate: 'Ibrahim Khalil / Habur', waitHours: 16, riskFactor: 1.10 },
  'mer_baghdad': { origin: 'Mersin (TR)', destination: 'Baghdad (IQ)', distanceKm: 1560, baseRate: 2650, borderFee: 450, borderGate: 'Ibrahim Khalil / Habur', waitHours: 22, riskFactor: 1.16 },
  'gzt_erbil': { origin: 'Gaziantep (TR)', destination: 'Erbil (IQ)', distanceKm: 780, baseRate: 1550, borderFee: 350, borderGate: 'Ibrahim Khalil / Habur', waitHours: 14, riskFactor: 1.08 },
  'erbil_baghdad': { origin: 'Erbil (IQ)', destination: 'Baghdad (IQ)', distanceKm: 365, baseRate: 750, borderFee: 90, borderGate: 'Federal Checkpoint (Zero Tariff / Clearance)', waitHours: 4, riskFactor: 1.05 },
  'baghdad_basra': { origin: 'Baghdad (IQ)', destination: 'Basra (IQ)', distanceKm: 545, baseRate: 980, borderFee: 0, borderGate: 'Domestic Expressway 1', waitHours: 2, riskFactor: 1.04 },
  'erbil_sulaymaniyah': { origin: 'Erbil (IQ)', destination: 'Sulaymaniyah (IQ)', distanceKm: 180, baseRate: 420, borderFee: 0, borderGate: 'Regional KRI', waitHours: 1, riskFactor: 1.02 },
  'umq_baghdad': { origin: 'Umm Qasr Port (IQ)', destination: 'Baghdad (IQ)', distanceKm: 590, baseRate: 1150, borderFee: 280, borderGate: 'Umm Qasr Terminal Clearance', waitHours: 12, riskFactor: 1.14 },
  'umq_erbil': { origin: 'Umm Qasr Port (IQ)', destination: 'Erbil (IQ)', distanceKm: 955, baseRate: 1850, borderFee: 320, borderGate: 'Umm Qasr & KRI Border Audit', waitHours: 18, riskFactor: 1.15 },
  'amm_baghdad': { origin: 'Amman (JO)', destination: 'Baghdad (IQ)', distanceKm: 890, baseRate: 1800, borderFee: 380, borderGate: 'Trebil / Karameh', waitHours: 20, riskFactor: 1.15 },
  'kwt_basra': { origin: 'Kuwait City (KW)', destination: 'Basra (IQ)', distanceKm: 140, baseRate: 850, borderFee: 260, borderGate: 'Safwan / Abdali', waitHours: 10, riskFactor: 1.09 },
  'kwt_baghdad': { origin: 'Kuwait City (KW)', destination: 'Baghdad (IQ)', distanceKm: 670, baseRate: 1650, borderFee: 320, borderGate: 'Safwan / Abdali', waitHours: 14, riskFactor: 1.12 },
  'teh_sulaymaniyah': { origin: 'Tehran (IR)', destination: 'Sulaymaniyah (IQ)', distanceKm: 690, baseRate: 1450, borderFee: 310, borderGate: 'Bashmakh Gate', waitHours: 16, riskFactor: 1.12 },
  'teh_baghdad': { origin: 'Tehran (IR)', destination: 'Baghdad (IQ)', distanceKm: 910, baseRate: 1750, borderFee: 360, borderGate: 'Munthiriya / Khosravi', waitHours: 20, riskFactor: 1.15 }
};

// Truck Types Database
const TRUCKS_DB = {
  'small_truck': { name: 'Small Truck', capacity: '10–20 m³ / 3.5T', multiplier: 0.65, description: 'Local distribution, tight urban access & express courier' },
  'medium_truck': { name: 'Medium Cargo Truck', capacity: '25–40 m³ / 8T', multiplier: 0.85, description: 'Regional transportation, intercity retail distribution' },
  'large_truck': { name: 'Large Heavy Truck', capacity: '50–70 m³ / 16T', multiplier: 1.10, description: 'High-volume domestic freight, major wholesale lines' },
  'trailer_13m': { name: '13.6m International Trailer', capacity: '85–90 m³ / 24T', multiplier: 1.25, description: 'International cross-border FTL, TIR certified standard' },
  'reefer': { name: 'Refrigerated Reefer', capacity: '75–85 m³ / 22T', multiplier: 1.55, description: 'Temperature-controlled cargo (-25°C to +15°C), pharmaceuticals & food' },
  'lowbed': { name: 'Lowbed Heavy Haul', capacity: 'Up to 80T', multiplier: 2.10, description: 'Project cargo, transformers, construction & heavy machinery' },
  'tanker': { name: 'Liquid Tanker', capacity: '32,000–45,000 L', multiplier: 1.60, description: 'Fuel, refined petrochemicals & industrial liquid bulk' }
};

// Cargo risk & handling multipliers
const CARGO_DB = {
  'general': { name: 'General Cargo', multiplier: 1.0 },
  'textile': { name: 'Textile & Garments', multiplier: 1.02 },
  'fmcg': { name: 'FMCG & Dry Packaged Goods', multiplier: 1.05 },
  'electronics': { name: 'Electronics & High-Value', multiplier: 1.15 },
  'machinery': { name: 'Machinery & Spare Parts', multiplier: 1.12 },
  'construction': { name: 'Construction Materials', multiplier: 1.08 },
  'food': { name: 'Food & Perishables', multiplier: 1.20 },
  'hazardous': { name: 'Hazardous (ADR / Chemicals)', multiplier: 1.35 }
};

// Border Crossings Real-Time Status Database
const BORDERS_DB = [
  {
    country: 'Turkey',
    name: 'Ibrahim Khalil / Habur',
    location: 'Zakho, Dohuk Governorate (KRI)',
    status: 'Normal Flow',
    statusClass: 'tag-green',
    avgWait: '14–18 Hours',
    procedures: 'TIR Carnet, ASYCUDA KRI, Commercial Invoice, Certificate of Origin (Chamber of Commerce), CoC Pre-shipment Inspection',
    dailyCapacity: '~1,800 Trucks/day',
    lastUpdated: '1 hour ago (03 Oct 2026 21:00 UTC+3)'
  },
  {
    country: 'Iran',
    name: 'Bashmakh',
    location: 'Penjwen, Sulaymaniyah Governorate',
    status: 'Normal Flow',
    statusClass: 'tag-green',
    avgWait: '12–16 Hours',
    procedures: 'Transshipment & direct transit allowed, KRI Customs Declaration, Health & Quarantine for foodstuffs',
    dailyCapacity: '~650 Trucks/day',
    lastUpdated: '2 hours ago'
  },
  {
    country: 'Iran',
    name: 'Parwez Khan',
    location: 'Garmian Administration, KRI / Diyala',
    status: 'Moderate Wait',
    statusClass: 'tag-amber',
    avgWait: '18–22 Hours',
    procedures: 'Industrial materials priority lane, Federal & KRI documentation verification',
    dailyCapacity: '~500 Trucks/day',
    lastUpdated: '3 hours ago'
  },
  {
    country: 'Iran',
    name: 'Shalamcheh',
    location: 'Basra Governorate (Southern Corridor)',
    status: 'Normal Flow',
    statusClass: 'tag-green',
    avgWait: '10–14 Hours',
    procedures: 'Federal Iraq General Customs Authority declaration, chemical cargo pre-approvals required',
    dailyCapacity: '~400 Trucks/day',
    lastUpdated: '45 mins ago'
  },
  {
    country: 'Kuwait',
    name: 'Safwan / Abdali',
    location: 'Basra Governorate (Kuwait Border)',
    status: 'Normal Flow',
    statusClass: 'tag-green',
    avgWait: '8–12 Hours',
    procedures: 'GCC Origin Declaration, Security clearance escort optional, ASYCUDA declaration supported',
    dailyCapacity: '~350 Trucks/day',
    lastUpdated: '2 hours ago'
  },
  {
    country: 'Jordan',
    name: 'Trebil / Karameh',
    location: 'Al-Anbar Governorate (Western Corridor)',
    status: 'Operational',
    statusClass: 'tag-green',
    avgWait: '16–20 Hours',
    procedures: 'Anbar Security Highway convoy schedule, Jordan-Iraq Bilateral Trade Exemption audits',
    dailyCapacity: '~450 Trucks/day',
    lastUpdated: '1 hour ago'
  },
  {
    country: 'Saudi Arabia',
    name: 'Arar Gateway',
    location: 'Al-Anbar / Northern Border',
    status: 'Fast Track Active',
    statusClass: 'tag-green',
    avgWait: '6–10 Hours',
    procedures: 'Modernized electronic clearance, SASO conformity reciprocal agreements, high-speed ASYCUDA gateway',
    dailyCapacity: '~300 Trucks/day',
    lastUpdated: '30 mins ago'
  },
  {
    country: 'Seaport',
    name: 'Umm Qasr Seaport (North & South)',
    location: 'Basra Governorate (Arabian Gulf)',
    status: 'Moderate Port Congestion',
    statusClass: 'tag-amber',
    avgWait: '24–36 Hours Dwell Time',
    procedures: 'Bill of Lading delivery order, GCPI & Customs physical examination, ASYCUDA digital entry, gate pass generation',
    dailyCapacity: '~2,200 Containers/day',
    lastUpdated: '1 hour ago'
  }
];

// Demo Shipments for Mini TMS
const SHIPMENTS_DB = {
  'LBX-7821-IRQ': {
    id: 'LBX-7821-IRQ',
    client: 'Al-Mansour Pharmaceuticals Ltd.',
    origin: 'Mersin (TR)',
    destination: 'Erbil Distribution Center',
    truckType: 'Refrigerated Reefer (Volvo FH 500)',
    driver: 'Tariq Al-Jubouri (+964 750 442 8192)',
    currentStep: 6, // Customs Cleared
    steps: [
      { name: 'Quote Requested', date: '01 Oct 09:15', done: true },
      { name: 'Quote Approved', date: '01 Oct 11:30', done: true },
      { name: 'Truck Assigned', date: '01 Oct 16:00', done: true },
      { name: 'Truck Departed', date: '02 Oct 06:40', done: true },
      { name: 'Border Reached', date: '03 Oct 04:15', done: true },
      { name: 'Customs Processing', date: '03 Oct 12:20', done: true },
      { name: 'Customs Cleared', date: '03 Oct 18:45', done: true, active: true },
      { name: 'In Transit to Hub', date: 'Expected 04 Oct 07:00', done: false },
      { name: 'Delivered', date: 'Expected 04 Oct 13:00', done: false }
    ],
    temperature: '+4.2°C (Cold Chain Intact)',
    asycudaDeclaration: 'ASY-IK-2026-992144',
    sealNumber: 'SEAL-IQ-88319'
  },
  'LBX-9042-TRK': {
    id: 'LBX-9042-TRK',
    client: 'Mesopotamia General Trading LLC',
    origin: 'Istanbul (TR)',
    destination: 'Baghdad (Jamila Wholesale Market)',
    truckType: '13.6m International Trailer (Scania R450)',
    driver: 'Haider Al-Shammari (+964 780 119 5543)',
    currentStep: 5, // Border Reached
    steps: [
      { name: 'Quote Requested', date: '30 Sep 14:00', done: true },
      { name: 'Quote Approved', date: '30 Sep 17:15', done: true },
      { name: 'Truck Assigned', date: '01 Oct 08:30', done: true },
      { name: 'Truck Departed', date: '01 Oct 14:00', done: true },
      { name: 'Border Reached', date: '03 Oct 19:20', done: true, active: true },
      { name: 'Customs Processing', date: 'Under ASYCUDA Data Entry', done: false },
      { name: 'Customs Cleared', date: 'Pending', done: false },
      { name: 'In Transit', date: 'Pending', done: false },
      { name: 'Delivered', date: 'Expected 05 Oct', done: false }
    ],
    temperature: 'Ambient Dry (General Cargo)',
    asycudaDeclaration: 'ASY-IK-2026-993812',
    sealNumber: 'SEAL-TR-71028'
  },
  'LBX-4185-BAS': {
    id: 'LBX-4185-BAS',
    client: 'Tigris Oil & Gas Engineering',
    origin: 'Umm Qasr Seaport (South)',
    destination: 'Baghdad Industrial Zone',
    truckType: 'Lowbed Heavy Haul (Mercedes Actros 6x6)',
    driver: 'Ahmed Kareem (+964 770 982 3144)',
    currentStep: 7, // In Transit
    steps: [
      { name: 'Quote Requested', date: '02 Oct 08:00', done: true },
      { name: 'Quote Approved', date: '02 Oct 09:30', done: true },
      { name: 'Truck Assigned', date: '02 Oct 11:00', done: true },
      { name: 'Port Departed', date: '02 Oct 15:40', done: true },
      { name: 'Security Checkpoint', date: '02 Oct 22:15', done: true },
      { name: 'Customs Cleared', date: '03 Oct 10:00', done: true },
      { name: 'Customs Cleared', date: '03 Oct 10:00', done: true },
      { name: 'In Transit', date: '03 Oct 20:30 (Passing Hillah)', done: true, active: true },
      { name: 'Delivered', date: 'Expected 04 Oct 08:00', done: false }
    ],
    temperature: 'Industrial Machinery (18,400 kg)',
    asycudaDeclaration: 'ASY-UQ-2026-441092',
    sealNumber: 'SEAL-IQ-90041'
  }
};

// Operations Dispatcher Mock Queue
let dispatcherQueue = [
  { id: 'QUO-819', client: 'Company A (FMCG Foods)', route: 'Erbil → Baghdad', truck: '13.6m Trailer', date: '05 Oct 2026', estPrice: '$890', status: 'Pending Verification', badge: 'tag-amber' },
  { id: 'QUO-820', client: 'Company B (Textiles)', route: 'Mersin → Erbil', truck: '13.6m Trailer', date: '06 Oct 2026', estPrice: '$2,480', status: 'Operations Audited', badge: 'tag-green' },
  { id: 'QUO-821', client: 'Company C (Heavy Gear)', route: 'Umm Qasr → Baghdad', truck: 'Lowbed Heavy', date: '07 Oct 2026', estPrice: '$2,850', status: 'Rate Confirmed', badge: 'tag-green' }
];

// Current Wizard State
let quoteState = {
  routeKey: 'ist_erbil',
  cargoType: 'general',
  weightKg: 12500,
  volumeM3: 55,
  pallets: 24,
  truckType: 'trailer_13m',
  truckQty: 1,
  reqDate: '2026-10-15',
  specialHandling: false,
  customsAssistance: true
};

// Calculated results cache
let currentCalculatedQuote = null;

// Initialize on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initQuotationEngine();
  initBorderHub();
  initTrackingSystem();
  renderDispatcherTable();
  initModals();
  initDutyEstimator();
});

// Theme switcher
function initTheme() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('logibox_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('logibox_theme', next);
      updateThemeIcon(next);
    });
  }

  // Currency Toggle
  const currBtn = document.getElementById('currency-toggle-btn');
  if (currBtn) {
    currBtn.addEventListener('click', () => {
      currentCurrency = currentCurrency === 'USD' ? 'IQD' : 'USD';
      currBtn.innerHTML = `<span>${currentCurrency}</span>`;
      calculateQuote();
      renderDispatcherTable();
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  if (theme === 'dark') {
    icon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
  } else {
    icon.innerHTML = `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" fill="currentColor"/>`;
  }
}

// Format Currency
function formatMoney(amountUsd) {
  if (currentCurrency === 'IQD') {
    const iqdVal = Math.round(amountUsd * USD_TO_IQD_RATE);
    return `${iqdVal.toLocaleString()} IQD`;
  }
  return `$${Math.round(amountUsd).toLocaleString()}`;
}

// Quotation Engine Initialization
function initQuotationEngine() {
  const routeSelect = document.getElementById('quote-route-select');
  const cargoSelect = document.getElementById('quote-cargo-select');
  const weightInput = document.getElementById('quote-weight');
  const volumeInput = document.getElementById('quote-volume');
  const palletInput = document.getElementById('quote-pallets');
  const dateInput = document.getElementById('quote-date');
  const truckCards = document.querySelectorAll('.truck-card-option');
  const truckQtyInput = document.getElementById('quote-truck-qty');
  const customsCheck = document.getElementById('quote-customs-check');
  const specialCheck = document.getElementById('quote-special-check');
  const submitQuoteBtn = document.getElementById('btn-submit-verification');

  // Set default date to 10 days from today
  if (dateInput) {
    const today = new Date();
    today.setDate(today.getDate() + 10);
    dateInput.value = today.toISOString().split('T')[0];
    quoteState.reqDate = dateInput.value;
  }

  // Populate Route options if element exists
  if (routeSelect) {
    routeSelect.innerHTML = Object.entries(ROUTES_DB).map(([key, data]) => {
      return `<option value="${key}">${data.origin} → ${data.destination} (${data.distanceKm} km)</option>`;
    }).join('');

    routeSelect.addEventListener('change', (e) => {
      quoteState.routeKey = e.target.value;
      calculateQuote();
    });
  }

  // Cargo Type listener
  if (cargoSelect) {
    cargoSelect.addEventListener('change', (e) => {
      quoteState.cargoType = e.target.value;
      calculateQuote();
    });
  }

  // Input listeners
  if (weightInput) {
    weightInput.addEventListener('input', (e) => {
      quoteState.weightKg = parseFloat(e.target.value) || 0;
      calculateQuote();
    });
  }

  if (volumeInput) {
    volumeInput.addEventListener('input', (e) => {
      quoteState.volumeM3 = parseFloat(e.target.value) || 0;
      calculateQuote();
    });
  }

  if (palletInput) {
    palletInput.addEventListener('input', (e) => {
      quoteState.pallets = parseInt(e.target.value) || 0;
      calculateQuote();
    });
  }

  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      quoteState.reqDate = e.target.value;
    });
  }

  if (truckQtyInput) {
    truckQtyInput.addEventListener('input', (e) => {
      quoteState.truckQty = Math.max(1, parseInt(e.target.value) || 1);
      calculateQuote();
    });
  }

  if (customsCheck) {
    customsCheck.addEventListener('change', (e) => {
      quoteState.customsAssistance = e.target.checked;
      calculateQuote();
    });
  }

  if (specialCheck) {
    specialCheck.addEventListener('change', (e) => {
      quoteState.specialHandling = e.target.checked;
      calculateQuote();
    });
  }

  // Truck selection cards
  truckCards.forEach(card => {
    card.addEventListener('click', () => {
      truckCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      quoteState.truckType = card.dataset.truckId;
      calculateQuote();
    });
  });

  // Submit Quote for Operations Validation
  if (submitQuoteBtn) {
    submitQuoteBtn.addEventListener('click', handleQuoteSubmission);
  }

  // Initial Calculation
  calculateQuote();
}

/**
 * CORE PRICING ALGORITHM
 * 
 * Transportation Price =
 *   Base Route Rate
 *   · Truck Type Cost / Multiplier
 *   · Distance Factor
 *   · Fuel Adjustment (~14% surcharges on fuel volatility)
 *   · Border Cost / Handling
 *   · Waiting/Detention Risk
 *   · Special Cargo Cost
 *   · Required Margin & Quantity
 */
function calculateQuote() {
  const route = ROUTES_DB[quoteState.routeKey];
  const truck = TRUCKS_DB[quoteState.truckType];
  const cargo = CARGO_DB[quoteState.cargoType];

  if (!route || !truck || !cargo) return;

  // 1. Base Route & Distance Component
  const baseRate = route.baseRate;
  const truckMultiplier = truck.multiplier;
  const cargoMultiplier = cargo.multiplier;

  // Calculated route baseline per truck
  let truckBaseCost = baseRate * truckMultiplier;

  // 2. Fuel Surcharge (14.2% calculated based on route distance and Iraq fuel variance)
  const fuelSurcharge = Math.round(truckBaseCost * 0.142);

  // 3. Border Handling & Crossing Fees
  let borderHandling = route.borderFee;

  // 4. Customs Brokerage & ASYCUDA Support add-on
  let customsFee = quoteState.customsAssistance ? (route.borderFee > 0 ? 180 : 75) : 0;

  // 5. Waiting & Detention Risk factor (based on hours at border and security corridor)
  const waitingHours = route.waitHours;
  const waitingRiskCost = Math.round(waitingHours * 12.5 * route.riskFactor);

  // 6. Special cargo & hazard adjustment
  let specialCost = 0;
  if (quoteState.specialHandling || quoteState.cargoType === 'hazardous') {
    specialCost = Math.round(truckBaseCost * 0.18);
  }

  // 7. Weight surcharge if exceeds normal truck target (e.g. >20t)
  let weightSurcharge = 0;
  if (quoteState.weightKg > 22000) {
    weightSurcharge = Math.round((quoteState.weightKg - 22000) * 0.04);
  }

  // Subtotal per truck
  const subtotalPerTruck = truckBaseCost + fuelSurcharge + borderHandling + customsFee + waitingRiskCost + specialCost + weightSurcharge;
  
  // Total for quantity
  const totalCost = Math.round(subtotalPerTruck * quoteState.truckQty);

  // Cache results
  currentCalculatedQuote = {
    route,
    truck,
    cargo,
    truckBaseCost: Math.round(truckBaseCost),
    fuelSurcharge,
    borderHandling,
    customsFee,
    waitingRiskCost,
    specialCost,
    weightSurcharge,
    totalCost,
    totalCostIQD: Math.round(totalCost * USD_TO_IQD_RATE),
    qty: quoteState.truckQty,
    borderGate: route.borderGate,
    distanceKm: route.distanceKm
  };

  // Update UI Elements
  updateQuoteUI(currentCalculatedQuote);
}

function updateQuoteUI(q) {
  // Elements
  const elBaseRate = document.getElementById('calc-base-rate');
  const elFuel = document.getElementById('calc-fuel');
  const elBorder = document.getElementById('calc-border');
  const elCustoms = document.getElementById('calc-customs');
  const elWaitRisk = document.getElementById('calc-wait-risk');
  const elSpecial = document.getElementById('calc-special');
  const elTotalPrice = document.getElementById('calc-total-price');
  const elTotalIqd = document.getElementById('calc-total-iqd');
  const elGateNotice = document.getElementById('calc-gate-notice');
  const elTransitDist = document.getElementById('calc-transit-dist');

  if (elBaseRate) elBaseRate.textContent = formatMoney(q.truckBaseCost * q.qty);
  if (elFuel) elFuel.textContent = formatMoney(q.fuelSurcharge * q.qty);
  if (elBorder) elBorder.textContent = formatMoney(q.borderHandling * q.qty);
  if (elCustoms) elCustoms.textContent = formatMoney(q.customsFee * q.qty);
  if (elWaitRisk) elWaitRisk.textContent = formatMoney(q.waitingRiskCost * q.qty);
  if (elSpecial) elSpecial.textContent = formatMoney((q.specialCost + q.weightSurcharge) * q.qty);

  if (elTotalPrice) elTotalPrice.textContent = formatMoney(q.totalCost);
  if (elTotalIqd) {
    if (currentCurrency === 'USD') {
      elTotalIqd.textContent = `≈ ${(q.totalCost * USD_TO_IQD_RATE).toLocaleString()} IQD (Central Bank Ref Rate)`;
    } else {
      elTotalIqd.textContent = `≈ $${q.totalCost.toLocaleString()} USD Equivalent`;
    }
  }

  if (elGateNotice) {
    elGateNotice.textContent = `Gateway: ${q.borderGate}`;
  }
  if (elTransitDist) {
    elTransitDist.textContent = `${q.distanceKm} km · ${q.qty}x ${q.truck.name}`;
  }
}

// Handle Quote Submission & Generate Verification Reference
function handleQuoteSubmission() {
  if (!currentCalculatedQuote) return;

  const quoteId = `LBX-QUO-${Math.floor(1000 + Math.random() * 9000)}`;
  const companyName = prompt('Enter your Company or Shipper Name for the Operations Verification Ticket:', 'Direct Shipper Corp') || 'Client Direct';

  // Add into Operations Dispatcher Queue
  dispatcherQueue.unshift({
    id: quoteId,
    client: companyName,
    route: `${currentCalculatedQuote.route.origin} → ${currentCalculatedQuote.route.destination}`,
    truck: `${currentCalculatedQuote.qty}x ${currentCalculatedQuote.truck.name}`,
    date: quoteState.reqDate || 'Pending',
    estPrice: `$${currentCalculatedQuote.totalCost.toLocaleString()}`,
    status: 'Operations Verification In Progress',
    badge: 'tag-amber'
  });

  renderDispatcherTable();
  showToast(`✅ Quote ${quoteId} submitted! Our Iraq Operations Desk is verifying live route conditions.`);

  // Open confirmation modal
  showVerificationModal(quoteId, companyName, currentCalculatedQuote);
}

function showVerificationModal(quoteId, companyName, quote) {
  const modal = document.getElementById('quote-modal');
  const modalBody = document.getElementById('quote-modal-body');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); color: var(--status-green); display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 12px;">✓</div>
      <h3 style="font-size: 22px; margin-bottom: 6px;">Instant Estimated Quote Recorded</h3>
      <p style="font-size: 13px; color: var(--text-secondary);">Ticket Reference: <strong style="color: var(--accent-amber);">${quoteId}</strong></p>
    </div>

    <div style="background: var(--bg-tertiary); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px; font-size: 13px; line-height: 1.8;">
      <div style="display:flex; justify-content:space-between;"><span>Shipper / Company:</span><strong>${companyName}</strong></div>
      <div style="display:flex; justify-content:space-between;"><span>Route Corridor:</span><strong>${quote.route.origin} → ${quote.route.destination}</strong></div>
      <div style="display:flex; justify-content:space-between;"><span>Selected Fleet:</span><strong>${quote.qty}x ${quote.truck.name}</strong></div>
      <div style="display:flex; justify-content:space-between;"><span>Border Gateway:</span><strong>${quote.borderGate}</strong></div>
      <div style="display:flex; justify-content:space-between;"><span>Cargo Profile:</span><strong>${quote.cargo.name} (${quoteState.weightKg.toLocaleString()} kg / ${quoteState.volumeM3} m³)</strong></div>
      <div style="display:flex; justify-content:space-between; border-top: 1px dashed var(--border-color); margin-top: 8px; padding-top: 8px;">
        <span style="font-weight:700;">Instant Estimated Cost:</span>
        <strong style="color: var(--accent-amber); font-size: 16px;">$${quote.totalCost.toLocaleString()} USD (${(quote.totalCost * USD_TO_IQD_RATE).toLocaleString()} IQD)</strong>
      </div>
    </div>

    <div style="background: rgba(37, 99, 235, 0.08); border-left: 3px solid var(--accent-blue); padding: 12px; border-radius: 4px; font-size: 12px; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5;">
      <strong>Why "Instant Estimated Quote"?</strong><br/>
      In Iraq's dynamic operating environment, final confirmed rates account for exact border waiting queues, temporary customs circulars, and verified carrier GPS dispatch. An Operations Officer in Erbil or Baghdad will confirm this within <strong>15–30 minutes</strong>.
    </div>

    <div style="display: flex; gap: 12px;">
      <button class="btn-primary" style="flex:1; justify-content:center;" onclick="closeModal('quote-modal'); scrollToSection('tms-tracking'); document.getElementById('tracking-id-input').value = '${quoteId}';">Track in Customer Portal</button>
      <button class="btn-secondary" style="flex:1; justify-content:center;" onclick="window.open('https://wa.me/9647500000000?text=Hello%20Logibox%20Operations,%20confirming%20quote%20${quoteId}', '_blank')">WhatsApp Operations</button>
    </div>
  `;

  modal.classList.add('active');
}

// Iraq Border Crossings Network Hub
function initBorderHub() {
  const tabs = document.querySelectorAll('.border-tab-btn');
  const container = document.getElementById('border-cards-container');

  renderBorders('All');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const country = tab.dataset.country;
      renderBorders(country);
    });
  });
}

function renderBorders(filterCountry) {
  const container = document.getElementById('border-cards-container');
  if (!container) return;

  const filtered = filterCountry === 'All' 
    ? BORDERS_DB 
    : BORDERS_DB.filter(b => b.country.toLowerCase() === filterCountry.toLowerCase());

  container.innerHTML = filtered.map(b => `
    <div class="border-card">
      <div class="border-header">
        <div>
          <div class="border-country-badge">${b.country.toUpperCase()} CORRIDOR</div>
          <div class="border-title">${b.name}</div>
        </div>
        <span class="border-status-pill ${b.statusClass}">${b.status}</span>
      </div>

      <ul class="border-info-list">
        <li class="border-info-row">
          <span class="info-label">Geographic Location</span>
          <span class="info-val">${b.location}</span>
        </li>
        <li class="border-info-row">
          <span class="info-label">Average Clearance Wait</span>
          <span class="info-val">${b.avgWait}</span>
        </li>
        <li class="border-info-row">
          <span class="info-label">Daily Gate Throughput</span>
          <span class="info-val">${b.dailyCapacity}</span>
        </li>
        <li style="margin-top: 6px;">
          <span class="info-label" style="display:block; margin-bottom: 4px;">Primary Clearance Requirements:</span>
          <span style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${b.procedures}</span>
        </li>
      </ul>

      <div class="border-footer">
        <span>● Logibox Field Agent On-Site</span>
        <span>${b.lastUpdated}</span>
      </div>
    </div>
  `).join('');
}

// Mini TMS & Customer Shipment Tracking
function initTrackingSystem() {
  const input = document.getElementById('tracking-id-input');
  const btn = document.getElementById('btn-track-shipment');

  if (btn && input) {
    btn.addEventListener('click', () => {
      const code = input.value.trim().toUpperCase();
      searchShipment(code);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        searchShipment(input.value.trim().toUpperCase());
      }
    });
  }

  // Initial load with default shipment
  searchShipment('LBX-7821-IRQ');
}

function searchShipment(shipmentId) {
  const displayBox = document.getElementById('tracking-result-box');
  if (!displayBox) return;

  const shipment = SHIPMENTS_DB[shipmentId];

  if (!shipment) {
    displayBox.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <p style="font-size: 16px; margin-bottom: 8px;">No active manifest found for tracking reference <strong>${shipmentId || 'EMPTY'}</strong></p>
        <p style="font-size: 13px; color: var(--text-muted);">Try demo tracking codes: 
          <a href="javascript:void(0)" onclick="loadDemoTrack('LBX-7821-IRQ')" style="color:var(--accent-amber); text-decoration:underline; margin: 0 6px;">LBX-7821-IRQ</a> | 
          <a href="javascript:void(0)" onclick="loadDemoTrack('LBX-9042-TRK')" style="color:var(--accent-amber); text-decoration:underline; margin: 0 6px;">LBX-9042-TRK</a> | 
          <a href="javascript:void(0)" onclick="loadDemoTrack('LBX-4185-BAS')" style="color:var(--accent-amber); text-decoration:underline; margin: 0 6px;">LBX-4185-BAS</a>
        </p>
      </div>
    `;
    return;
  }

  // 9-Stage Progress Bar Render
  const totalStages = shipment.steps.length;
  const progressPercent = Math.min(100, Math.round(((shipment.currentStep + 1) / totalStages) * 100));

  displayBox.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 24px; flex-wrap:wrap; gap: 12px;">
      <div>
        <span style="font-size: 12px; color: var(--accent-amber); font-weight: 700; text-transform: uppercase;">Manifest Reference</span>
        <h3 style="font-size: 24px; font-weight: 800;">${shipment.id}</h3>
        <span style="font-size: 13px; color: var(--text-secondary);">${shipment.client}</span>
      </div>
      <div style="text-align: right;">
        <span class="tag-green" style="font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: var(--radius-full); display: inline-block; margin-bottom: 4px;">
          ${shipment.steps[shipment.currentStep].name}
        </span>
        <div style="font-size: 12px; color: var(--text-muted);">${shipment.origin} ➔ ${shipment.destination}</div>
      </div>
    </div>

    <!-- 9-Stage Stepper Track -->
    <div style="position: relative; margin: 30px 0 40px; overflow-x: auto; padding: 10px 0;">
      <div class="tracking-timeline">
        <div class="timeline-track-bar">
          <div class="timeline-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
        ${shipment.steps.map((step, idx) => {
          let nodeClass = '';
          if (idx < shipment.currentStep) nodeClass = 'done';
          else if (idx === shipment.currentStep) nodeClass = 'active';

          return `
            <div class="timeline-node ${nodeClass}">
              <div class="node-dot">${idx < shipment.currentStep ? '✓' : idx + 1}</div>
              <div class="node-label">${step.name}</div>
              <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px;">${step.date}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Telemetry Details -->
    <div class="tracking-detail-grid">
      <div class="track-data-item">
        <span class="track-data-label">Assigned Vehicle</span>
        <span class="track-data-val">${shipment.truckType}</span>
      </div>
      <div class="track-data-item">
        <span class="track-data-label">Driver & Dispatch</span>
        <span class="track-data-val">${shipment.driver}</span>
      </div>
      <div class="track-data-item">
        <span class="track-data-label">ASYCUDA Declaration</span>
        <span class="track-data-val" style="color: var(--accent-cyan);">${shipment.asycudaDeclaration}</span>
      </div>
      <div class="track-data-item">
        <span class="track-data-label">Cargo Condition</span>
        <span class="track-data-val">${shipment.temperature}</span>
      </div>
    </div>
  `;
}

function loadDemoTrack(id) {
  const input = document.getElementById('tracking-id-input');
  if (input) input.value = id;
  searchShipment(id);
}

// Operations Dispatcher Management Table
function renderDispatcherTable() {
  const tbody = document.getElementById('dispatcher-table-body');
  if (!tbody) return;

  tbody.innerHTML = dispatcherQueue.map((item, idx) => `
    <tr>
      <td><strong style="color:var(--accent-amber);">${item.id}</strong></td>
      <td>${item.client}</td>
      <td>${item.route}</td>
      <td>${item.truck}</td>
      <td>${item.date}</td>
      <td><strong>${item.estPrice}</strong></td>
      <td><span class="${item.badge}" style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight:700;">${item.status}</span></td>
      <td>
        <button class="btn-outline-amber" style="padding: 4px 8px; font-size: 11px;" onclick="verifyDispatcherItem(${idx})">
          ${item.status.includes('Confirmed') ? 'Dispatched' : 'Validate & Lock'}
        </button>
      </td>
    </tr>
  `).join('');
}

function verifyDispatcherItem(idx) {
  dispatcherQueue[idx].status = 'Confirmed & Truck Assigned';
  dispatcherQueue[idx].badge = 'tag-green';
  renderDispatcherTable();
  showToast(`Manifest ${dispatcherQueue[idx].id} verified and locked into Iraq TMS!`);
}

// HS Code & Customs Duty Estimator Tool
function initDutyEstimator() {
  const btn = document.getElementById('btn-calc-duty');
  const hsInput = document.getElementById('duty-hs-code');
  const valInput = document.getElementById('duty-cif-value');
  const resultBox = document.getElementById('duty-calc-result');

  if (btn && hsInput && valInput && resultBox) {
    btn.addEventListener('click', () => {
      const hs = hsInput.value.trim();
      const val = parseFloat(valInput.value) || 0;

      if (!val) {
        showToast('Please enter a valid CIF invoice value in USD.');
        return;
      }

      // Sample Iraq customs tariff rates (e.g. 5% to 15% standard plus Reconstruction/Surcharge)
      let tariffRate = 0.05;
      let category = 'Standard Manufactured Goods';

      if (hs.startsWith('84') || hs.startsWith('85')) {
        tariffRate = 0.05;
        category = 'Industrial Machinery / Electrical';
      } else if (hs.startsWith('30')) {
        tariffRate = 0.00; // Medical exemption
        category = 'Pharmaceuticals & Medicaments (Exempt)';
      } else if (hs.startsWith('61') || hs.startsWith('62')) {
        tariffRate = 0.15;
        category = 'Textiles & Apparel';
      } else if (hs.startsWith('02') || hs.startsWith('04') || hs.startsWith('19')) {
        tariffRate = 0.10;
        category = 'Foodstuffs & Agro Produce';
      }

      const customsDuty = Math.round(val * tariffRate);
      const asycudaFee = 85;
      const reconstructionSurcharge = Math.round(val * 0.02);
      const totalCustomsCost = customsDuty + asycudaFee + reconstructionSurcharge;

      resultBox.innerHTML = `
        <div style="background: var(--bg-tertiary); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-top: 16px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span>Detected Category:</span>
            <strong>${category}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span>Base Customs Tariff (${(tariffRate * 100)}%):</span>
            <strong>$${customsDuty.toLocaleString()} USD</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span>Iraq Reconstruction Surcharge (2%):</span>
            <strong>$${reconstructionSurcharge.toLocaleString()} USD</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span>ASYCUDA Electronic Stamp & Validation:</span>
            <strong>$${asycudaFee} USD</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 8px;">
            <span style="font-weight:700;">Total Estimated Duty & Taxes:</span>
            <strong style="color:var(--accent-amber); font-size: 16px;">$${totalCustomsCost.toLocaleString()} USD (${(totalCustomsCost * USD_TO_IQD_RATE).toLocaleString()} IQD)</strong>
          </div>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">Note: Subject to physical inspection green/yellow/red lane assignment by General Customs Commission.</p>
        </div>
      `;
    });
  }
}

// Modal helper functions
function initModals() {
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  window.openCustomQuoteModal = function() {
    const modal = document.getElementById('custom-solution-modal');
    if (modal) modal.classList.add('active');
  };

  window.openKnowledgeModal = function(topic) {
    const modal = document.getElementById('knowledge-modal');
    const title = document.getElementById('knowledge-modal-title');
    const content = document.getElementById('knowledge-modal-content');
    if (!modal || !title || !content) return;

    if (topic === 'guide') {
      title.textContent = '2026 Comprehensive Iraq Logistics & Transit Guide';
      content.innerHTML = `
        <p style="margin-bottom: 14px;">Iraq’s supply chain landscape is defined by its strategic position between Turkey, Iran, the GCC, and Jordan, alongside its premier maritime gate at Umm Qasr.</p>
        <h4 style="color:var(--accent-amber); margin: 12px 0 6px;">1. The North-South Transit Corridor</h4>
        <p style="margin-bottom: 12px;">Cargo entering via Ibrahim Khalil (Turkey) to Erbil can transit south to Baghdad and Basra. Federal customs inspection posts ensure duty reconciliation. Pre-registration of commercial invoices minimizes transit delays at Kirkuk and Diyala checkpoints.</p>
        <h4 style="color:var(--accent-amber); margin: 12px 0 6px;">2. Maritime Inflow at Umm Qasr</h4>
        <p style="margin-bottom: 12px;">Umm Qasr North and South terminals handle the lion’s share of containerized ocean freight. Utilizing pre-cleared electronic manifests avoids costly port demurrage.</p>
        <h4 style="color:var(--accent-amber); margin: 12px 0 6px;">3. Fuel and Route Volatility Mitigation</h4>
        <p>Logibox implements dual-carrier contingency contracts and live GPS waybill tracking to bypass unexpected road closures or seasonal weather congestion in mountainous northern passes.</p>
      `;
    } else if (topic === 'asycuda') {
      title.textContent = 'ASYCUDA World Implementation Across Iraqi Customs';
      content.innerHTML = `
        <p style="margin-bottom: 14px;">The rollout of ASYCUDA World across Iraqi land and sea borders has drastically modernized customs clearance, transitioning manual paperwork to digital Single Administrative Documents (SAD).</p>
        <h4 style="color:var(--accent-amber); margin: 12px 0 6px;">Key ASYCUDA Steps for Importers:</h4>
        <ul style="padding-left: 20px; line-height: 1.8; margin-bottom: 12px;">
          <li>Pre-declaration electronic entry (IM4 for home use, TR for international transit).</li>
          <li>Accurate 8-digit HS Code classification to avoid valuation penalties.</li>
          <li>Systemic risk assessment routing into Green (Immediate Clearance), Yellow (Document Audit), or Red (Physical Offloading/Inspection).</li>
        </ul>
        <p>Logibox licensed customs brokers manage this entire digital lifecycle directly on the customs server, eliminating document errors.</p>
      `;
    } else {
      title.textContent = 'Supply Chain Resilience in Iraq (VUCA Framework)';
      content.innerHTML = `
        <p style="margin-bottom: 14px;">Operating in Volatile, Uncertain, Complex, and Ambiguous (VUCA) conditions requires moving from passive reaction to proactive supply chain engineering.</p>
        <p style="margin-bottom: 12px;">By maintaining localized operations offices in Baghdad, Erbil, Basra, and Zakho, Logibox provides real-time ground intelligence that algorithms alone cannot deliver.</p>
      `;
    }

    modal.classList.add('active');
  };

  // Close modals on escape key or clicking overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}

function showToast(message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}
