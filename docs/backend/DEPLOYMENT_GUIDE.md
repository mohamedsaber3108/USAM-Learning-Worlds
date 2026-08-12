# DEPLOYMENT GUIDE: USAM Learning Worlds Backend
## Production Deployment on AWS

**This guide covers deploying the complete backend to AWS production infrastructure.**

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                       │
│                    (Static Assets + API)                     │
└────────────────┬────────────────────────────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
┌──────▼──────┐   ┌───────▼────────┐
│   Route 53   │   │  WAF + Shield  │
│     DNS      │   │   (DDoS)       │
└──────┬──────┘   └───────┬────────┘
       │                  │
       └─────────┬────────┘
                 │
         ┌───────▼────────┐
         │  ALB (Load     │
         │   Balancer)    │
         └───────┬────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼─────┐           ┌──────▼──────┐
│  ECS    │           │   ECS       │
│ (API 1) │           │  (API 2)    │
└───┬─────┘           └──────┬──────┘
    │                        │
    └────────────┬───────────┘
                 │
    ┌────────────┴────────────────────┐
    │                                 │
┌───▼──────────┐  ┌──────────────┐  ┌▼──────────┐
│ RDS Postgres │  │ ElastiCache  │  │  Bedrock  │
│  (Primary)   │  │   (Redis)    │  │   (AI)    │
│              │  │              │  │           │
│  RDS Read    │  │              │  │           │
│  Replica     │  │              │  │           │
└──────────────┘  └──────────────┘  └───────────┘
```

---

## INFRASTRUCTURE COMPONENTS

### Compute
- **ECS Fargate** — Containerized NestJS API (auto-scaling)
- **Application Load Balancer** — Route traffic to ECS tasks

### Database
- **RDS PostgreSQL 16** — Primary database (Multi-AZ)
- **Read Replica** — Scale read operations (optional)

### Cache
- **ElastiCache Redis 7** — Session storage, job queue

### Storage
- **S3** — User uploads (projects, avatars, portfolios)
- **CloudFront** — CDN for static assets

### AI
- **AWS Bedrock** — Claude 3 Haiku + Sonnet

### Networking
- **VPC** — Private network (3 subnets: public, private, database)
- **Security Groups** — Firewall rules
- **Route 53** — DNS management

### Monitoring
- **CloudWatch** — Logs, metrics, alarms
- **Grafana Cloud** — Advanced observability
- **Sentry** — Error tracking

### Security
- **AWS WAF** — Web application firewall
- **AWS Shield** — DDoS protection
- **Secrets Manager** — Store credentials
- **KMS** — Encryption keys

---

## PREREQUISITES

### Required Tools
```bash
# AWS CLI
brew install awscli  # macOS
# or download from https://aws.amazon.com/cli/

# Docker
# Install Docker Desktop

# Terraform (infrastructure as code)
brew install terraform

# Or use AWS CDK
npm install -g aws-cdk
```

### AWS Account Setup
1. Create AWS account
2. Create IAM user with permissions:
   - ECS, ECR, RDS, ElastiCache, S3, CloudFront
   - Bedrock model access
   - CloudWatch, Secrets Manager
3. Configure AWS CLI: `aws configure`

---

## DEPLOYMENT OPTION 1: AWS CDK (Recommended)

### Install CDK

```bash
npm install -g aws-cdk
cdk --version
```

### Create Infrastructure Stack

Create `infrastructure/cdk/lib/usam-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as elasticache from 'aws-cdk-lib/aws-elasticache'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'

