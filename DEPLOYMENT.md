# ESG Sustainability Analysis - Deployment Guide

## 🎯 Overview

This guide covers deploying the ESG Sustainability Analysis platform to various environments.

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates obtained (production)
- [ ] Domain DNS configured
- [ ] Secrets secured
- [ ] Monitoring configured
- [ ] Backup strategy in place

## 🐳 Docker Deployment (Recommended)

### Local/Development

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with development settings

# 2. Start services
docker-compose up -d

# 3. Check logs
docker-compose logs -f

# 4. Stop services
docker-compose down
```

### Production

```bash
# 1. Configure production environment
cp .env.example .env.production
# Edit .env.production with production settings

# 2. Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Verify deployment
curl http://localhost:8000/health
curl http://localhost/health

# 4. View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# 5. Scale services (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## ☁️ Cloud Deployments

### AWS Deployment

#### Using ECS (Elastic Container Service)

1. **Build and push images**:
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag esg-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/esg-backend:latest
docker tag esg-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/esg-frontend:latest

# Push images
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/esg-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/esg-frontend:latest
```

2. **Create ECS task definitions** (JSON):
```json
{
  "family": "esg-backend",
  "containerDefinitions": [{
    "name": "backend",
    "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/esg-backend:latest",
    "memory": 2048,
    "cpu": 1024,
    "essential": true,
    "portMappings": [{
      "containerPort": 8000,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "ENVIRONMENT", "value": "production"}
    ],
    "secrets": [
      {"name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:..."}
    ]
  }]
}
```

3. **Create RDS PostgreSQL instance**
4. **Set up Application Load Balancer**
5. **Configure auto-scaling**

#### Using EC2

```bash
# SSH into instance
ssh -i key.pem ec2-user@<instance-ip>

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis.git
cd ESG-Sustainability-Analysis

# Configure environment
cp .env.example .env.production
nano .env.production

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Google Cloud Platform (GCP)

#### Using Cloud Run

```bash
# Build images
gcloud builds submit --tag gcr.io/PROJECT-ID/esg-backend
gcloud builds submit --tag gcr.io/PROJECT-ID/esg-frontend --config=frontend/cloudbuild.yaml

# Deploy backend
gcloud run deploy esg-backend \
  --image gcr.io/PROJECT-ID/esg-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ENVIRONMENT=production

# Deploy frontend
gcloud run deploy esg-frontend \
  --image gcr.io/PROJECT-ID/esg-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Microsoft Azure

#### Using Azure Container Instances

```bash
# Create resource group
az group create --name esg-rg --location eastus

# Create container registry
az acr create --resource-group esg-rg --name esgarc --sku Basic

# Build and push images
az acr build --registry esgarc --image esg-backend:latest .
az acr build --registry esgarc --image esg-frontend:latest -f frontend/Dockerfile .

# Deploy container instances
az container create \
  --resource-group esg-rg \
  --name esg-backend \
  --image esgarc.azurecr.io/esg-backend:latest \
  --dns-name-label esg-backend \
  --ports 8000 \
  --environment-variables ENVIRONMENT=production
```

## 🔐 SSL/TLS Configuration

### Using Let's Encrypt with Nginx

1. **Install Certbot**:
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. **Obtain certificate**:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Update nginx configuration**:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **Set up Sentry** (error tracking):
```bash
# Add to .env.production
SENTRY_DSN=your-sentry-dsn
```

2. **Configure Prometheus** (metrics):
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'esg-backend'
    static_configs:
      - targets: ['backend:8000']
```

3. **Set up Grafana** (visualization):
```bash
docker run -d -p 3000:3000 grafana/grafana
```

### Log Aggregation

Using ELK Stack (Elasticsearch, Logstash, Kibana):

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"
  
  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
  
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

## 🔄 CI/CD Integration

### GitHub Actions Secrets

Add these secrets in GitHub repository settings:

- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `AWS_ACCESS_KEY_ID` (if using AWS)
- `AWS_SECRET_ACCESS_KEY`
- `GCP_PROJECT_ID` (if using GCP)
- `GCP_SA_KEY`
- `PRODUCTION_DB_PASSWORD`
- `PRODUCTION_SECRET_KEY`

### Deployment Workflow

The `.github/workflows/deploy.yml` handles:
- Building Docker images
- Pushing to container registry
- Deploying to staging on merge to main
- Manual production deployment with approval

## 🔙 Backup & Recovery

### Database Backups

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/esg_db_$TIMESTAMP.sql"

# Create backup
docker exec esg_db pg_dump -U postgres esg_db > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to S3 (optional)
aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/
```

### Restore Database

```bash
# Restore from backup
gunzip backup.sql.gz
docker exec -i esg_db psql -U postgres esg_db < backup.sql
```

## 🚨 Rollback Procedures

### Docker Deployment

```bash
# View image history
docker images esg-backend

# Rollback to previous version
docker-compose down
docker tag esg-backend:previous esg-backend:latest
docker-compose up -d
```

### Kubernetes

```bash
# Rollback deployment
kubectl rollout undo deployment/esg-backend
kubectl rollout undo deployment/esg-frontend

# Check rollout status
kubectl rollout status deployment/esg-backend
```

## ✅ Post-Deployment Verification

```bash
# Health checks
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health

# Test API endpoints
curl https://yourdomain.com/api/companies/top?limit=5

# Check logs
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend

# Monitor performance
ab -n 1000 -c 10 https://yourdomain.com/
```

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed**:
   - Check DB_HOST, DB_PORT, DB_PASSWORD in .env
   - Verify database is running
   - Check firewall rules

2. **CORS errors**:
   - Update CORS_ORIGINS in .env.production
   - Restart backend service

3. **502 Bad Gateway**:
   - Check backend service status
   - Verify port mappings
   - Check nginx/reverse proxy logs

4. **High memory usage**:
   - Scale down services
   - Optimize database queries
   - Review model loading

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Review health endpoint: `/health`
3. Open GitHub issue with logs and error messages

---

**Remember**: Always test in staging before deploying to production!
