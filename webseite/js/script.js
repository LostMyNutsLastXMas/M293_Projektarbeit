// ===== SLIDER (Startseite) =====

function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.slider-btn.prev');
  const nextBtn = document.querySelector('.slider-btn.next');

  if (slides.length === 0) return; // Nicht auf der Startseite

  let aktuellerSlide = 0;

  function zeigeSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    aktuellerSlide = (index + slides.length) % slides.length;
    slides[aktuellerSlide].classList.add('active');
  }

  prevBtn.addEventListener('click', () => zeigeSlide(aktuellerSlide - 1));
  nextBtn.addEventListener('click', () => zeigeSlide(aktuellerSlide + 1));

  // Automatisches Weiterschalten alle 5 Sekunden
  setInterval(() => zeigeSlide(aktuellerSlide + 1), 5000);
}


// ===== KALENDER =====

let aktuellerMonat = new Date().getMonth();
let aktuellesJahr = new Date().getFullYear();
let termine = JSON.parse(localStorage.getItem('termine')) || [];

const monatsNamen = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

function initKalender() {
  const kalenderTage = document.getElementById('kalenderTage');
  if (!kalenderTage) return; // Nicht auf der Kalender-Seite

  renderKalender();

  // Monat-Navigation
  document.getElementById('btnVorherigerMonat').addEventListener('click', () => {
    aktuellerMonat--;
    if (aktuellerMonat < 0) {
      aktuellerMonat = 11;
      aktuellesJahr--;
    }
    renderKalender();
  });

  document.getElementById('btnNaechsterMonat').addEventListener('click', () => {
    aktuellerMonat++;
    if (aktuellerMonat > 11) {
      aktuellerMonat = 0;
      aktuellesJahr++;
    }
    renderKalender();
  });

  // Modal öffnen/schliessen
  document.getElementById('btnTerminHinzufuegen').addEventListener('click', () => {
    oeffneModal();
  });

  document.getElementById('btnAbbrechen').addEventListener('click', schliesseModal);

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) schliesseModal();
  });

  // Termin speichern
  document.getElementById('btnSpeichern').addEventListener('click', terminSpeichern);
}

function renderKalender() {
  const kalenderTage = document.getElementById('kalenderTage');
  const monatLabel = document.getElementById('monatLabel');

  monatLabel.textContent = `${monatsNamen[aktuellerMonat]} ${aktuellesJahr}`;

  // Erster Tag des Monats (0 = Sonntag, 1 = Montag, ...)
  const ersterTag = new Date(aktuellesJahr, aktuellerMonat, 1).getDay();
  // Umrechnung: Sonntag (0) wird zu 6, Montag (1) wird zu 0, etc.
  const startTag = ersterTag === 0 ? 6 : ersterTag - 1;

  // Anzahl Tage im Monat
  const anzahlTage = new Date(aktuellesJahr, aktuellerMonat + 1, 0).getDate();

  // Heutiges Datum
  const heute = new Date();
  const heuteTag = heute.getDate();
  const heuteMonat = heute.getMonth();
  const heuteJahr = heute.getFullYear();

  let html = '';

  // Leere Zellen vor dem ersten Tag
  for (let i = 0; i < startTag; i++) {
    html += '<div class="kalender-tag leer"></div>';
  }

  // Tage des Monats
  for (let tag = 1; tag <= anzahlTage; tag++) {
    const istHeute = tag === heuteTag && aktuellerMonat === heuteMonat && aktuellesJahr === heuteJahr;
    const datumStr = `${aktuellesJahr}-${String(aktuellerMonat + 1).padStart(2, '0')}-${String(tag).padStart(2, '0')}`;

    // Termine für diesen Tag finden
    const tagesTermine = termine.filter(t => t.datum === datumStr);

    html += `
      <div class="kalender-tag ${istHeute ? 'heute' : ''}" data-datum="${datumStr}">
        <div class="tag-nummer">${tag}</div>
        ${tagesTermine.map(t => `<div class="termin-marker" data-index="${termine.indexOf(t)}">${t.titel}</div>`).join('')}
      </div>
    `;
  }

  kalenderTage.innerHTML = html;

  // Klick auf Termin-Marker öffnet Detail-Modal
  document.querySelectorAll('.termin-marker').forEach(marker => {
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(marker.dataset.index);
      oeffneDetailModal(index);
    });
  });

  // Klick auf einen Tag öffnet Modal mit vorbefülltem Datum
  document.querySelectorAll('.kalender-tag:not(.leer)').forEach(tag => {
    tag.addEventListener('click', () => {
      oeffneModal(tag.dataset.datum);
    });
  });
}

let aktiverTerminIndex = null;

function oeffneDetailModal(index) {
  const termin = termine[index];
  aktiverTerminIndex = index;

  document.getElementById('detailTitel').textContent = termin.titel;
  document.getElementById('detailDatum').textContent = 'Datum: ' + termin.datum;
  document.getElementById('detailZeit').textContent = termin.zeit ? 'Uhrzeit: ' + termin.zeit : '';

  const overlay = document.getElementById('detailModalOverlay');
  overlay.classList.add('active');

  document.getElementById('btnDetailSchliessen').onclick = () => overlay.classList.remove('active');
  overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('active'); };

  document.getElementById('btnAbsagen').onclick = () => {
    termine.splice(aktiverTerminIndex, 1);
    localStorage.setItem('termine', JSON.stringify(termine));
    overlay.classList.remove('active');
    renderKalender();
  };
}