export class USAMStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // VPC
    const vpc = new ec2.Vpc(this, 'USAM-VPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC },
        { name: 'Private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        { name: 'Database', subnetType: ec2.SubnetType.PRIVATE_ISOLATED }
      ]
    })

    // RDS PostgreSQL
    const dbSecret = new secretsmanager.Secret(this, 'DBSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'usam' }),
        generateStringKey: 'password',
        excludePunctuation: true
      }
    })

    const database = new rds.DatabaseInstance(this, 'USAM-DB', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      databaseName: 'usam_learning_worlds',
      credentials: rds.Credentials.fromSecret(dbSecret),
      multiAz: true,
      allocatedStorage: 100,
      maxAllocatedStorage: 500,
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: false,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT
    })

    // ElastiCache Redis
    const cacheSubnetGroup = new elasticache.CfnSubnetGroup(this, 'CacheSubnetGroup', {
      description: 'Subnet group for Redis',
      subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId)
    })

    const cacheSecurityGroup = new ec2.SecurityGroup(this, 'CacheSecurityGroup', {
      vpc,
      description: 'Security group for Redis'
    })

    const redisCluster = new elasticache.CfnCacheCluster(this, 'USAM-Redis', {
      engine: 'redis',
      cacheNodeType: 'cache.t3.micro',
      numCacheNodes: 1,
      cacheSubnetGroupName: cacheSubnetGroup.ref,
      vpcSecurityGroupIds: [cacheSecurityGroup.securityGroupId]
    })

    // S3 Bucket
    const bucket = new s3.Bucket(this, 'USAM-Bucket', {
      bucketName: 'usam-learning-worlds-prod',
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    })

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'USAM-Cluster', {
      vpc,
      clusterName: 'usam-learning-worlds'
    })

    // Fargate Service with ALB
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      'USAM-Service',
      {
        cluster,
        cpu: 512,
        memoryLimitMiB: 1024,
        desiredCount: 2,
        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry('usam-backend:latest'),
          containerPort: 3001,
          environment: {
            NODE_ENV: 'production',
            PORT: '3001',
            AWS_REGION: this.region,
            S3_BUCKET: bucket.bucketName,
            REDIS_HOST: redisCluster.attrRedisEndpointAddress
          },
          secrets: {
            DATABASE_URL: ecs.Secret.fromSecretsManager(dbSecret, 'connectionString'),
            JWT_ACCESS_SECRET: ecs.Secret.fromSecretsManager(
              secretsmanager.Secret.fromSecretNameV2(this, 'JWTSecret', 'usam/jwt-secret')
            )
          }
        },
        publicLoadBalancer: true
      }
    )

    // Allow ECS to access RDS
    database.connections.allowFrom(
      fargateService.service,
      ec2.Port.tcp(5432),
      'Allow ECS to access RDS'
    )

    // Allow ECS to access Redis
    cacheSecurityGroup.addIngressRule(
      fargateService.service.connections.securityGroups[0],
      ec2.Port.tcp(6379),
      'Allow ECS to access Redis'
    )

    // Grant S3 access
    bucket.grantReadWrite(fargateService.taskDefinition.taskRole)

    // Auto-scaling
    const scaling = fargateService.service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 10
    })

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70
    })

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: fargateService.loadBalancer.loadBalancerDnsName
    })

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.dbInstanceEndpointAddress
    })
  }
}
```

### Deploy Stack

```bash
# Bootstrap CDK (first time only)
cdk bootstrap aws://ACCOUNT-ID/REGION

# Synthesize CloudFormation template
cdk synth

# Deploy
cdk deploy

# View outputs (ALB DNS, DB endpoint, etc.)
```

---

## DEPLOYMENT OPTION 2: MANUAL AWS SETUP

### Step 1: Create VPC

```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=usam-vpc}]'

# Create subnets (public, private, database) in 2 AZs
# Create Internet Gateway
# Create NAT Gateway
# Configure route tables
```

### Step 2: Create RDS Database

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name usam-db-subnet \
  --db-subnet-group-description "USAM Database Subnet Group" \
  --subnet-ids subnet-xxx subnet-yyy

# Create PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier usam-postgres \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16 \
  --master-username usam \
  --master-user-password <SECURE_PASSWORD> \
  --allocated-storage 100 \
  --db-name usam_learning_worlds \
  --vpc-security-group-ids sg-xxx \
  --db-subnet-group-name usam-db-subnet \
  --backup-retention-period 7 \
  --multi-az
```

