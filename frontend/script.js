/* const activities = [
  { sport:'Odbojka', city:'Ljubljana', date:'Jutri', time:'18:00', spots:3, level:'Srednja', gender:'Mešano', age:'18-30', emoji:'🏐', org:'Nika' },
  { sport:'Nogomet', city:'Maribor', date:'Petek', time:'20:00', spots:5, level:'Napredna', gender:'Moški', age:'18-30', emoji:'⚽', org:'Matej' },
  { sport:'Košarka', city:'Celje', date:'Sobota', time:'17:30', spots:2, level:'Srednja', gender:'Mešano', age:'15-18', emoji:'🏀', org:'Blaž' },
  { sport:'Tenis', city:'Kranj', date:'Nedelja', time:'10:00', spots:1, level:'Začetnik', gender:'Mešano', age:'30+', emoji:'🎾', org:'Sara' },
  { sport:'Tek', city:'Velenje', date:'Danes', time:'19:00', spots:0, level:'Začetnik', gender:'Mešano', age:'18-30', emoji:'🏃', org:'Jan' }
]; 
*/
let activities = [];
let vseckaniOrganizatorji =[];
async function naloziAktivnosti(redniTermini) {
  try {
    var odgovor = null;

    if (redniTermini == true) {
      odgovor = await fetch('http://localhost:3000/api/redniTermini');
    }
    else {
      odgovor = await fetch('http://localhost:3000/api/aktivnosti');
    }


    if (!odgovor.ok) {
      const napakaPodatki = await odgovor.json();
      console.error("Backend je vrnil napako:", napakaPodatki);
      throw new Error(napakaPodatki.napaka || "Neznana napaka na strežniku.");
    }
    const podatkiIzBaze = await odgovor.json();

    activities = podatkiIzBaze.map(a => {
      let izpisanDatum = 'Neznano';
      let izpisanaUra = 'Neznano';

      if (a.datum) {
        const d = new Date(a.datum);
        izpisanDatum = d.toLocaleDateString('sl-SI');
        izpisanaUra = d.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
      }

      return {
        id: a.id_termin,
        organizatorId: a.organizator_id,
        title: a.naziv || 'Brez naziva',
        sport: a.sport || 'Aktivnost',
        venue: a.prizorisce || 'Neznano prizorišče',
        city: a.mesto || 'Neznano',
        date: izpisanDatum,
        time: izpisanaUra,
        spots: a.stevilomest !== undefined ? a.stevilomest : 0,
        description: a.opis || 'Brez opisa',
        level: a.zahtevnost || 'Srednja',
        gender: a.spol || 'Mešano',
        age: a.starostnaskupina || 'Vsi',
        komentarTekst: a.komentartekst || '',
        komentatorIme: a.komentatorime || '',
        komentatorPriimek: a.komentatorpriimek || '',

        emoji: a.sport === 'Nogomet' ? '⚽' :
          a.sport === 'Tenis' ? '🎾' :
            a.sport === 'Košarka' ? '🏀' :
              a.sport === 'Odbojka' ? '🏐' :
                a.sport === 'Badminton' ? '🏸' : '🏃',
        org: a.organizatorime + ' ' + a.organizatorpriimek || 'Neznan organizator'
      };
    });

    console.log(activities);
    await pridobiVseckaneIds();
    renderActivities();

  } catch (napaka) {
    console.error("Ujeta napaka v aplikaciji:", napaka.message);
    const list = document.getElementById('activityList');
    if (list) {
      list.innerHTML = `<p class="empty">Napaka pri nalaganju: ${napaka.message}</p>`;
    }
  }
}

