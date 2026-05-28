-- KREIRANJE TABEL
CREATE TABLE TipUporabnika (
    id_TipUporabnika SERIAL PRIMARY KEY,
    Naziv VARCHAR (255) NOT NULL,
    Opis TEXT
);

CREATE TABLE Uporabnik(
    id_Uporabnik SERIAL PRIMARY KEY,
    Ime VARCHAR (255) NOT NULL,
    Priimek VARCHAR (255) NOT NULL, 
    Username VARCHAR (64) UNIQUE NOT NULL,
    Password VARCHAR (255) NOT NULL,
    Email VARCHAR (255) UNIQUE NOT NULL,
    DatumRojstva TIMESTAMP,
    Spol VARCHAR (30),
    TipUporabnikaid_TipUporabnika INTEGER REFERENCES TipUporabnika(id_TipUporabnika)
);
CREATE TABLE Skupina (
    id_Skupina SERIAL PRIMARY KEY,
    Naziv VARCHAR(255) UNIQUE NOT NULL,
    MaxStevilo INTEGER NOT NULL
);

CREATE TABLE Prizorisce (
    id_Prizorisce SERIAL PRIMARY KEY,
    Naziv VARCHAR(255) NOT NULL,
    Kapaciteta INTEGER,
    Ulica VARCHAR(255),
    Mesto VARCHAR(255),
    Drzava VARCHAR(255),
    Opis VARCHAR(255) 
);

CREATE TABLE Sport (
    id_Sport SERIAL PRIMARY KEY,
    Naziv VARCHAR(255) NOT NULL
);

CREATE TABLE Termin (
    id_Termin SERIAL PRIMARY KEY,
    Naziv VARCHAR(255) NOT NULL,
    Datum TIMESTAMP NOT NULL,
    SteviloMest INTEGER,
    Opis VARCHAR(255),
    Zahtevnost VARCHAR (30),
    StarostnaSkupina VARCHAR (255),
    Spol VARCHAR (30),
    Prizorisceid_Prizorisce INTEGER REFERENCES Prizorisce(id_Prizorisce),
    Sportid_Sport INTEGER REFERENCES Sport(id_Sport),
    Uporabnikid_Organizator INTEGER REFERENCES Uporabnik(id_Uporabnik),
    RedniTermin BOOLEAN DEFAULT FALSE
);

CREATE TABLE Ocena (
    id_Ocena SERIAL PRIMARY KEY,
    Uporabnikid_Uporabnik INTEGER REFERENCES Uporabnik(id_Uporabnik) ON DELETE CASCADE,
    Uporabnikid_Organizator INTEGER REFERENCES Uporabnik(id_Uporabnik) ON DELETE CASCADE,
    Ocena INTEGER CHECK (Ocena >= 1 AND Ocena <= 5),
    Opis VARCHAR(255),
    Terminid_Termin INTEGER REFERENCES Termin(id_Termin) ON DELETE SET NULL
);
CREATE TABLE Uporabnik_Skupina (
    id_Uporabnik_Skupina SERIAL PRIMARY KEY,
    Uporabnikid_Uporabnik INTEGER REFERENCES Uporabnik(id_Uporabnik) ON DELETE CASCADE,
    Skupinaid_Skupina INTEGER REFERENCES Skupina(id_Skupina) ON DELETE CASCADE
);

CREATE TABLE Uporabnik_Termin (
    id_Uporabnik_Termin SERIAL PRIMARY KEY,
    Uporabnikid_Uporabnik INTEGER REFERENCES Uporabnik(id_Uporabnik) ON DELETE CASCADE,
    Terminid_Termin INTEGER REFERENCES Termin(id_Termin) ON DELETE CASCADE 
);

CREATE TABLE Termin_Skupina (
    id SERIAL PRIMARY KEY,
    Terminid_Termin INTEGER REFERENCES Termin(id_Termin) ON DELETE CASCADE,
    Skupinaid_Skupina INTEGER REFERENCES Skupina(id_Skupina) ON DELETE CASCADE
);