### Step 3: Create ElastiCache Redis

```bash
# Create cache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name usam-redis-subnet \
  --cache-subnet-group-description "USAM Redis Subnet" \
  --subnet-ids subnet-xxx subnet-yyy

# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id usam-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1 \
  --cache-subnet-group-name usam-redis-subnet \
  --security-group-ids sg-xxx
```

### Step 4: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://usam-learning-worlds-prod --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket usam-learning-worlds-prod \
  --versioning-configuration Status=Enabled

# Set lifecycle policy (optional)
aws s3api put-bucket-lifecycle-configuration \
  --bucket usam-learning-worlds-prod \
  --lifecycle-configuration file://lifecycle.json
```

### Step 5: Create ECR Repository

```bash
# Create repository
aws ecr create-repository --repository-name usam-backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push image
docker build -t usam-backend .
docker tag usam-backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/usam-backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/usam-backend:latest
```

### Step 6: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name usam-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster usam-cluster \
  --service-name usam-api \
  --task-definition usam-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}"
```

---

## DOCKER SETUP

### Create `Dockerfile`:

```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

### Create `.dockerignore`:

```
node_modules
dist
.git
.env
.env.local
*.log
coverage
.vscode
.idea
```

### Build and Test Locally:

```bash
# Build image
docker build -t usam-backend:latest .

# Run container
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_HOST="localhost" \
  usam-backend:latest
```

---

## ENVIRONMENT VARIABLES (Production)

Store in **AWS Secrets Manager**:

```bash
# Create secret
aws secretsmanager create-secret \
  --name usam/production/env \
  --secret-string file://production-secrets.json
```

**production-secrets.json**:

```json
{
  "DATABASE_URL": "postgresql://usam:PASSWORD@db-endpoint:5432/usam_learning_worlds",
  "REDIS_HOST": "redis-endpoint.cache.amazonaws.com",
  "JWT_ACCESS_SECRET": "production-jwt-secret-change-this",
  "JWT_REFRESH_SECRET": "production-refresh-secret-change-this",
  "AWS_ACCESS_KEY_ID": "AKIA...",
  "AWS_SECRET_ACCESS_KEY": "...",
  "S3_BUCKET": "usam-learning-worlds-prod",
  "SENTRY_DSN": "https://...@sentry.io/...",
  "BEDROCK_HAIKU_MODEL": "anthropic.claude-3-haiku-20240307-v1:0",
  "BEDROCK_SONNET_MODEL": "anthropic.claude-3-5-sonnet-20240620-v1:0"
}
```

---

## DATABASE MIGRATIONS

### Production Migration Strategy

```bash
# Run migrations as part of deployment
npx prisma migrate deploy

# Or create migration job in ECS
aws ecs run-task \
  --cluster usam-cluster \
  --task-definition usam-migration \
  --launch-type FARGATE \
  --network-configuration "..."
```

### Rollback Strategy

```bash
# Create backup before migration
aws rds create-db-snapshot \
  --db-instance-identifier usam-postgres \
  --db-snapshot-identifier usam-pre-migration-$(date +%Y%m%d)

# If rollback needed
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier usam-postgres-rollback \
  --db-snapshot-identifier usam-pre-migration-20260812
```

---

## MONITORING & ALERTING

### CloudWatch Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name usam-high-cpu \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name usam-high-errors \
  --metric-name 5XXError \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

### Log Aggregation

```bash
# Stream logs to CloudWatch
aws logs create-log-group --log-group-name /ecs/usam-backend

# Enable container insights
aws ecs update-cluster-settings \
  --cluster usam-cluster \
  --settings name=containerInsights,value=enabled
```

---

## SSL/TLS CERTIFICATE

```bash
# Request certificate in ACM
aws acm request-certificate \
  --domain-name api.usam.com \
  --validation-method DNS \
  --subject-alternative-names "*.usam.com"

