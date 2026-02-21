# To-Do List React + Django

Projet full-stack avec backend Django/DRF et frontend React, prêt pour le déploiement en production.

## Architecture

```
examen_fullstack_todo/
├── backend/                  # API Django REST Framework
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py       # Configuration commune
│   │   │   ├── development.py# Dev : SQLite, DEBUG=True
│   │   │   └── production.py # Prod : PostgreSQL, Sentry, HTTPS
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── todos/                # App principale (models, views, serializers)
│   ├── requirements.txt
│   ├── Procfile              # Commande gunicorn pour Render
│   ├── build.sh              # Script de build Render
│   └── render.yaml           # Blueprint Render
├── frontend/                 # React (Create React App)
│   ├── public/
│   │   ├── index.html        # SEO : title + meta description
│   │   └── _redirects        # SPA fallback pour Netlify
│   ├── src/
│   │   ├── App.js            # Composant principal
│   │   └── index.js          # Sentry init + ErrorBoundary
│   ├── netlify.toml          # Config Netlify
│   └── package.json
└── .gitignore
```

## Prérequis

- Python 3.13+
- Node.js 18+ / npm

## Installation locale

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows : .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver      # http://localhost:8000/api/
```

### Frontend

```bash
cd frontend
npm install
npm start                       # http://localhost:3000
```

## Configuration

| Variable | Où | Description |
|---|---|---|
| `DJANGO_SETTINGS_MODULE` | Backend | `config.settings.production` en prod |
| `SECRET_KEY` | Backend | Clé secrète Django (obligatoire en prod) |
| `ALLOWED_HOSTS` | Backend | Ex : `.onrender.com` |
| `DATABASE_URL` | Backend | URL PostgreSQL (fournie par Render) |
| `CORS_ALLOWED_ORIGINS` | Backend | URL du frontend déployé |
| `SENTRY_DSN` | Backend | DSN Sentry projet Django |
| `REACT_APP_API_BASE` | Frontend | URL de l'API (ex : `https://todo-backend.onrender.com/api`) |
| `REACT_APP_SENTRY_DSN` | Frontend | DSN Sentry projet React |

## Déploiement

### Partie 1 : Backend sur Render

1. **Créer un Web Service** sur [render.com](https://render.com)
   - Connecter le dépôt GitHub
   - **Root Directory** : `backend`
   - **Build Command** : `./build.sh`
   - **Start Command** : `gunicorn config.wsgi:application`

2. **Créer une base PostgreSQL** sur Render (plan gratuit)

3. **Variables d'environnement** à configurer sur Render :
   ```
   DJANGO_SETTINGS_MODULE=config.settings.production
   SECRET_KEY=<générer avec : python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
   ALLOWED_HOSTS=.onrender.com
   DATABASE_URL=<URL interne PostgreSQL de Render>
   CORS_ALLOWED_ORIGINS=https://votre-app.netlify.app
   SENTRY_DSN=<DSN du projet Sentry Django>
   ```

### Partie 2 : Frontend sur Netlify

1. **Créer un nouveau site** sur [netlify.com](https://netlify.com)
   - Connecter le dépôt GitHub
   - **Base directory** : `frontend`
   - **Build command** : `npm run build`
   - **Publish directory** : `frontend/build`

2. **Variables d'environnement** à configurer sur Netlify :
   ```
   REACT_APP_API_BASE=https://votre-backend.onrender.com/api
   REACT_APP_SENTRY_DSN=<DSN du projet Sentry React>
   ```

3. **Mettre à jour CORS** : retourner sur Render et mettre à jour `CORS_ALLOWED_ORIGINS` avec l'URL Netlify réelle.

### Partie 3 : Monitoring

#### UptimeRobot
1. Créer un compte sur [uptimerobot.com](https://uptimerobot.com)
2. Ajouter un moniteur HTTP(S) pointant vers `https://votre-backend.onrender.com/health/`
3. Intervalle : 5 minutes

#### Sentry
1. Créer un projet **Django** sur [sentry.io](https://sentry.io) → copier le DSN → variable `SENTRY_DSN` sur Render
2. Créer un projet **React** sur Sentry → copier le DSN → variable `REACT_APP_SENTRY_DSN` sur Netlify
3. **Tester l'intégration** :
   - Backend : visiter `https://votre-backend.onrender.com/debug-sentry/` → une erreur 500 apparaît dans Sentry
   - Frontend : cliquer sur le bouton **"Test Sentry"** dans l'interface → l'erreur apparaît dans Sentry

## Endpoints API

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/categories/` | Lister les catégories |
| POST | `/api/categories/` | Créer une catégorie |
| GET | `/api/tasks/` | Lister les tâches (filtre : `?category_id=X`) |
| POST | `/api/tasks/` | Créer une tâche |
| GET | `/api/tasks/:id/` | Détail d'une tâche |
| PATCH | `/api/tasks/:id/` | Modifier une tâche |
| DELETE | `/api/tasks/:id/` | Supprimer une tâche |
| GET | `/health/` | Health check |
| GET | `/debug-sentry/` | Test Sentry (erreur volontaire) |

## Stack technique

- **Backend** : Django 5.2, Django REST Framework, gunicorn, whitenoise, PostgreSQL, Sentry
- **Frontend** : React 19, Create React App, Sentry
- **Déploiement** : Render (backend + BDD), Netlify (frontend)
- **Monitoring** : UptimeRobot (uptime), Sentry (erreurs)