CREATE TABLE Komentar (
    id_Komentar SERIAL PRIMARY KEY,
    Uporabnikid_Uporabnik INTEGER REFERENCES Uporabnik(id_Uporabnik),
    Komentar VARCHAR(255) NOT NULL,
    Terminid_Termin INTEGER REFERENCES Termin(id_Termin) NULL
);

CREATE TABLE VseckaniOrganizator (
    id_VseckanOrganizator SERIAL PRIMARY KEY ,
    Uporabnikid_Uporabnik INTEGER REFERENCES Uporabnik(id_Uporabnik) ON DELETE CASCADE,
    Organizatorid_Uporabnik INTEGER REFERENCES Uporabnik(id_Uporabnik) ON DELETE CASCADE,
    UNIQUE (Uporabnikid_Uporabnik, Organizatorid_Uporabnik)
);

-- VNOS PODATKOV
INSERT INTO TipUporabnika (Naziv, Opis) VALUES
('Uporabnik', 'Registrirani uporabnik, ki se lahko prijavi/odjavi od termina'),
('Administrator', 'Sistemski administrator z vsemi pravicami upravljanja.'),
('Organizator', 'Uporabnik, ki lahko ustvarja nove termine in upravlja skupine.');

INSERT INTO Uporabnik (Ime, Priimek, Username, Password, Email, DatumRojstva, Spol, TipUporabnikaid_TipUporabnika) VALUES 
('Anže', 'Novak', 'anze_n', 'geslo123', 'anze.novak@email.si', '1992-04-10', 'Moški', 3),
('Maja', 'Korošec', 'maja_admin', 'admin_pass', 'maja.k@sport.si', '1988-11-20', 'Ženska', 2),
('Borut', 'Pahor', 'borut_org', 'org_pass', 'borut@klub.si', '1985-01-30', 'Moški', 3),
('Luka', 'Dončič', 'luka77', 'basket123', 'luka@dallas.com', '1999-02-28', 'Moški', 3),
('Sara', 'Zupan', 'sara_z', 'sara123', 'sara.zupan@gmail.com', '1996-07-15', 'Ženska', 3),
('Jan', 'Oblak', 'jan_o', 'oblak_wall', 'jan.oblak@atletico.es', '1993-01-07', 'Moški', 3),
('Tina', 'Maze', 'tina_maze', 'ski_fast', 'tina@stave.si', '1983-05-02', 'Ženska', 1),
('Marko', 'Hribar', 'marko_h', 'marko123', 'marko.hribar@podjetje.si', '1990-12-12', 'Moški', 2),
('Petra', 'Majdič', 'petra_m', 'tek_tek', 'petra.m@siol.net', '1979-12-22', 'Ženska', 1),
('Tadej', 'Pogačar', 'pogi_1', 'cycling_king', 'tadej@tour.fr', '1998-09-21', 'Moški', 1),
('Matic', 'Horvat', 'matic_h', 'matic2026', 'matic.horvat@email.si', '1995-07-15', 'Moški', 1),
('Lana', 'Zupančič', 'lana_z', 'varnogeslo', 'lana.zupan@email.si', '2001-02-28', 'Ženska', 1),
('Luka', 'Krajnc', 'luka_k', 'sifra99', 'luka.krajnc@email.si', '1990-12-05', 'Moški', 1),
('Ema', 'Potočnik', 'ema_p', 'mojogeslo1', 'ema.potocnik@email.si', '2003-05-14', 'Ženska', 1),
('Rok', 'Kovačič', 'rok_kovac', 'rok_pass', 'rok.kovacic@email.si', '1987-09-22', 'Moški', 1),
('Nika', 'Mlakar', 'nika_m', 'snezinka8', 'nika.mlakar@email.si', '1998-10-31', 'Ženska', 3),
('Tilen', 'Kralj', 'tilen_k', 'geslo1234', 'tilen.kralj@email.si', '1994-03-12', 'Moški', 1),
('Sara', 'Zec', 'sara_m', 'sara_pass', 'sara.zec@email.si', '2000-08-19', 'Ženska', 1),
('Jan', 'Medved', 'jan_m', 'medo99', 'jan.medved@email.si', '2006-11-02', 'Moški', 1),
('Mia', 'Hribar', 'mia_h', 'soncek2026', 'mia.hribar@email.si', '2004-01-25', 'Ženska', 3),
('Borut', 'Kavčič', 'borut_k', 'sifra777', 'borut.kavcic@email.si', '2005-05-30', 'Moški', 1),
('Anja', 'Bizjak', 'anja_b', 'varno123', 'anja.bizjak@email.si', '2001-12-14', 'Ženska', 1),
('David', 'Kos', 'david_kos', 'david_p', 'david.kos@email.si', '2004-06-08', 'Moški', 1),
('Zala', 'Vidmar', 'zala_v', 'metuljcek', 'zala.vidmar@email.si', '2002-09-21', 'Ženska', 1),
('Klemen', 'Pirc', 'klemen_p', 'klemen90', 'klemen.pirc@email.si', '2005-04-03', 'Moški', 1),
('Teja', 'Gorenc', 'teja_g', 'gesloTeja', 'teja.gorenc@email.si', '2004-07-07', 'Ženska', 1),
('Gašper', 'Rozman', 'gasper_r', 'rozi2026', 'gasper.rozman@email.si', '1996-02-11', 'Moški', 1),
('Neža', 'Leban', 'neza_l', 'skrivnost', 'neza.leban@email.si', '2001-10-18', 'Ženska', 1),
('Jure', 'Eržen', 'jure_e', 'jurepass', 'jure.erzen@email.si', '1999-08-24', 'Moški', 1),
('Eva', 'Kastelic', 'eva_k', 'jesen2026', 'eva.kastelic@email.si', '2003-03-05', 'Ženska', 1),
('Urban', 'Turk', 'urban_t', 'urban123', 'urban.turk@email.si', '2005-11-12', 'Moški', 1);