# Validate via DNS (add CNAME records)

# Attach to ALB
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:...
```

---

## CI/CD PIPELINE

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/usam-backend:$IMAGE_TAG .
          docker push $ECR_REGISTRY/usam-backend:$IMAGE_TAG
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster usam-cluster \
            --service usam-api \
            --force-new-deployment
```

---

## COST ESTIMATION (1,000 Users)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| ECS Fargate | 2 tasks (0.5 vCPU, 1GB) | $35 |
| RDS PostgreSQL | db.t3.medium, Multi-AZ | $85 |
| ElastiCache Redis | cache.t3.micro | $15 |
| S3 + CloudFront | 50GB storage, 100GB transfer | $10 |
| AWS Bedrock | 10M tokens/month (80% Haiku) | $330 |
| ALB | 2 LCUs | $25 |
| NAT Gateway | 1 gateway | $32 |
| Secrets Manager | 10 secrets | $4 |
| CloudWatch | Logs + metrics | $20 |
| **Total** | | **~$556/month** |

**Scaling to 10K users**: ~$1,200/month (mostly Bedrock AI costs)

---

## PRODUCTION CHECKLIST

### Security
- [ ] SSL/TLS certificate configured
- [ ] WAF rules enabled
- [ ] Security groups locked down
- [ ] Secrets in Secrets Manager (not env vars)
- [ ] IAM roles follow least privilege
- [ ] Database encryption enabled
- [ ] S3 bucket policies secure
- [ ] VPC endpoints for AWS services

### Performance
- [ ] Auto-scaling configured
- [ ] Database read replicas (if needed)
- [ ] Redis caching enabled
- [ ] CloudFront CDN configured
- [ ] Connection pooling optimized
- [ ] Query indexes verified

### Monitoring
- [ ] CloudWatch alarms configured
- [ ] Error tracking (Sentry) enabled
- [ ] Log aggregation working
- [ ] Grafana dashboards deployed
- [ ] On-call rotation defined

### Backup & Recovery
- [ ] Automated database backups (7 days)
- [ ] S3 versioning enabled
- [ ] Disaster recovery plan documented
- [ ] RTO/RPO defined
- [ ] Restore tested

### Compliance
- [ ] COPPA compliance verified
- [ ] GDPR compliance verified
- [ ] Data retention policy enforced
- [ ] Audit logging enabled
- [ ] Privacy policy updated

---

## ROLLBACK PROCEDURE

```bash
# 1. Get previous task definition
aws ecs describe-task-definition --task-definition usam-backend:PREVIOUS_VERSION

# 2. Update service to previous version
aws ecs update-service \
  --cluster usam-cluster \
  --service usam-api \
  --task-definition usam-backend:PREVIOUS_VERSION \
  --force-new-deployment

# 3. Monitor rollback
aws ecs describe-services \
  --cluster usam-cluster \
  --services usam-api

# 4. If database migration issue, restore snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier usam-postgres \
  --db-snapshot-identifier usam-pre-migration-TIMESTAMP
```

---

## SUPPORT & MAINTENANCE

### Regular Tasks
- **Daily**: Monitor error rates, check CloudWatch alarms
- **Weekly**: Review costs, check disk usage, analyze slow queries
- **Monthly**: Update dependencies, review security patches, optimize costs
- **Quarterly**: Load testing, disaster recovery drill, security audit

### Useful Commands

```bash
# View ECS task logs
aws logs tail /ecs/usam-backend --follow

# Check service health
aws ecs describe-services --cluster usam-cluster --services usam-api

# Scale service
aws ecs update-service \
  --cluster usam-cluster \
  --service usam-api \
  --desired-count 5

# Run one-off task (migrations, seeds)
aws ecs run-task \
  --cluster usam-cluster \
  --task-definition usam-backend \
  --launch-type FARGATE
```

---

**🚀 Production deployment complete! Monitor closely for first 48 hours.**

---

END OF DEPLOYMENT GUIDE
