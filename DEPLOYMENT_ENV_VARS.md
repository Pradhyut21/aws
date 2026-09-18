# BharatMedia — Deployment Environment Variables

---

## Backend (AWS App Runner)

Set these in: **App Runner Console → Your service → Configuration → Environment variables**

| Variable | Value | Notes |
|---|---|---|
| `AWS_REGION` | `us-east-1` | Must match where your Bedrock models are approved |
| `DYNAMODB_TABLE` | `bharatmedia-dev` | Created automatically on first server start |
| `S3_BUCKET_NAME` | `bharatmedia-images-dev` | Must be created manually (see S3 Setup below) |
| `JWT_SECRET` | `<generate below>` | Run: `openssl rand -hex 32` |
| `ALLOWED_ORIGINS` | `https://your-app.amplifyapp.com` | Your Amplify domain (get it after Amplify deploy) |
| `NODE_ENV` | `production` | |
| `PORT` | `4000` | |
| `LOG_LEVEL` | `info` | |

> **Do NOT** set `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` in App Runner.  
> App Runner uses an **IAM instance role** instead (more secure). See IAM Role section below.

---

## Frontend (AWS Amplify)

Set these in: **Amplify Console → App settings → Environment variables**

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://<apprunner-url>/api` | Get from App Runner console after deploy |
| `VITE_WS_URL` | `wss://<apprunner-url>` | Same domain, wss:// protocol |

---

## IAM Role for App Runner

App Runner needs this **instance role** (attach during service creation):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:DescribeTable",
        "dynamodb:CreateTable"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/bharatmedia-dev",
        "arn:aws:dynamodb:us-east-1:*:table/bharatmedia-dev/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::bharatmedia-images-dev/*"
    }
  ]
}
```

---

## S3 Bucket Setup (one-time, before first deploy)

```bash
# Create bucket
aws s3api create-bucket --bucket bharatmedia-images-dev --region us-east-1

# Allow public reads (needed for Titan image URLs to render in browser)
aws s3api delete-public-access-block --bucket bharatmedia-images-dev

aws s3api put-bucket-policy --bucket bharatmedia-images-dev --policy '{
  "Version":"2012-10-17",
  "Statement":[{
    "Effect":"Allow",
    "Principal":"*",
    "Action":"s3:GetObject",
    "Resource":"arn:aws:s3:::bharatmedia-images-dev/*"
  }]
}'
```

---

## DynamoDB Table

The server **auto-creates** the table on startup via `createTableIfNotExists()`.  
If you prefer to create it manually first:

```bash
aws dynamodb create-table \
  --table-name bharatmedia-dev \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
    AttributeName=GSI2PK,AttributeType=S \
    AttributeName=GSI2SK,AttributeType=S \
  --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[{\"IndexName\":\"UserCampaignsIndex\",\"KeySchema\":[{\"AttributeName\":\"GSI1PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI1SK\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"PublicTemplatesIndex\",\"KeySchema\":[{\"AttributeName\":\"GSI2PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI2SK\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --region us-east-1

# Add EmailIndex for getUserByEmail lookups
aws dynamodb update-table \
  --table-name bharatmedia-dev \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\":\"EmailIndex\",\"KeySchema\":[{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}}]" \
  --region us-east-1
```
