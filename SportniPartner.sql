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
    Spol CHAR (1),
    TipUporabnikaid_TipUporabnika INTEGER REFERENCES TipUporabnika(id_TipUporabnika)
);
CREATE TABLE Skupina (
    id_Skupina SERIAL PRIMARY KEY,
    Naziv VARCHAR(255) UNIQUE NOT NULL,
    MaxStevilo INTEGER NOT NULL
);

CREATE TABLE Prizorisce (
    id_Prizorisca SERIAL PRIMARY KEY,
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

CREATE TABLE RedniTermin (
    id_RedniTermin SERIAL PRIMARY KEY,
    Naziv VARCHAR(255) NOT NULL,
    Datum TIMESTAMP,
    SteviloMest INTEGER,
    Opis VARCHAR(255),
    Prizoriscaid_Prizorisce INTEGER REFERENCES Prizorisce(id_Prizorisca)
);
CREATE TABLE Termin (
    id_Termin SERIAL PRIMARY KEY,
    Naziv VARCHAR(255) NOT NULL,
    Datum TIMESTAMP NOT NULL,
    SteviloMest INTEGER,
    Opis VARCHAR(255),
    Prizoriscaid_Prizorisce INTEGER REFERENCES Prizorisce(id_Prizorisca),
    Sportid_Sport INTEGER REFERENCES Sport(id_Sport)
);

CREATE TABLE Ocena (
    id_Ocena SERIAL PRIMARY KEY,
    Uporabnikid_Uporabnik INTEGER REFERENCES Uporabnik(id_Uporabnik),
    Uporabnikid_Organizator INTEGER REFERENCES Uporabnik(id_Uporabnik),
    Ocena INTEGER CHECK (Ocena >= 1 AND Ocena <= 5),
    Opis VARCHAR(255)
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

CREATE TABLE Skupina_RedniTermin (
    id_Skupina_RedniTermin SERIAL PRIMARY KEY,
    Skupinaid_Skupina INTEGER REFERENCES Skupina(id_Skupina) ON DELETE CASCADE,
    RedniTerminid_RedniTermin INTEGER REFERENCES RedniTermin(id_RedniTermin) ON DELETE CASCADE 
);

CREATE TABLE Komentar (
    id_Komentar SERIAL PRIMARY KEY,
    Uporabnikid_Uporabnik INTEGER REFERENCES Uporabnik(id_Uporabnik),
    Komentar VARCHAR(255) NOT NULL,
    Terminid_Termin INTEGER REFERENCES Termin(id_Termin) NULL,
    RedniTerminid_RedniTermin INTEGER REFERENCES RedniTermin(id_RedniTermin) NULL 
);

-- VNOS PODATKOV
INSERT INTO TipUporabnika (Naziv, Opis) VALUES
('Uporabnik', 'Registrirani uporabnik, ki se lahko prijavi/odjavi od termina'),
('Administrator', 'Sistemski administrator z vsemi pravicami upravljanja.'),
('Organizator', 'Uporabnik, ki lahko ustvarja nove termine in upravlja skupine.');

INSERT INTO Uporabnik (Ime, Priimek, Username, Password, Email, DatumRojstva, Spol, TipUporabnikaid_TipUporabnika) VALUES 
('Anže', 'Novak', 'anze_n', 'geslo123', 'anze.novak@email.si', '1992-04-10', 'M', 1),
('Maja', 'Korošec', 'maja_admin', 'admin_pass', 'maja.k@sport.si', '1988-11-20', 'Ž', 2),
('Borut', 'Pahor', 'borut_org', 'org_pass', 'borut@klub.si', '1985-01-30', 'M', 3),
('Luka', 'Dončič', 'luka77', 'basket123', 'luka@dallas.com', '1999-02-28', 'M', 1),
('Sara', 'Zupan', 'sara_z', 'sara123', 'sara.zupan@gmail.com', '1996-07-15', 'Ž', 1),
('Jan', 'Oblak', 'jan_o', 'oblak_wall', 'jan.oblak@atletico.es', '1993-01-07', 'M', 3),
('Tina', 'Maze', 'tina_maze', 'ski_fast', 'tina@stave.si', '1983-05-02', 'Ž', 1),
('Marko', 'Hribar', 'marko_h', 'marko123', 'marko.hribar@podjetje.si', '1990-12-12', 'M', 1),
('Petra', 'Majdič', 'petra_m', 'tek_tek', 'petra.m@siol.net', '1979-12-22', 'Ž', 3),
('Tadej', 'Pogačar', 'pogi_1', 'cycling_king', 'tadej@tour.fr', '1998-09-21', 'M', 1);

INSERT INTO Skupina (Naziv, MaxStevilo) VALUES 
('Ljubljanski rekreativci', 20),
('Obalni tenisači', 12),
('Košarkarski veterani', 15),
('Padel navdušenci', 8);

INSERT INTO Prizorisce (Naziv, Kapaciteta, Ulica, Mesto, Drzava, Opis) VALUES 
('Športni center Jamova', 100, 'Jamova cesta 2', 'Ljubljana', 'Slovenija', 'Glavna dvorana'),
('Igrišča ob morju', 40, 'Koprska ulica 10', 'Koper', 'Slovenija', 'Zunanja igrišča'),
('Športni park Maribor', 80, 'Gosposvetska cesta 15', 'Maribor', 'Slovenija', 'Večnamenski objekt'),
('Dvorana Podmežakla', 200, 'Ledarska 4', 'Jesenice', 'Slovenija', 'Ledna in športna dvorana');

INSERT INTO Sport (Naziv) VALUES 
('Nogomet'), ('Tenis'), ('Košarka'), ('Odbojka'), ('Padel'), ('Namizni tenis');

INSERT INTO RedniTermin (Naziv, Datum, SteviloMest, Opis, Prizoriscaid_Prizorisce) VALUES 
('Ponedeljkov nogomet', '2026-05-18 19:00:00', 14, 'Redni termin za dvoranski nogomet', 1),
('Četrtkov tenis', '2026-05-21 17:00:00', 4, 'Samo za izkušene igralce', 2);

INSERT INTO Termin (Naziv, Datum, SteviloMest, Opis, Prizoriscaid_Prizorisce, Sportid_Sport) VALUES 
('Vikend košarka 3x3', '2026-05-23 10:00:00', 12, 'Zbiramo se za hitri turnir', 3, 3),
('Odbojka na mivki', '2026-05-24 15:00:00', 8, 'Zabavno igranje ob obali', 2, 4),
('Namizni tenis večer', '2026-05-25 18:00:00', 4, 'Prinesite svoje loparje', 1, 6);

INSERT INTO Ocena (Uporabnikid_Uporabnik, Uporabnikid_Organizator, Ocena, Opis) VALUES 
(1, 3, 5, 'Borut vedno najde najboljšo dvorano.'),
(5, 6, 4, 'Jan je dober organizator, ampak včasih malo zamuja.');

INSERT INTO Uporabnik_Skupina (Uporabnikid_Uporabnik, Skupinaid_Skupina) VALUES 
(1, 1),
(4, 1),
(5, 1), 
(7, 2),
(9, 2),
(10, 2);

INSERT INTO Uporabnik_Termin (Uporabnikid_Uporabnik, Terminid_Termin) VALUES 
(1, 1),
(4, 1),
(10, 1),
(8, 1);

INSERT INTO Skupina_RedniTermin (Skupinaid_Skupina, RedniTerminid_RedniTermin) VALUES
(1, 1),
(2, 2);

INSERT INTO Komentar (Uporabnikid_Uporabnik, Komentar, Terminid_Termin) VALUES 
(1, 'Super ideja za košarko, pridem!', 1),
(4, 'Ali imamo dovolj žog?', 1),
(10, 'Jaz lahko prinesem dres za vse.', 1);