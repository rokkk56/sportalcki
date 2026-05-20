/* const activities = [
  { sport:'Odbojka', city:'Ljubljana', date:'Jutri', time:'18:00', spots:3, level:'Srednja', gender:'Mešano', age:'18-30', emoji:'🏐', org:'Nika' },
  { sport:'Nogomet', city:'Maribor', date:'Petek', time:'20:00', spots:5, level:'Napredna', gender:'Moški', age:'18-30', emoji:'⚽', org:'Matej' },
  { sport:'Košarka', city:'Celje', date:'Sobota', time:'17:30', spots:2, level:'Srednja', gender:'Mešano', age:'15-18', emoji:'🏀', org:'Blaž' },
  { sport:'Tenis', city:'Kranj', date:'Nedelja', time:'10:00', spots:1, level:'Začetnik', gender:'Mešano', age:'30+', emoji:'🎾', org:'Sara' },
  { sport:'Tek', city:'Velenje', date:'Danes', time:'19:00', spots:0, level:'Začetnik', gender:'Mešano', age:'18-30', emoji:'🏃', org:'Jan' }
]; 
*/
let activities = [];
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
       <button onclick="toggleHeart(this)" class="heart-btn">♡</button>
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

function toggleHeart(button) {
  button.classList.toggle('liked');

  if (button.classList.contains('liked')) {
    button.textContent = '♥';
  } else {
    button.textContent = '♡';
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