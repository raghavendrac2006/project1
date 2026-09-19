# AWS Production Deployment Master Guide: CiviqOne / SAMAGRA
**Target Stack:** React 19 + TypeScript (Vite SPA) & Python 3.12+ (FastAPI + SQLAlchemy + Alembic)  
**Author:** Lead Cloud Architect & Senior Web Engineer  
**Status:** Validated & Production Ready (Zero-Error Standard)

---

## 1. Architecture Overview

```mermaid
flowchart TD
    subgraph Client["Users & Citizens"]
        UserBrowser["Web Browser (Desktop / Mobile)"]
    end

    subgraph AWS_Edge["AWS Edge Network"]
        Route53["AWS Route 53 (DNS)"]
        CloudFront["AWS CloudFront CDN / Amplify Hosting<br/>(SSL / TLS via ACM)"]
    end

    subgraph Frontend_Layer["Frontend Hosting (Static SPA)"]
        S3Bucket["AWS S3 Bucket (dist/)<br/>SPA 404 -> /index.html rewrite"]
    end

    subgraph Backend_Layer["Backend Compute"]
        ALB["Application Load Balancer (ALB)"]
        AppRunner["AWS App Runner / ECS Fargate<br/>(FastAPI Python Container)"]
        HealthEndpoint["Health Check: /api/v1/health"]
    end

    subgraph Database_Layer["Data & Persistence"]
        RDS["AWS RDS Aurora / PostgreSQL<br/>(Private Subnet, Multi-AZ)"]
        SecretsManager["AWS Secrets Manager / SSM Parameter Store"]
    end

    UserBrowser -->|HTTPS :443| Route53
    Route53 --> CloudFront
    CloudFront -->|Static Assets| S3Bucket
    CloudFront -->|/api/* Requests| ALB
    ALB --> AppRunner
    AppRunner --> HealthEndpoint
    AppRunner -->|SQLAlchemy Pool| RDS
    AppRunner -.->|Fetch Credentials| SecretsManager
```

---

## 2. Pre-flight Verification

Before initiating any AWS deployment, run the automated diagnostic script to guarantee zero local compilation or test errors:

```powershell
# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts\aws-preflight-check.ps1
```

```bash
# Linux / macOS
chmod +x scripts/aws-preflight-check.sh
./scripts/aws-preflight-check.sh
```

---

## 3. Deployment Pathway 1: AWS Amplify (Frontend) + AWS App Runner (Backend)
> **Recommended For:** Fastest zero-server deployment, lowest operational overhead, automatic SSL, and continuous branch deployment.

### A. Deploy Backend on AWS App Runner
1. **Prepare Docker Image**:
   - Push your backend image to Amazon ECR:
   ```bash
   # 1. Authenticate Docker with Amazon ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

   # 2. Create ECR Repository
   aws ecr create-repository --repository-name civiqone-backend --region us-east-1

   # 3. Build & Tag
   docker build -t civiqone-backend -f Dockerfile.backend .
   docker tag civiqone-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/civiqone-backend:latest

   # 4. Push to ECR
   docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/civiqone-backend:latest
   ```

2. **Create App Runner Service**:
   - Go to **AWS Console** -> **AWS App Runner** -> **Create Service**.
   - Source: **Container registry** -> **Amazon ECR**.
   - Select your image: `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/civiqone-backend:latest`.
   - Deployment settings: **Automatic** (deploys whenever a new image is pushed).
   - Configure service:
     - **Port:** `8000`
     - **Health check path:** `/api/v1/health`
     - **Healthy threshold:** 2, **Interval:** 10s
   - Environment Variables:
     - `DATABASE_URL`: `postgresql://user:password@your-rds-endpoint:5432/civicone`
     - `SECRET_KEY`: `<Your-Strong-Secret-Key>`
     - `BACKEND_CORS_ORIGINS`: `https://*.amplifyapp.com,https://yourdomain.com`
   - Click **Deploy**. Note down the assigned public HTTPS service URL (e.g. `https://xyz123.us-east-1.awsapprunner.com`).

---