function renderActivities() {
  const list = document.getElementById('activityList');
  if (!list) return;

  const search = document.getElementById('search').value.toLowerCase();
  const sport = document.getElementById('sport').value;
  const level = document.getElementById('level').value;
  const gender = document.getElementById('gender').value;
  const age = document.getElementById('age').value;
  const available = document.getElementById('available').checked;

  const filtered = activities.filter(a =>
    (a.sport.toLowerCase().includes(search) || a.city.toLowerCase().includes(search)) &&
    (!sport || a.sport === sport) &&
    (!level || a.level === level) &&
    (!gender || a.gender === gender) &&
    (!age || a.age === age) &&
    (!available || a.spots > 0)
  );
  list.innerHTML = filtered.map((a, index) => {
  let komentarHTML = '';
    if (a.komentarTekst) {
      komentarHTML = `
        <div class="feedback-box">
          <h6>Povratne informacije:</h6>
          <p class="comment-text">
            <strong>${a.komentatorIme} ${a.komentatorPriimek}:</strong> "${a.komentarTekst}"
          </p>
        </div>
      `;
    }
    const jeVseckan = vseckaniOrganizatorji.includes(a.organizatorId);

    return `
    <article class="activity-card">
      <div class="emoji">${a.emoji}</div>
      <div class="activity-info">
        <h2>${a.title} (${a.sport})</h2>
        <p>${a.date} ob ${a.time} · <strong>Lokacija:</strong> ${a.venue}, ${a.city} · <strong>Organizator:</strong> ${a.org}</p>
        <p class="activity-desc" style="font-style: italic; color: #555; margin-top: 5px;">${a.description}</p>
        <div class="tags" style="margin-top: 10px;">
          <span>${a.level}</span>
          <span>${a.gender}</span>
          <span>${a.age}</span>
          <span>${a.spots} prostih mest</span>
        </div>
        ${komentarHTML}
      </div>
      <div class="activity-buttons">
        <button onclick="toggleJoin(this)" class="btn ${a.spots > 0 ? 'primary' : 'disabled'} small" ${a.spots === 0 ? 'disabled' : ''}>
          ${a.spots > 0 ? 'Prijavi se' : 'Polno'}
        </button>
      </div>
       <button onclick="toggleHeart(this, ${a.organizatorId})" class="heart-btn ${jeVseckan ? 'liked' : ''}">${jeVseckan ? '♥' : '♡'}</button>
    </article>`;}).join('') || '<p class="empty">Ni najdenih aktivnosti za izbrane filtre.</p>';
}

function toggleJoin(button) {
  if (button.textContent === 'Prijavi se') {
    button.textContent = 'Odjavi se';
    button.classList.remove('primary');
    button.classList.add('danger');
  } else {
    button.textContent = 'Prijavi se';
    button.classList.remove('danger');
    button.classList.add('primary');
  }
}

function showSuccess(event) {
  event.preventDefault();
  document.getElementById('success').classList.remove('hidden');
}

document.querySelectorAll('#search, #sport, #level, #gender, #age, #available').forEach(el => {
  el.addEventListener('input', renderActivities);
  el.addEventListener('change', renderActivities);
});

const API_URL = "http://localhost:3000/api";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    message.textContent = "";
    message.classList.add("hidden");

    try {
      const odgovor = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const podatki = await odgovor.json();
      console.log("ODGOVOR IZ BACKENDA:", podatki);

      if (!odgovor.ok) {
        message.textContent = podatki.napaka || "Prijava ni uspela.";
        message.classList.remove("hidden");
        return;
      }

      localStorage.setItem("token", podatki.token);
      localStorage.setItem("uporabnik", JSON.stringify(podatki.uporabnik));

      const tip = podatki.uporabnik.tip.toLowerCase().trim();

      if (tip === "Administrator") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "profil.html";
      }

    } catch (err) {
      console.error(err);
      message.textContent = "Napaka pri povezavi s strežnikom.";
      message.classList.remove("hidden");
    }
  });
}

function odjava() {
  localStorage.removeItem("token");
  localStorage.removeItem("uporabnik");
  window.location.href = "prijava.html";
}