INSERT INTO Skupina (Naziv, MaxStevilo) VALUES 
('Ljubljanski nogometaši', 20),
('Obalni tenisači', 12),
('Košarkarski veterani', 15),
('Badminton navdušenci', 8),
('Košarkaši Dončič', 10),
('Odbojkaši na mivki', 10),
('Maratonci', 60),
('Tenisači Žabica', 6),
('Ženski badminton krožek', 10),
('Ženski tekaški krožek', 30);

INSERT INTO Prizorisce (Naziv, Kapaciteta, Ulica, Mesto, Drzava, Opis) VALUES 
('Športni center Jamova', 100, 'Jamova cesta 2', 'Ljubljana', 'Slovenija', 'Glavna dvorana'),
('Igrišča ob morju', 40, 'Koprska ulica 10', 'Koper', 'Slovenija', 'Zunanja igrišča'),
('Športni park Maribor', 80, 'Gosposvetska cesta 15', 'Maribor', 'Slovenija', 'Večnamenski objekt'),
('Dvorana Podmežakla', 200, 'Ledarska 4', 'Jesenice', 'Slovenija', 'Ledna in športna dvorana'),
('Dvorana Stožice', 30, 'Zmajev drevored 99', 'Ljubljana', 'Slovenija', 'Omogoča igranje 2 polnih ekip z menjavami'),
('Športni center Triton', 12, 'Podvodna pot 13', 'Piran', 'Slovenija', 'Odbojka na mivki ob morju'),
('Dvorana Arena Kurent', 30, 'Drevored 11', 'Ptuj', 'Slovenija', 'Večnamenska dvorana'),
('Rekreacijski center Panter', 24, 'Ravniška cesta 9', 'Murska Sobota', 'Slovenija', 'Igrišča za ulično košarko'),
('Dvorana Spin', 16, 'Sončni prehod 5', 'Nova Gorica', 'Slovenija', 'Pokrita badminton igrišča'),
('Dvorana Zlati zmaj', 50, 'Grajski jarek 3', 'Ljubljana', 'Slovenija', 'Večnameska dvorana z visoko kapaciteto'),
('Atletski balon Sprint', 30, 'Hitra proga 44', 'Celje', 'Slovenija', 'Pokrita krožna atletska steza za šprinte'),
('Teniški klub Breza', 12, 'Loparski prehod 12', 'Koper', 'Slovenija', 'Ogrevano dvoransko igrišče na rdeči pesek'),
('Košarkarska dvorana Trojka', 24, 'Mrežna ulica 23', 'Ljubljana', 'Slovenija', 'Dve igrišči za dvoransko košarko in treninge.'),
('Center Pick & Roll', 12, 'Zasavski koš 11', 'Trbovlje', 'Slovenija', 'Specializiran center za ulično košarko 3x3.'),
('Tekaški studio Pace', 15, 'Prešernova ulica 9', 'Ptuj', 'Slovenija', 'Center z vrhunskimi tekalnimi stezami');


