# Job Intelligence Scanner - Complete Setup & Deployment Guide 🚀

This is your **one-stop guide** for everything from development setup to production deployment.

## 🎯 **Quick Status Check**

✅ **Ready for Production**: Backend with spaCy NLP + Frontend with React
✅ **All Tests Passing**: 3/3 API tests successful  
✅ **Only Missing**: RapidAPI key for live job data

---

## 🚀 **Option 1: Quick Start (Development)**

### Get Running in 3 Steps:

```bash
# 1. Start Backend
cd backend
python start.py  # Automated setup + server start

# 2. Start Frontend (new terminal)
cd ..
npm run dev  # or: python -m http.server 5173

# 3. Test at http://localhost:5173
```

**Skip to "Get RapidAPI Key" section below to enable live data!**

---

## 🔧 **Option 2: Manual Setup**

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
# Option 1: With Node.js
npm install && npm run dev

# Option 2: Without Node.js  
python -m http.server 5173
```

---

## 🔑 **Get RapidAPI Key (Required for Production)**

### Step 1: Sign Up & Subscribe
1. **Go to**: https://rapidapi.com/
2. **Subscribe to JSearch API**: https://rapidapi.com/letscrape-6bbc96dd56/api/jsearch/
3. **Choose Plan**: 
   - Free: 1000 requests/month
   - Pro: $10-50/month for higher limits
4. **Copy your API key**

### Step 2: Configure Locally
```bash
cd backend
echo "RAPIDAPI_KEY=your_actual_key_here" > .env
```

### Step 3: Test Live Data
```bash
# Restart server
source venv/bin/activate
python3 -m uvicorn main:app --reload

# Test health endpoint
curl http://localhost:8000/health
# Should show: "rapidapi_configured": true
```

---

## 🧪 **Testing & Verification**

### Run Test Suite
```bash
cd backend
source venv/bin/activate
python test_api.py
# Should show: 3/3 tests passed
```

### Test Full Integration
1. **Open**: http://localhost:5173
2. **Search**: "Software Engineer" 
3. **Check**: Browser dev tools for API calls
4. **Verify**: Results show skills/certifications

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 🌐 **Production Deployment**

### **Option A: Render + Vercel (Recommended - $0-7/month)**

#### Backend to Render:
1. **Push to GitHub** (if not already)
2. **Connect Render** to your repo
3. **Set Environment Variables**:
   ```
   RAPIDAPI_KEY=your_actual_key
   ```
4. **Deploy Command**: 
   ```
   python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

#### Frontend to Vercel:
1. **Connect Vercel** to your repo
2. **Update API URL** in `services/jobScanService.ts`:
   ```typescript
   const API_BASE_URL = 'https://your-render-app.onrender.com';
   ```
3. **Deploy**: Automatic on push

### **Option B: Railway (All-in-One - $5-10/month)**
1. **Connect GitHub repo**
2. **Add environment variables**
3. **Deploy both frontend and backend**

### **Option C: AWS/Digital Ocean (Custom)**
- Set up server instances
- Configure reverse proxy (nginx)
- Set up SSL certificates
- Estimated cost: $10-50/month

---

## 🚨 **Troubleshooting**

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to analysis service" | Backend not running | Run `python start.py` |
| "RAPIDAPI_KEY not configured" | No API key | Add key to `.env` file |
| "spaCy model not found" | Model not installed | Run `python -m spacy download en_core_web_sm` |
| CORS errors | Port mismatch | Ensure frontend on port 5173 |
| "No jobs found" | Invalid search | Try broader terms, check API key |

### Debug Commands
```bash
# Check backend status
curl http://localhost:8000/health

# Check environment
cat backend/.env

# Test spaCy
python -c "import spacy; nlp = spacy.load('en_core_web_sm'); print('OK')"

# View backend logs
# (check terminal where uvicorn is running)
```

---

## 💰 **Cost Breakdown**

### **Development**: FREE
- Local development: $0
- Testing: $0

### **Production Options**:
| Platform | Backend | Frontend | API | Total/Month |
|----------|---------|----------|-----|-------------|
| **Render + Vercel** | Free/$7 | Free | Free/$10 | **$0-17** |
| **Railway** | $5 | $0 | Free/$10 | **$5-15** |
| **AWS/DO** | $10+ | $5+ | Free/$10 | **$15-25+** |

---

## 🎉 **Production Features**

Once deployed with API key, you'll have:

- ✅ **Live Job Data**: Real postings from major job boards
- ✅ **Advanced NLP**: spaCy processing for accurate extraction  
- ✅ **100+ Skills**: Comprehensive technical skills database
- ✅ **Smart Analysis**: Certification patterns + experience extraction
- ✅ **Professional UI**: Dark theme with polished UX
- ✅ **Error Handling**: Graceful failures with user-friendly messages
- ✅ **Scalable**: Handles multiple concurrent users
- ✅ **Analytics Ready**: Track popular searches and usage

---

## 📈 **Performance Notes**

- **Response Time**: 5-15 seconds per analysis
- **Job Limit**: Up to 50 jobs per request (API limit)
- **Rate Limits**: Based on RapidAPI subscription
- **Optimization**: Consider adding caching for production

---

## 🎯 **Your Next Step**

### **For Development Testing**:
You're ready! The app works without API key (shows sample data).

### **For Production Launch**:
1. **Get RapidAPI key** (5 minutes)
2. **Deploy to Render + Vercel** (15 minutes)  
3. **Go live** with real job data!

**The app is production-ready - you're just one API key away! 🚀**

---

## 📞 **Need Help?**

- **Quick Test**: Run `python test_api.py` in backend directory
- **Check Status**: Visit `http://localhost:8000/health`
- **Debug**: Look at terminal logs where uvicorn is running

Everything is built and tested - just add that API key and deploy! 🎊 