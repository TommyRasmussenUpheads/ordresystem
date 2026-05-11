# Ordresystem

Enkelt køsystem for henting av ordre. Ingen database – alt lagres i minnet.

## Sider
- `/`      → Kundeskjerm (viser ordre klare for henting)
- `/admin` → Betjeningspanel (legg til / fjern ordre)

## Kjør lokalt

```bash
npm install
npm start
```

Åpne http://localhost:8090

## Docker

```bash
# Bygg og kjør
docker compose up -d

# Stopp
docker compose down
```

## Publiser til Docker Hub

```bash
docker build -t ditt-brukernavn/ordresystem:latest .
docker push ditt-brukernavn/ordresystem:latest
```

## Miljøvariabler

| Variabel | Standard | Beskrivelse |
|----------|----------|-------------|
| PORT     | 8090     | Porten serveren lytter på |

## Merk
Ordre lagres kun i minnet. Ved omstart av containeren tømmes køen.