INSERT INTO Sport (Naziv) VALUES 
('Nogomet'), ('Tenis'), ('Košarka'), ('Odbojka'), ('Badminton'), ('Tek');

INSERT INTO Termin (Naziv, Datum, SteviloMest, Zahtevnost, StarostnaSkupina, Spol, Opis, Prizorisceid_Prizorisce, Sportid_Sport, Uporabnikid_Organizator ) VALUES 
('Ponedeljkov nogomet', '2026-09-12 19:00:00', 14, 'Začetnik', '18-25 let', 'Mešano',  'Redni termin za dvoranski nogomet (vsak 2. ponedeljek v mesecu)', 1, 1, 2),
('Četrtkov tenis', '2026-07-21 17:00:00', 4, 'Napredno', '18-25 let', 'Mešano', 'Samo za izkušene igralce', 2, 2, 3),
('Vikend košarka 3x3', '2026-11-23 10:00:00', 12, 'Srednje', '26-35 let', 'Mešano', 'Zbiramo se za hitri turnir', 3, 3, 1),
('Odbojka na mivki', '2026-08-24 15:00:00', 8, 'Rekreativno', '18-25 let', 'Mešano', 'ponavljajoč termin, vsak mesec 24.', 2, 4, 4),
('Večerni badminton', '2026-05-10 20:00:00', 4, 'Začetnik', '26-35 let', 'Moški', 'Igra dvojic, prinesite svoje loparje', 4, 5, 4),
('Intervalni šprinti', '2026-05-20 18:30:00', 10, 'Napredno', '36+ let', 'Moški', 'Kondicijski trening na tartanu', 5, 6, 5),
('Torkov nogomet', '2026-08-06 19:30:00', 10, 'Rekreativno', '26-35 let', 'Moški', 'Igra na umetni travi pod balonom', 6, 1, 6),
('Jutranji tenis', '2026-06-06 08:00:00', 2, 'Rekreativno', '18-25 let', 'Mešano', 'Redni jutranji trening (poteka vsak torek in četrtek ob 08:00)', 3, 2, 5),
('Petkov badminton mix', '2026-10-29 17:00:00', 8, 'Rekreativno', '36+ let',  'Mešano', 'Sproščeno igranje mešanih dvojic (poteka vsak zadnji petek v mesecu)', 1, 5, 5),
('Višinski tek', '2026-09-03 09:00:00', 6, 'Napredno', 'Do 18 let', 'Mešano', 'Trening vzdržljivosti v hipoksični komori (poteka vsak prvi četrtek v mesecu)', 2, 6, 6),
('Nedeljska odbojka', '2026-12-05 16:00:00', 12, 'Srednje', '26-35 let', 'Ženske', 'Dvoranska odbojka, miks ekip', 5, 4, 2),
('Košarkarski večer', '2026-06-01 20:15:00', 15, 'Začetnik', 'Do 18 let', 'Ženske', 'Klasična košarka na celo igrišče', 4, 3, 1);

