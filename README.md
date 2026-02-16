# IT Freelance — opis aplikacije i tehnologije.

IT Freelance je full-stack veb aplikacija koja povezuje **klijente** i **freelancere** kroz jasan proces: klijent objavljuje projekat, freelancer šalje ponudu (offer), a nakon saradnje klijent ostavlja review. Aplikacija obezbeđuje role-based prikaz stranica i API dozvole, uz admin modul za upravljanje kategorijama i pregled metrika sistema.

![IT Freelance Logo](./it-freelance-front/public/images/logo.png)

---

## Ciljna grupa i uloge korisnika.

Ciljna grupa korisnika obuhvata tri tipa korisnika, kao i posetioca:

- **Posetilac (guest)**: korisnik koji nije registrovan ili nije ulogovan.
- **Klijent (client)**: objavljuje projekte i ostavlja review-e na osnovu ponuda.
- **Freelancer (freelancer)**: pregleda projekte i šalje ponude.
- **Administrator (admin)**: upravlja kategorijama i prati metrike sistema.

---

## Ključne funkcionalnosti.

### Posetilac.
- Pregled javne liste projekata.
- Pregled detalja projekta.
- Pregled ponuda i review-a za projekat (javno).
- Registracija i prijava u sistem.

### Klijent (client).
- Kreiranje, izmena i brisanje sopstvenih projekata.
- Pregled svih projekata i filtriranje po nazivu/opisu/kategoriji.
- Pregled ponuda (offers) pristiglih za projekat.
- Dodavanje review-a za projekat (vezano za izabranog freelancera iz ponuda).

### Freelancer (freelancer).
- Pregled liste projekata.
- Slanje ponude (offer) za projekat (cena + komentar + status).
- Izmena i brisanje sopstvene ponude za projekat.

### Administrator (admin).
- CRUD nad kategorijama (dodavanje/izmena/brisanje).
- Pregled metrika sistema (broj korisnika, projekata, ponuda, review-a, top liste).
- Vizuelizacija metrika (npr. Google Charts) u admin delu (opciono).

---

# Predlog tehnologija koje se koriste.

## Frontend — React.

**React** je SPA frontend sa role-based navigacijom. Frontend je zadužen za:
- Login/Register forme.
- Prikaz projekata u karticama + pretraga.
- Freelancer modul za offers.
- Client modul za projekat i review.
- Admin modul za kategorije i metrike.

Komunikacija sa API-jem ide preko `axios`, uz token u headeru:
`Authorization: Bearer {token}`.

---

## Backend — Laravel 12 (REST API).

**Laravel 12** predstavlja backend sloj aplikacije i obezbeđuje:
- Validaciju.
- Autorizaciju po ulozi i vlasništvu resursa.
- Eloquent ORM modele i relacije.
- REST API rute za React frontend.

### Autentifikacija.
- Token-based autentifikacija preko **Laravel Sanctum**.
- Token se šalje u headeru: `Authorization: Bearer {token}`.

---

## Baza podataka — MySQL.

**MySQL** čuva podatke o:
- korisnicima (`users`),
- projektima (`projects`),
- kategorijama (`categories`),
- ponudama (`offers`),
- review-ima (`reviews`).

Migracije definišu šemu, a seed-eri generišu test podatke.

---

# Tehnologije korišćene (sažetak).

- **Frontend.**
  - React.
  - JavaScript.
  - react-router-dom.
  - axios.

- **Backend.**
  - PHP 8.2+.
  - Laravel 12.
  - Laravel Sanctum.
  - API Resources.

- **Baza.**
  - MySQL.

- **Alati.**
  - Git / GitHub.
  - Swagger UI + OpenAPI specifikacija (API dokumentacija).
  - Docker (opciono).

---

## Git i GitHub verzionisanje projekta.

- Kod je okačen na GitHub repozitorijum:
  https://github.com/elab-development/internet-tehnologije-2025-it_freelance_0420_2016.git

- Komanda za kloniranje projekta:

```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-it_freelance_0420_2016.git
```

---

## Struktura projekta.

Repozitorijum sadrži:
- `it-freelance-back` (Laravel API).
- `it-freelance-front` (React frontend).

---

## Pokretanje projekta (lokalno bez Docker-a).

> Pretpostavke: instalirani Node 18+, PHP 8.2+, Composer, MySQL (npr. XAMPP).

### 1) Backend (Laravel).

```bash
cd it-freelance-back
composer install
cp .env.example .env
php artisan key:generate
```

U fajlu `.env` podesi DB kredencijale, npr.:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=it_freelance_db
DB_USERNAME=root
DB_PASSWORD=
```

Zatim pokreni migracije i seed:

```bash
php artisan migrate:fresh --seed
php artisan serve
```

Backend API:
- http://127.0.0.1:8000/api

### 2) Frontend (React).

```bash
cd it-freelance-front
npm install
npm start
```

Frontend:
- http://localhost:3000

---

## Pokretanje projekta uz Docker (opciono).

> Pretpostavke: instaliran Docker Desktop.

U fajlu `.env` podesi DB kredencijale, npr.:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=it_freelance_db
DB_USERNAME=root
DB_PASSWORD=
```

U root folderu (gde je `docker-compose.yml`):

```bash
docker compose down -v
docker compose up --build
```

Aplikacija:
- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8000/api

---

## Swagger UI (API dokumentacija).

Ako u projektu postoji Swagger UI i OpenAPI fajl, tipična putanja je:

- Swagger UI: `http://127.0.0.1:8000/docs/index.html`
- OpenAPI fajl: `/docs/openapi.yaml` (ili `public/docs/openapi.yaml`, u zavisnosti od organizacije projekta).

---
