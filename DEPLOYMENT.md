# Deployment Guide - OmniCampus ERP

## Best Free Setup: Vercel + Neon + GitHub Actions

### Why This Setup?

- **Vercel**: Best free tier for Next.js (100GB bandwidth, unlimited deployments, auto-SSL, edge caching)
- **Neon**: Serverless PostgreSQL with free tier (already configured)
- **GitHub Actions**: Free CI/CD with automated testing and deployment

---

## Step 1: Deploy to Vercel

### Option A: Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import from GitHub
5. Vercel will auto-detect Next.js
6. Click **Deploy**

### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Step 2: Add Environment Variables in Vercel

After deploying, add these environment variables in Vercel Dashboard:

### Required Variables
```
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://neondb_owner:xxx@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
AUTH_SECRET=your-super-secret-auth-key-change-in-production
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://your-app.vercel.app
AUTH_URL=https://your-app.vercel.app
```

### Optional Variables
```
REDIS_URL=redis://your-redis-url
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Step 3: Set Up GitHub Actions CI/CD

### Add GitHub Secrets

Go to: **GitHub Repo → Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:
```
VERCEL_TOKEN=your-vercel-token
```

To get Vercel token:
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a new token
3. Copy and paste as GitHub secret

### Add GitHub Variables

Go to: **GitHub Repo → Settings → Secrets and variables → Actions → Variables → New repository variable**

Add:
```
PRODUCTION_URL=https://your-app.vercel.app
```

---

## Step 4: Push to Main Branch

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

GitHub Actions will automatically:
1. Run linting
2. Run type checking
3. Run unit tests
4. Build the application
5. Run E2E tests
6. Deploy to Vercel (only on main branch)

---

## Step 5: Verify Deployment

1. Check GitHub Actions tab to see pipeline status
2. Visit your Vercel URL
3. Test the application:
   - Login functionality
   - Dashboard loads
   - Recruitment, Payroll, Hostel, Inventory, Alumni pages work

---

## Free Tier Limits

### Vercel (Hobby Plan)
- ✅ 100GB bandwidth per month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Edge caching
- ✅ 6GB serverless function execution

### Neon (Free Tier)
- ✅ 0.5GB storage
- ✅ 3 billion row reads/month
- ✅ 1 billion row writes/month
- ✅ 200 hours of compute time/month

### GitHub Actions (Free)
- ✅ 2000 minutes/month
- ✅ 500MB storage
- ✅ Unlimited public repos

---

## Troubleshooting

### Build Fails on Vercel
- Check environment variables are set correctly
- Ensure DATABASE_URL and DIRECT_URL are valid
- Check Prisma schema is up to date

### Database Connection Issues
- Neon database may need to be activated (it auto-suspends after inactivity)
- Check Neon console for connection string

### Deployment Fails
- Check GitHub Actions logs
- Verify VERCEL_TOKEN is valid
- Ensure GitHub secrets are properly configured

---

## Next Steps

After successful deployment:
1. Set up custom domain (Vercel supports free SSL)
2. Configure email notifications (optional)
3. Set up Redis for production caching (optional)
4. Monitor Vercel analytics
5. Set up error tracking (Sentry, optional)

---

## Alternative Free Options

If you prefer other platforms:

### Render
- Free web service (spins down after inactivity)
- Free PostgreSQL (90 days only)
- Easy deployment from GitHub

### Railway
- $5 free credit/month
- Includes database hosting
- Good for full-stack apps

### Netlify
- Similar to Vercel
- 100GB bandwidth/month
- Good static site support

**Vercel + Neon remains the best free option for Next.js + PostgreSQL.**
