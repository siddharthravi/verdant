# Setup Guide

## Local Development

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
npm install
node server.js
```

### ML Service

```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

## Cloud Deployment

See [infra/README.md](../infra/README.md) for deploying infrastructure on AWS/GCP.