INSERT INTO Ocena (Uporabnikid_Uporabnik, Uporabnikid_Organizator, Ocena, Opis, Terminid_Termin) VALUES 
(1, 3, 5, 'Borut vedno najde najboljšo dvorano.', 1),
(5, 6, 4, 'Jan je dober organizator, ampak včasih malo zamuja.', 3),
(3, 2, 5, 'Odlična organizacija badmintona, vse pravočasno.', 4),
(1, 6, 3, 'Termin je super, ampak dvorana je bila premalo ogreta.', 6),
(5, 2, 5, 'Super komunikacija glede odpovedi prostih mest.', 8);

INSERT INTO Uporabnik_Skupina (Uporabnikid_Uporabnik, Skupinaid_Skupina) VALUES 
(1, 1), (4, 1), (5, 1), 
(11, 2), (9, 2), (10, 2),
(2, 10), (5, 10), (7, 10), (9, 10), 
(12, 9), (14, 9), (16, 9), 
(12, 4), (23, 4), (26, 4), (11, 4),
(31, 5), (17, 5), (12, 5), (3, 5), (16, 5), (27, 5),
(16, 7), (5, 7), (22, 7),
(9, 3), (7, 3), (1, 3), (3, 3), (5, 3),
(25, 6), (18, 6), (9, 6),
(14, 8), (23, 8), (18, 8);

INSERT INTO Uporabnik_Termin (Uporabnikid_Uporabnik, Terminid_Termin) VALUES 
(1, 1),
(4, 1),
(10, 3),
(8, 3),
(3, 4),
(5, 4),
(6, 5),
(1, 6),
(2, 7),
(3, 8),
(5, 8);

INSERT INTO Termin_Skupina (Skupinaid_Skupina, Terminid_Termin) VALUES
(1, 1), 
(2, 2),
(1, 4), 
(3, 5),
(2, 7),
(3, 8),
(9, 9),
(7, 11), 
(8, 3),
(2, 3),
(3, 8);


INSERT INTO Komentar (Uporabnikid_Uporabnik, Komentar, Terminid_Termin) VALUES 
(16, 'Prinesem rezervno žogo', 1),
(1, 'Super ideja za košarko, pridem!', 3),
(14, 'Ali imamo dovolj žog?', 3),
(10, 'Jaz lahko prinesem dres za vse.', 7),
(23, 'A loparje dobimo tam ali prinesemo svoje?', 4),
(6, 'Super, končno termin blizu mene!', 5),
(3, 'Lahko nekdo vzame s seboj tlačilko za žoge?', 8),
(25, 'Pridem malo prej, da pomagam postaviti mrežo.', 7);

UPDATE Termin SET RedniTermin = TRUE WHERE Naziv = 'Ponedeljkov nogomet';
UPDATE Termin SET RedniTermin = TRUE WHERE Naziv = 'Odbojka na mivki';
UPDATE Termin SET RedniTermin = TRUE WHERE Naziv = 'Jutranji tenis';
UPDATE Termin SET RedniTermin = TRUE WHERE Naziv = 'Petkov badminton mix';
UPDATE Termin SET RedniTermin = TRUE WHERE Naziv = 'Višinski tek';

INSERT INTO Uporabnik
(Ime, Priimek, Username, Password, Email, DatumRojstva, Spol, TipUporabnikaid_TipUporabnika)
VALUES
    ('Admin', 'Test', 'admin', 'admin123', 'admin@test.si', '1999-01-01', 'Moški', 2);

ALTER TABLE  Uporabnik
ADD COLUMN ProfilnaSlika TEXT;

--Poskus ali se doda komentar
SELECT * FROM Komentar
ORDER BY id_Komentar DESC;

SELECT * FROM VseckaniOrganizator;

--poskus adminov
SELECT
    u.username,
    u.password,
    t.naziv AS tip
FROM uporabnik u
         JOIN tipuporabnika t
              ON u.tipuporabnikaid_tipuporabnika = t.id_tipuporabnika;