async function naloziAdminAktivnosti() {
  const adminList = document.getElementById("adminActivityList");

  if (!adminList) return;

  const token = localStorage.getItem("token");
  const uporabnik = JSON.parse(localStorage.getItem("uporabnik"));

  if (!token || !uporabnik || uporabnik.tip !== "Administrator") {
    window.location.href = "prijava.html";
    return;
  }

  try {
    const odgovor = await fetch(`${API_URL}/aktivnosti`);
    const aktivnosti = await odgovor.json();

    adminList.innerHTML = "";

    aktivnosti.forEach(a => {
      adminList.innerHTML += `
                <article class="activity-card">
                    <div class="emoji">
                        ${vrniIkonoSporta(a.sport)}
                    </div>

                    <div class="activity-info">
                        <h2>${a.naziv}</h2>
                        <p>
                            ${a.sport} · ${a.prizorisce}, ${a.mesto}
                        </p>
                        <p>
                            ${new Date(a.datum).toLocaleDateString("sl-SI")}
                        </p>

                        <div class="tags">
                            <span>${a.zahtevnost}</span>
                            <span>${a.stevilomest} prostih mest</span>
                        </div>
                    </div>

                    <div>
                        <button class="btn secondary small" onclick="urediAktivnost(${a.id_termin}, '${a.naziv}', ${a.stevilomest}, '${a.opis}', '${a.zahtevnost}')">
                            Uredi
                        </button>

                        <button class="btn danger small" onclick="izbrisiAktivnost(${a.id_termin})">
                            Izbriši
                        </button>
                    </div>
                </article>
            `;
    });

  } catch (err) {
    adminList.innerHTML = `
            <p class="empty">Napaka pri nalaganju aktivnosti.</p>
        `;
  }
}

function vrniIkonoSporta(sport) {
  if (sport === "Nogomet") return "⚽";
  if (sport === "Košarka") return "🏀";
  if (sport === "Odbojka") return "🏐";
  if (sport === "Tenis") return "🎾";
  if (sport === "Badminton") return "🏸";
  return "🏃";
}

async function izbrisiAktivnost(id) {
  const token = localStorage.getItem("token");

  if (!confirm("Ali res želiš izbrisati to aktivnost?")) {
    return;
  }

  await fetch(`${API_URL}/aktivnosti/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  naloziAdminAktivnosti();
}

async function urediAktivnost(id, starNaziv, staraMesta, starOpis, staraZahtevnost) {
  const token = localStorage.getItem("token");

  const naziv = prompt("Vnesi nov naziv:", starNaziv);
  const steviloMest = prompt("Vnesi število prostih mest:", staraMesta);
  const opis = prompt("Vnesi opis:", starOpis);
  const zahtevnost = prompt("Vnesi zahtevnost:", staraZahtevnost);

  if (!naziv || !steviloMest || !opis || !zahtevnost) {
    return;
  }

  await fetch(`${API_URL}/aktivnosti/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      naziv: naziv,
      steviloMest: steviloMest,
      opis: opis,
      zahtevnost: zahtevnost
    })
  });

  naloziAdminAktivnosti();
}
if (document.getElementById("adminActivityList")) {
  naloziAdminAktivnosti();
}


//nalozi komentarje
async function naloziKomentarje() {
  const container = document.getElementById("komentarji");
  if(!container) return;

  const odgovor = await fetch(`${API_URL}/komentarji`);
  const komentarji = await odgovor.json();

  container.innerHTML = "";

  komentarji.forEach(k => {
    container.innerHTML += `
    <div class="card">
      <p><b>${k.ime} ${k.priimek}:</b> ${k.komentar}</p>
      <small>${k.termin ? "Termin: " + k.termin : "Splošen komentar"}</small>
      </div>
      `;
  });
}

const komentarForm = document.getElementById("komentarForm");

if (komentarForm) {
  komentarForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const komentar = document.getElementById("komentarInput").value;
    const sporocilo = document.getElementById("komentarSporocilo");

    if(!token){
      sporocilo.textContent= "Za dodajanje komentarja se moraš prijaviti.";
      return;
    }

    const odgovor = await fetch(`${API_URL}/komentarji`, {
      method: "POST",
      headers : {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        komentar: komentar,
        terminId : null
      })
    });

    if(!odgovor.ok){
      sporocilo.textContent = "Napaka pri dodajanju komentarja.";
      return;
    }

    document.getElementById("komentarInput").value= "";
    sporocilo.textContent = "Komentar dodan.";

    naloziKomentarje();
  });
}

naloziKomentarje();