### B. Deploy Frontend on AWS Amplify
1. Open **AWS Amplify Console** -> **New app** -> **Host web app**.
2. Connect your Git repository (GitHub / AWS CodeCommit / GitLab).
3. Amplify will automatically detect the configuration from [amplify.yml](file:///a:/project1/amplify.yml).
4. Configure Environment Variables in Amplify:
   - `VITE_API_BASE_URL`: `https://xyz123.us-east-1.awsapprunner.com/api/v1`
   - `VITE_USE_MOCK`: `false`
5. Click **Save and Deploy**.
6. Amplify automatically builds your Vite project, hosts it on global CloudFront edge servers, and provides an SSL domain (`https://main.xxxx.amplifyapp.com`).

---

## 4. Deployment Pathway 2: AWS S3 + CloudFront (Frontend) + AWS ECS Fargate (Backend)
> **Recommended For:** Enterprise compliance, VPC isolation, and granular traffic routing.

### A. Deploy Infrastructure via CloudFormation
Use our pre-configured [cloudformation-template.yml](file:///a:/project1/aws/cloudformation-template.yml):

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation-template.yml \
  --stack-name civiqone-frontend-stack \
  --parameter-overrides EnvironmentName=production \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### B. Build and Upload Frontend to S3
```bash
# 1. Set backend production URL
export VITE_API_BASE_URL="https://api.yourdomain.com/api/v1"
export VITE_USE_MOCK="false"

# 2. Build production assets
npm run build

# 3. Retrieve S3 Bucket name from stack outputs
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name civiqone-frontend-stack --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text --region us-east-1)
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name civiqone-frontend-stack --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text --region us-east-1)

# 4. Sync hashed assets with 1-year immutable cache
aws s3 sync dist/ s3://${BUCKET_NAME} --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

# 5. Upload index.html with no-cache so client always receives updates
aws s3 cp dist/index.html s3://${BUCKET_NAME}/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

# 6. Invalidate CloudFront edge cache
aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"
```

---

## 5. Deployment Pathway 3: AWS EC2 / Lightsail (Docker Compose)
> **Recommended For:** Single instance or staging testing where cost optimization is paramount.

1. Launch an Ubuntu 22.04 LTS / 24.04 LTS EC2 instance (`t3.small` or `t3.medium`).
2. Open Security Group inbound ports: `80` (HTTP), `443` (HTTPS), `22` (SSH).
3. Connect via SSH and install Docker:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose git
   sudo usermod -aG docker ubuntu
   ```
4. Clone your repository:
   ```bash
   git clone <your-repo-url> /var/www/civiqone
   cd /var/www/civiqone
   ```
5. Start the full-stack container cluster:
   ```bash
   docker-compose up -d --build
   ```
6. Check health:
   ```bash
   docker-compose ps
   curl http://localhost:80/health
   curl http://localhost:8000/api/v1/health
   ```

---

## 6. Environment Variables Reference

| Variable Name | Component | Description | Example (Production) |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Frontend | Base URL for FastAPI REST API endpoints | `https://api.yourdomain.com/api/v1` |
| `VITE_USE_MOCK` | Frontend | Enable/disable offline mock storage fallback | `false` |
| `VITE_API_TIMEOUT_MS`| Frontend | HTTP request timeout in milliseconds | `15000` |
| `DATABASE_URL` | Backend | PostgreSQL connection string | `postgresql://user:pass@rds:5432/dbname` |
| `SECRET_KEY` | Backend | Cryptographic secret for JWT verification | `openssl rand -hex 32` |
| `BACKEND_CORS_ORIGINS`| Backend | Comma-separated or JSON list of allowed origins | `https://yourdomain.com,https://*.amplifyapp.com` |

---

## 7. Troubleshooting Common AWS Issues

### 1. Issue: Clicking refresh on `/dashboard` or deep link returns 404
- **Root Cause**: Vite is an SPA; subpaths don't exist as physical files on S3.
- **Solution**: CloudFront Custom Error Response must map `403` and `404` to `/index.html` with status `200`. This is already configured in our [cloudformation-template.yml](file:///a:/project1/aws/cloudformation-template.yml) and [nginx.conf](file:///a:/project1/nginx.conf).

### 2. Issue: Browser displays CORS Error when fetching `/api/v1/*`
- **Root Cause**: CloudFront domain is not listed in `BACKEND_CORS_ORIGINS`.
- **Solution**: Add your frontend URL (e.g. `https://d123456.cloudfront.net`) to the `BACKEND_CORS_ORIGINS` environment variable in AWS App Runner / ECS.

### 3. Issue: ALB Target Group shows container as "Unhealthy"
- **Root Cause**: Health check path defaulted to `/` instead of `/api/v1/health`.
- **Solution**: Set target group health check path to `/api/v1/health` and HTTP success codes to `200`.

### 4. Issue: Dropped PostgreSQL connections during low traffic
- **Root Cause**: AWS RDS closes idle connections after timeout.
- **Solution**: Handled automatically! We enabled `pool_pre_ping=True` and `pool_recycle=300` in [backend/app/db/session.py](file:///a:/project1/backend/app/db/session.py).
