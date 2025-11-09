# Quick Deployment Guide

## 🚀 Deploy to Render (Easiest - Free)

### Step 1: Push to GitHub
```bash
cd interactive_dashboard
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

**Important**: Make sure `hospital_data_clean_base_all_drgs.csv` is accessible. Options:
- Include it in the repo (if < 100MB)
- Or place it in the parent directory of your repo

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) → Sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your repository
5. Configure:
   - **Name**: `hospital-los-dashboard`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
   - **Root Directory**: Leave blank (or `interactive_dashboard` if repo root is parent)
6. Click **"Create Web Service"**
7. Wait 5-10 minutes for first deployment

### Step 3: Share Your URL
Your dashboard will be live at: `https://your-app-name.onrender.com`

---

## 📝 Notes

- **Free tier**: 512MB RAM, may be slow with large datasets
- **Auto-deploys**: Every push to GitHub triggers a new deployment
- **Custom domain**: Available in paid plans

---

## 🔧 Alternative: Railway

1. Go to [railway.app](https://railway.app)
2. Sign up → "New Project" → "Deploy from GitHub"
3. Select your repo
4. Railway auto-detects Python and deploys!

---

## ✅ Checklist Before Deploying

- [ ] CSV file is accessible (in repo or correct path)
- [ ] `requirements.txt` is up to date
- [ ] `Procfile` exists (already created)
- [ ] Code pushed to GitHub
- [ ] Tested locally first

---

**Need help?** See `DEPLOYMENT.md` for detailed instructions.