async function naloziMojeKomentarje() {
  const container = document.getElementById("mojiKomentarji");
  if(!container) return;

  const token = localStorage.getItem("token");

  if(!token){
    container.innerHTML = "<p>Za ogled komentarjev se moraš prijaviti.</p>";
    return;
  }

  const odgovor = await fetch(`${API_URL}/komentarji/moji`, {
    headers: {
      "Authorization" : `Bearer ${token}`
    }
  });

  const komentarji = await odgovor.json();

  container.innerHTML = "";

  komentarji.forEach(k =>{
    container.innerHTML += `
    <div class="card">
      <p>${k.komentar}</p>
      <small>${k.termin ? "Termin: " + k.termin : "Splošen komentar"}</small>
      </div>
      `;
  });
}

naloziMojeKomentarje();

async function naloziVseckaneOrganizatorje() {
  const container = document.getElementById("vseckaniOrganizatorji");
  if(!container) return;

  const token = localStorage.getItem("token");

  if(!token){
    container.innerHTML = "<p>Za ogled všečkanih organizatorjev se moraš prijaviti.</p>";
    return;
  }

  const odgovor = await fetch(`${API_URL}/organizatorji/vseckani`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const podatki = await odgovor.json();

  container.innerHTML = "";

  podatki.forEach(o => {
    container.innerHTML +=`
    <div class="notification">
      <div>
        <b>${o.ime} ${o.priimek}</b>
        <p>@${o.username}</p>
        <small>
          ${o.terminnaziv ? "Prihodnja aktivnost: " + o.terminnaziv : "Ni prihodnjih aktivnosti."}
        </small>
      </div>
    </div>`;
  });
}

naloziVseckaneOrganizatorje();

async function  toggleHeart(button, organizatorId) {
  const token = localStorage.getItem("token");

  if(!token){
    alert("Za všečkanje organizatorja se moraš prijaviti.");
    return;
  }

  button.classList.toggle("liked");
  const jeVseckan = button.classList.contains("liked");

  button.textContent = jeVseckan ? "♥" : "♡";

  await fetch (jeVseckan
    ? `${API_URL}/organizatorji/vseckani` :
    `${API_URL}/organizatorji/vseckani/${organizatorId}`,
    {
      method: jeVseckan ? "POST" : "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: jeVseckan
      ? JSON.stringify({organizatorId})
      : null
    }
  );
}

async function pridobiVseckaneIds() {
  const token = localStorage.getItem("token");

  if(!token) {
    vseckaniOrganizatorji = [];
    return;
  }

  try{
  const odgovor = await fetch(`${API_URL}/organizatorji/vseckani`, {
    headers: {
      "Authorization" : `Bearer ${token}`
    }
  });

  if(!odgovor.ok){
    vseckaniOrganizatorji = [];
    return;
  }

  const podatki = await odgovor.json();

  if(!Array.isArray(podatki)) {
    vseckaniOrganizatorji = [];
    return;
  }

  vseckaniOrganizatorji = podatki.map(o => o.id_uporabnik);
}catch (err){
  vseckaniOrganizatorji = [];
}
}

//uporabnosti admina
async function naloziAdminStran() {
  const oglasiBox = document.getElementById("adminOglasi");
  const komentarjiBox = document.getElementById("adminKomentarji");

  if (!oglasiBox || !komentarjiBox) return;

  const token = localStorage.getItem("token");
  const uporabnik = JSON.parse(localStorage.getItem("uporabnik"));

  if (
      !token ||
      !uporabnik ||
      uporabnik.tip !== "Administrator"
  ) {
    window.location.href = "prijava.html";
    return;
  }

  await naloziAdminOglase();
  await naloziAdminKomentarje();
}

async function naloziAdminOglase() {
  const oglasiBox = document.getElementById("adminOglasi");
  const token = localStorage.getItem("token");

  const odgovor = await fetch("http://localhost:3000/api/admin/oglasi", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const oglasi = await odgovor.json();

  if (!odgovor.ok) {
    oglasiBox.innerHTML = `<p class="empty">${oglasi.napaka}</p>`;
    return;
  }

  oglasiBox.innerHTML = oglasi.map(o => `
    <article class="activity-card">
      <div class="emoji">${vrniIkonoSporta(o.sport)}</div>

      <div class="activity-info">
        <h2>${o.naziv}</h2>
        <p>${o.sport} · ${o.prizorisce}, ${o.mesto}</p>
        <p>${new Date(o.datum).toLocaleDateString("sl-SI")}</p>
        <p>${o.opis || "Brez opisa"}</p>

        <div class="tags">
          <span>${o.zahtevnost}</span>
          <span>${o.stevilomest} prostih mest</span>
          <span>${o.organizatorime} ${o.organizatorpriimek}</span>
        </div>
      </div>

      <div>
        <button class="btn secondary small" onclick="urediAdminOglas(${o.id_termin}, '${o.naziv}', '${o.opis || ""}', ${o.stevilomest}, '${o.zahtevnost}')">
          Uredi
        </button>

        <button class="btn danger small" onclick="izbrisiAdminOglas(${o.id_termin})">
          Izbriši
        </button>
      </div>
    </article>
  `).join("");
}

async function naloziAdminKomentarje() {
  const komentarjiBox = document.getElementById("adminKomentarji");
  const token = localStorage.getItem("token");

  const odgovor = await fetch("http://localhost:3000/api/admin/komentarji", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const komentarji = await odgovor.json();

  if (!odgovor.ok) {
    komentarjiBox.innerHTML = `<p class="empty">${komentarji.napaka}</p>`;
    return;
  }

  komentarjiBox.innerHTML = komentarji.map(k => `
    <article class="activity-card">
      <div class="emoji">💬</div>

      <div class="activity-info">
        <h2>${k.username}</h2>
        <p>${k.vsebina}</p>
        <p>Aktivnost: ${k.termin}</p>
        <p>${new Date(k.datum).toLocaleDateString("sl-SI")}</p>
      </div>

      <div>
        <button class="btn danger small" onclick="izbrisiAdminKomentar(${k.id_komentar})">
          Izbriši
        </button>
      </div>
    </article>
  `).join("");
}

async function izbrisiAdminOglas(id) {
  const token = localStorage.getItem("token");

  if (!confirm("Ali res želiš izbrisati ta oglas?")) return;

  await fetch(`http://localhost:3000/api/admin/oglasi/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  naloziAdminOglase();
}

async function urediAdminOglas(id, starNaziv, starOpis, staraMesta, staraZahtevnost) {
  const token = localStorage.getItem("token");

  const naziv = prompt("Naziv oglasa:", starNaziv);
  const opis = prompt("Opis oglasa:", starOpis);
  const steviloMest = prompt("Število mest:", staraMesta);
  const zahtevnost = prompt("Zahtevnost:", staraZahtevnost);

  if (!naziv || !steviloMest || !zahtevnost) return;

  await fetch(`http://localhost:3000/api/admin/oglasi/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      naziv,
      opis,
      steviloMest,
      zahtevnost
    })
  });

  naloziAdminOglase();
}

