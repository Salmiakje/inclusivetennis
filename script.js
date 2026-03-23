
const partners = [
  {
    id: "wimbledon",
    name: "Wimbledon",
    type: "academic",
    lat: 51.4343, lng: -0.2140,
    img: "img/Wimbledon.jpg",
    blurb: "Tennislocatie in Londen (Wimbledon).",
    website: "https://www.wimbledon.com/",
    gmaps: "https://www.google.com/maps?q=Wimbledon"
  },
  {
    id: "manchester",
    name: "Manchester City Tennis Club",
    type: "corporate",
    lat: 53.4808, lng: -2.2426,
    img: "img/manchestercitytennisclub.jpg",
    blurb: "Partner in Manchester met rijke tennistraditie.",
    website: "https://example.com/manchester-tennis",
    gmaps: "https://www.google.com/maps?q=Manchester+City+Tennis+Club"
  },
  {
    id: "edinburgh",
    name: "Tennis Edinburgh",
    type: "academic",
    lat: 55.9533, lng: -3.1883,
    img: "img/Tennis-edinburgh.jpg",
    blurb: "Partner in Edinburgh, Schotland.",
    website: "https://example.com/tennis-edinburgh",
    gmaps: "https://www.google.com/maps?q=Edinburgh"
  }
];

/* ---------- In je lijst-rendering: encodeURI voor paden met spaties ---------- */
function renderList(items) {
  const listEl = document.getElementById('partner-list');
  listEl.innerHTML = '';
  items.forEach(p => {
    const li = document.createElement('li');
    li.className = 'partner-item';
    li.dataset.id = p.id;

    const safeImg = encodeURI(p.img); // <-- belangrijk bij (oude) bestandsnamen met spaties

    li.innerHTML = `
      <img class="partner-thumb" src="${safeImg}" alt="${p.name}">
      <div class="partner-meta">
        <h4 class="partner-name">${p.name}</h4>
        <p class="partner-type">${p.type === 'academic' ? 'Academic' : 'Corporate'}</p>
      </div>
    `;

    li.addEventListener('click', () => {
      const marker = markerById.get(p.id);
      if (marker) {
        map.setView(marker.getLatLng(), 8, { animate: true });
        marker.openPopup();
        openModal(p);
        highlightListItem(p.id);
      }
    });

    listEl.appendChild(li);
  });
}

/* ---------- In je modal: ook encodeURI ---------- */
function openModal(p) {
  document.getElementById('modal-img').src = encodeURI(p.img);
  document.getElementById('modal-title').textContent = p.name;
  document.getElementById('modal-text').textContent = p.blurb || '';
  document.getElementById('modal-site').href = p.website || '#';
  document.getElementById('modal-gmaps').href = p.gmaps || '#';

  const modal = document.getElementById('info-modal');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}


/* ---------- KAART INITIALISEREN (Leaflet) ---------- */
const map = L.map('map', {scrollWheelZoom: true});

// OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
}).addTo(map);

// Start: focus op UK (kun je anders instellen)
map.setView([54.5, -3.0], 5);

/* (Optioneel) Clusterlaag als je straks veel markers krijgt */
const useClustering = true;
const clusterGroup = useClustering ? L.markerClusterGroup() : null;

/* ---------- MARKERS AANMAKEN ---------- */
const markerById = new Map();

function createMarker(p) {
  const marker = L.marker([p.lat, p.lng]);

  // Pop-up (klein) – toont kerninfo en knoppen
  const popupHtml = `
    <div style="width: 220px;">
      <div style="font-weight:700; margin-bottom:6px;">${p.name}</div>
      <div style="font-size:12px; color:#5a6a7d; margin-bottom:8px;">${p.type === 'academic' ? 'Academic' : 'Corporate'}</div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <a href="${p.website}" target="_blank" rel="noopener" style="text-decoration:none; color:#004c97; font-weight:600;">Website</a>
        <a href="${p.gmaps}" target="_blank" rel="noopener" style="text-decoration:none; color:#0077cc; font-weight:600;">Google Maps</a>
      </div>
    </div>
  `;

  marker.bindPopup(popupHtml, { closeButton: true });

  // Klik op marker → open onze eigen modal (met afbeelding & langere tekst)
  marker.on('click', () => openModal(p));

  markerById.set(p.id, marker);
  return marker;
}

const allMarkers = partners.map(createMarker);

if (useClustering) {
  clusterGroup.addLayers(allMarkers);
  clusterGroup.addTo(map);
} else {
  allMarkers.forEach(m => m.addTo(map));
}

/* ---------- ZIJBALK (LIJST) OPBOUWEN ---------- */
const listEl = document.getElementById('partner-list');

function renderList(items) {
  listEl.innerHTML = '';
  items.forEach(p => {
    const li = document.createElement('li');
    li.className = 'partner-item';
    li.dataset.id = p.id;

    // Afbeelding met encodeURI (als er spaties in pad zitten)
    const safeImg = encodeURI(p.img);

    li.innerHTML = `
      <img class="partner-thumb" src="${safeImg}" alt="${p.name}" />
      <div class="partner-meta">
        <h4 class="partner-name">${p.name}</h4>
        <p class="partner-type">${p.type === 'academic' ? 'Academic' : 'Corporate'}</p>
      </div>
    `;

    li.addEventListener('click', () => {
      const marker = markerById.get(p.id);
      if (marker) {
        map.setView(marker.getLatLng(), 8, { animate: true });
        marker.openPopup();
        openModal(p);
        highlightListItem(p.id);
      }
    });

    listEl.appendChild(li);
  });
}

function highlightListItem(id) {
  document.querySelectorAll('.partner-item').forEach(el => el.classList.remove('active'));
  const el = [...document.querySelectorAll('.partner-item')].find(li => li.dataset.id === id);
  if (el) el.classList.add('active');
}

/* Init lijst (alle partners) */
renderList(partners);

/* ---------- FILTERS ---------- */
const chips = document.querySelectorAll('.chip');
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;

    // 1) Filter dataset
    const filtered = filter === 'all' ? partners : partners.filter(p => p.type === filter);

    // 2) Herteken markers
    if (useClustering) {
      clusterGroup.clearLayers();
      clusterGroup.addLayers(filtered.map(p => markerById.get(p.id)));
    } else {
      allMarkers.forEach(m => m.remove());
      filtered.forEach(p => markerById.get(p.id).addTo(map));
    }

    // 3) Lijst verversen
    renderList(filtered);

    // 4) Kaart fitten op zichtbare markers
    const group = L.featureGroup(filtered.map(p => markerById.get(p.id)));
    if (filtered.length) map.fitBounds(group.getBounds().pad(0.2));
  });
});

/* ---------- MODAL (grote kaartkaart) ---------- */
const modal = document.getElementById('info-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const modalSite = document.getElementById('modal-site');
const modalGmaps = document.getElementById('modal-gmaps');
const modalClose = document.querySelector('.modal-close');

function openModal(p) {
  modalImg.src = encodeURI(p.img);
  modalTitle.textContent = p.name;
  modalText.textContent = p.blurb || '';
  modalSite.href = p.website || '#';
  modalGmaps.href = p.gmaps || '#';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  highlightListItem(p.id);
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal(); // klik op overlay sluit modal
});

// Escape-toets sluit modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
