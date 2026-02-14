# Push to GitHub & Deploy

## 1. Push to GitHub

**Create a new repository on GitHub** (github.com → New repository). Do **not** add a README or .gitignore (you already have them).

Then run (replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name):

```bash
cd "c:\Users\ishan\OneDrive\Desktop\news app\genz-news"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

If GitHub asks for login, use a **Personal Access Token** (Settings → Developer settings → Personal access tokens) as the password.

---

## 2. Deploy (Vercel – free & easy)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New… → Project** and import your repo.
3. Leave **Build Command** as `npm run build` and **Output Directory** as `dist`.
4. Under **Environment Variables**, add:
   - **Name:** `VITE_NEWS_API_KEY`
   - **Value:** your NewsAPI key (same as in `.env` locally)
5. Click **Deploy**. Your app will be live at `https://your-project.vercel.app`.

**Note:** Your `.env` file is not in the repo (it’s in `.gitignore`), so you must set `VITE_NEWS_API_KEY` in Vercel’s dashboard for the deployed app to work.

---

## Other hosts

- **Netlify:** Connect the GitHub repo, build command `npm run build`, publish directory `dist`, add `VITE_NEWS_API_KEY` in Site settings → Environment variables.
- **GitHub Pages:** Use the `gh-pages` package and set the correct `base` in `vite.config.js` for your repo path.