async function izbrisiAdminKomentar(id) {
  const token = localStorage.getItem("token");

  if (!confirm("Ali res želiš izbrisati komentar?")) return;

  await fetch(`http://localhost:3000/api/admin/komentarji/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  naloziAdminKomentarje();
}

if (document.getElementById("adminOglasi")) {
  naloziAdminStran();
}


const dodajTerminForm = document.getElementById("activityForm");

if (dodajTerminForm) {
  dodajTerminForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const dateInput = document.getElementById('datum').value;
    const timeInput = document.getElementById('ura').value;
    const sqlDateTime = `${dateInput} ${timeInput}:00`;
    const successMessage = document.getElementById("successMessage");

    if(!token){
      sporocilo.textContent= "Za objavo termina se moraš prijaviti.";
      return;
    }

    const odgovor = await fetch(`${API_URL}/aktivnosti/dodaj`, {
      method: "POST",
      headers : {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        naziv: document.getElementById("naslov").value,
        datum: sqlDateTime,
        stevilomest: document.getElementById("mesta").value,
        opis: document.getElementById("opis").value,
        zahtevnost: document.getElementById("zahtevnost").value,
        starostnaskupina: document.getElementById("starost").value,
        spol: document.getElementById("spol").value,
        prizorisceid: document.getElementById("prizorisce").value,
        sportid: 1,
        rednitermin: document.getElementById("redno").checked
      })
    });

    if(!odgovor.ok){
      console.log(odgovor.json())
      successMessage.textContent = "Napaka pri dodajanju aktivnosti.";
      successMessage.classList.remove('hidden');
      return;
    }

    successMessage.textContent = "Aktivnost je bila uspešno objavljena.";
    successMessage.classList.remove('hidden');
    dodajTerminForm.reset();

  });
}

//prijava/odjava na termin
async function naloziMojePrijavljeneAktivnosti() {
  const container = document.getElementById("mojePrijavljeneAktivnosti");

  if (!container) return;

  const token = localStorage.getItem("token");

  if (!token) {
    container.innerHTML = "<p>Za ogled prijavljenih aktivnosti se moraš prijaviti.</p>";
    return;
  }

  try {
    const odgovor = await fetch(`${API_URL}/prijave/moje/aktivnosti`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const aktivnosti = await odgovor.json();

    if (!odgovor.ok) {
      container.innerHTML = `<p class="empty">${aktivnosti.napaka || "Napaka pri nalaganju aktivnosti."}</p>`;
      return;
    }

    if (aktivnosti.length === 0) {
      container.innerHTML = `<p class="empty">Nisi še prijavljen/a na nobeno aktivnost.</p>`;
      return;
    }

    container.innerHTML = aktivnosti.map(function (a) {
      const datum = new Date(a.datum).toLocaleDateString("sl-SI");
      const ura = new Date(a.datum).toLocaleTimeString("sl-SI", {
        hour: "2-digit",
        minute: "2-digit"
      });

      return `
        <article class="activity-card">
          <div class="emoji">${vrniIkonoSporta(a.sport)}</div>

          <div class="activity-info">
            <h2>${a.naziv} (${a.sport})</h2>
            <p>
              ${datum} ob ${ura} ·
              <strong>Lokacija:</strong> ${a.prizorisce}, ${a.mesto} ·
              <strong>Organizator:</strong> ${a.organizatorime || ""} ${a.organizatorpriimek || ""}
            </p>
            <p class="activity-desc" style="font-style: italic; color: #555; margin-top: 5px;">
              ${a.opis || "Brez opisa"}
            </p>

            <div class="tags" style="margin-top: 10px;">
              <span>${a.zahtevnost || ""}</span>
              <span>${a.spol || ""}</span>
              <span>${a.starostnaskupina || ""}</span>
            </div>
          </div>

          <div class="activity-buttons">
            <button onclick="odjaviSeIzProfila(${a.id_termin})" class="btn danger small">
              Odjavi se
            </button>
          </div>
        </article>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="empty">Napaka pri povezavi s strežnikom.</p>`;
  }
}

async function odjaviSeIzProfila(terminId) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Za odjavo se moraš prijaviti.");
    return;
  }

  const odgovor = await fetch(`${API_URL}/prijave/${terminId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const podatki = await odgovor.json();

  if (!odgovor.ok) {
    alert(podatki.napaka || "Napaka pri odjavi.");
    return;
  }

  alert(podatki.sporocilo);
  naloziMojePrijavljeneAktivnosti();
}

naloziMojePrijavljeneAktivnosti();

//popravljen navbar
function urediNavbar() {
  const loginLink = document.getElementById("loginLink");
  const profileLink = document.getElementById("profileLink");
  const adminLink = document.getElementById("adminLink");
  const logoutLink = document.getElementById("logoutLink");

  const token = localStorage.getItem("token");
  const uporabnik = JSON.parse(localStorage.getItem("uporabnik"));

  if (!loginLink || !profileLink || !adminLink || !logoutLink) return;

  if (token && uporabnik) {
    loginLink.classList.add("hidden");
    profileLink.classList.remove("hidden");
    logoutLink.classList.remove("hidden");

    if (uporabnik.tip.toLowerCase().trim() === "administrator") {
      adminLink.classList.remove("hidden");
    } else {
      adminLink.classList.add("hidden");
    }
  } else {
    loginLink.classList.remove("hidden");
    profileLink.classList.add("hidden");
    adminLink.classList.add("hidden");
    logoutLink.classList.add("hidden");
  }
}

urediNavbar();

function odjava() {
  localStorage.removeItem("token");
  localStorage.removeItem("uporabnik");
  window.location.href = "prijava.html";
}

const tip = podatki.uporabnik.tip.toLowerCase().trim();

if (tip === "administrator") {
  window.location.href = "admin.html";
} else {
  window.location.href = "profil.html";
}