function oeffneModal(datum) {
  const modal = document.getElementById('modalOverlay');
  const datumInput = document.getElementById('terminDatum');

  if (datum) {
    datumInput.value = datum;
  } else {
    // Standardmässig heutiges Datum setzen
    const heute = new Date();
    datumInput.value = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, '0')}-${String(heute.getDate()).padStart(2, '0')}`;
  }

  document.getElementById('terminTitel').value = '';
  document.getElementById('terminZeit').value = '';
  modal.classList.add('active');
}

function schliesseModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function terminSpeichern() {
  const datum = document.getElementById('terminDatum').value;
  const titel = document.getElementById('terminTitel').value.trim();
  const zeit = document.getElementById('terminZeit').value;

  if (!datum || !titel) {
    alert('Bitte Datum und Titel eingeben.');
    return;
  }

  termine.push({ datum, titel, zeit });

  // Im localStorage speichern
  localStorage.setItem('termine', JSON.stringify(termine));

  schliesseModal();
  renderKalender();
}


// ===== INSPIRATIONEN =====

let inspirationen = JSON.parse(localStorage.getItem('inspirationen')) || [];

function initInspirationen() {
  const liste = document.getElementById('inspirationenListe');
  if (!liste) return;

  renderInspirationen();

  document.getElementById('btnAktivitaetHinzufuegen').addEventListener('click', () => {
    document.getElementById('modalOverlay').classList.add('active');
  });

  document.getElementById('btnAbbrechen').addEventListener('click', schliesseInspirationenModal);

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) schliesseInspirationenModal();
  });

  document.getElementById('btnSpeichern').addEventListener('click', aktivitaetSpeichern);
}

function renderInspirationen() {
  const liste = document.getElementById('inspirationenListe');
  const leer = document.getElementById('inspirationenLeer');

  if (inspirationen.length === 0) {
    liste.innerHTML = '';
    leer.classList.add('sichtbar');
    return;
  }

  leer.classList.remove('sichtbar');
  liste.innerHTML = inspirationen.map(item => `
    <div class="inspirations-karte">
      ${item.bild
        ? `<img class="inspirations-bild" src="${item.bild}" alt="${item.titel}" onerror="this.replaceWith(erstellePlaceholder())">`
        : `<div class="inspirations-bild-placeholder">&#127774;</div>`
      }
      <div class="inspirations-inhalt">
        <h2>${item.titel}</h2>
        <p>${item.beschreibung}</p>
      </div>
    </div>
  `).join('');
}

function erstellePlaceholder() {
  const div = document.createElement('div');
  div.className = 'inspirations-bild-placeholder';
  div.innerHTML = '&#127774;';
  return div;
}

function schliesseInspirationenModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('aktivitaetTitel').value = '';
  document.getElementById('aktivitaetBeschreibung').value = '';
  document.getElementById('aktivitaetBild').value = '';
}

function aktivitaetSpeichern() {
  const titel = document.getElementById('aktivitaetTitel').value.trim();
  const beschreibung = document.getElementById('aktivitaetBeschreibung').value.trim();
  const bild = document.getElementById('aktivitaetBild').value.trim();

  if (!titel) {
    alert('Bitte einen Titel eingeben.');
    return;
  }

  inspirationen.push({ titel, beschreibung, bild });
  localStorage.setItem('inspirationen', JSON.stringify(inspirationen));

  schliesseInspirationenModal();
  renderInspirationen();
}


// ===== LOGIN =====

const LOGIN_BENUTZER = 'lucas';
const LOGIN_PASSWORT_DEFAULT = 'wochende123';

function getPasswort() {
  return localStorage.getItem('passwort') || LOGIN_PASSWORT_DEFAULT;
}

function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const benutzername = document.getElementById('loginBenutzername').value.trim();
    const passwort = document.getElementById('loginPasswort').value;
    const fehler = document.getElementById('loginFehler');

    if (benutzername === LOGIN_BENUTZER && passwort === getPasswort()) {
      sessionStorage.setItem('eingeloggt', 'true');
      window.location.href = 'index.html';
    } else {
      fehler.classList.add('sichtbar');
    }
  });

  // Passwort vergessen
  document.getElementById('btnPasswortVergessen').addEventListener('click', () => {
    document.getElementById('passwortReset').classList.toggle('sichtbar');
    document.getElementById('neuesPasswort').value = '';
    document.getElementById('resetFehler').classList.remove('sichtbar');
    document.getElementById('resetErfolg').classList.remove('sichtbar');
  });

  document.getElementById('btnResetAbbrechen').addEventListener('click', () => {
    document.getElementById('passwortReset').classList.remove('sichtbar');
  });

  document.getElementById('btnResetSpeichern').addEventListener('click', () => {
    const neuesPasswort = document.getElementById('neuesPasswort').value;
    const fehler = document.getElementById('resetFehler');
    const erfolg = document.getElementById('resetErfolg');

    if (!neuesPasswort) {
      fehler.classList.add('sichtbar');
      return;
    }

    fehler.classList.remove('sichtbar');
    localStorage.setItem('passwort', neuesPasswort);
    erfolg.classList.add('sichtbar');

    setTimeout(() => {
      document.getElementById('passwortReset').classList.remove('sichtbar');
      erfolg.classList.remove('sichtbar');
    }, 2000);
  });
}

function initAbmelden() {
  const btn = document.getElementById('btnAbmelden');
  if (!btn) return;
  btn.addEventListener('click', () => {
    sessionStorage.removeItem('eingeloggt');
    window.location.href = 'login.html';
  });
}

function pruefLogin() {
  const istLoginSeite = !!document.getElementById('loginForm');
  const eingeloggt = sessionStorage.getItem('eingeloggt') === 'true';

  if (!istLoginSeite && !eingeloggt) {
    window.location.href = 'login.html';
  }
}


// ===== INITIALISIERUNG =====
document.addEventListener('DOMContentLoaded', () => {
  pruefLogin();
  initLogin();
  initAbmelden();
  initSlider();
  initKalender();
  initInspirationen();
});
