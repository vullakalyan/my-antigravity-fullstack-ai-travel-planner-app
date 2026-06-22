# Deployment Guide: AI Travel Planner

This guide will walk you through publishing your AI Travel Planner on the internet. Because this application has a robust, distinct Backend (Node.js) and Frontend (Next.js), you will deploy them to two different platforms.

We highly recommend **Render.com** (or Railway) for the Backend, and **Netlify** for the Frontend. Both offer excellent free tiers for side projects.

---

## 1. Prepare Your GitHub Repository

1. Initialize a Git repository if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a new repository on GitHub and push your code.

---

## 2. Deploy the Backend (Render.com)

Netlify is fantastic for frontends, but your backend requires a server that stays running to maintain a constant connection to MongoDB. 

1. Create a free account at [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `AI Travel Planner WebSite` repository.
4. Fill in the deployment details:
   - **Name:** `ai-travel-backend` (or similar)
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (Make sure your `backend/package.json` has `"start": "node server.js"`)
5. **Environment Variables:** Scroll down and add all the variables from your `backend/.env.example`:
   - `MONGO_URI`: (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: (A secure random string)
   - `ANTHROPIC_API_KEY`: (Your Claude API key)
   - `CORS_ORIGIN`: (Leave this blank for now; we'll update it after Netlify is deployed)
6. Click **Create Web Service**. 
7. Wait a few minutes for it to build. Once live, Render will give you a URL like `https://ai-travel-backend.onrender.com`. Save this URL.

---

## 3. Deploy the Frontend (Netlify)

Now we will deploy the Next.js frontend and connect it to your live backend.

1. Go to [Netlify.com](https://netlify.com) and log in.
2. Go to your dashboard and click **Add new site > Import an existing project**.
3. Connect your GitHub account and select the repository.
4. **Build settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/.next`
5. **Environment Variables:** Click "Add environment variables" and add:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://ai-travel-backend.onrender.com/api` *(Use the URL you got from Render in Step 2)*
6. Click **Deploy site**.
7. Netlify will begin building your app using the `frontend/netlify.toml` file we generated.
8. Once complete, Netlify will give you a live URL (e.g., `https://my-travel-app.netlify.app`).

---

## 4. Final Security Step: Connect the Two (CORS)

To ensure your backend only accepts requests from your specific Netlify domain (preventing others from using your API and Claude credits), you need to update the CORS setting on Render.

1. Go back to your Backend Web Service on **Render**.
2. Click on the **Environment** tab.
3. Update or add the `CORS_ORIGIN` variable to match your Netlify URL EXACTLY (no trailing slash):
   - Key: `CORS_ORIGIN`
   - Value: `https://my-travel-app.netlify.app`
4. Save the changes. Render will automatically redeploy your backend with the new security rule.

---

### 🎉 You're Live!
Your full-stack application is now successfully running on the internet! Users can visit your Netlify domain to sign up, log in, and generate Claude-powered travel itineraries.
