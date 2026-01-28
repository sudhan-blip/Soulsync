# 🚀 SoulSync Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Clear Test Data
Run this command in the backend folder:
```bash
node clearDatabase.js
```

### 2. Environment Variables Setup

**Backend (.env):**
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

**Frontend (.env):**
```
VITE_API_URL=https://your-backend-url.com
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) ⭐ RECOMMENDED

#### Deploy Backend to Render:
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** soulsync-backend
   - **Root Directory:** soulsync-backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add Environment Variables (MONGO_URI, JWT_SECRET, GROQ_API_KEY)
6. Click "Create Web Service"
7. Copy the deployed URL (e.g., https://soulsync-backend.onrender.com)

#### Deploy Frontend to Vercel:
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** soulsync-frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** dist
5. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL
6. Click "Deploy"

---

### Option 2: Railway (Full Stack)

1. Go to [railway.app](https://railway.app) and sign up
2. Create new project
3. Deploy backend:
   - Add service → Deploy from GitHub
   - Select repository
   - Set root directory: soulsync-backend
   - Add environment variables
4. Deploy frontend:
   - Add service → Deploy from GitHub
   - Select repository
   - Set root directory: soulsync-frontend
   - Add VITE_API_URL environment variable

---

### Option 3: VPS (DigitalOcean, AWS, etc.)

#### Backend Setup:
```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone repository
git clone your-repo-url
cd SoulSync/soulsync-backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Start with PM2
pm2 start app.js --name soulsync-backend
pm2 save
pm2 startup
```

#### Frontend Setup:
```bash
cd ../soulsync-frontend

# Create .env
echo "VITE_API_URL=http://your-server-ip:5000" > .env

# Build
npm install
npm run build

# Install nginx
sudo apt install nginx

# Copy build files
sudo cp -r dist/* /var/www/html/

# Configure nginx
sudo nano /etc/nginx/sites-available/default
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_header_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Security Checklist

- [ ] Changed JWT_SECRET to a strong random string
- [ ] MongoDB Atlas IP whitelist configured (or set to 0.0.0.0/0 for cloud deployment)
- [ ] CORS properly configured in backend
- [ ] Environment variables secured (not in code)
- [ ] HTTPS enabled (Vercel/Render provide this automatically)

---

## 🧪 After Deployment

1. Test all features:
   - Sign up new account
   - Login
   - Chat functionality
   - Profile updates
   - Logout

2. Monitor logs:
   - **Render:** Check logs in dashboard
   - **Vercel:** Check function logs
   - **VPS:** `pm2 logs soulsync-backend`

3. Update frontend API URL in code if needed

---

## 📱 Custom Domain (Optional)

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Render:
1. Go to Service → Settings → Custom Domain
2. Add your domain
3. Update DNS CNAME record

---

## 🐛 Troubleshooting

**CORS Errors:**
- Update backend app.js CORS configuration with your frontend URL

**Database Connection:**
- Check MongoDB Atlas IP whitelist
- Verify MONGO_URI is correct

**API Not Working:**
- Ensure VITE_API_URL includes the full backend URL
- Rebuild frontend after changing environment variables

---

## 💡 Quick Start Commands

```bash
# Clear database (run in backend folder)
node clearDatabase.js

# Test locally before deploying
cd soulsync-backend
npm start

cd soulsync-frontend
npm run dev
```

---

Good luck with your deployment! 🎉
