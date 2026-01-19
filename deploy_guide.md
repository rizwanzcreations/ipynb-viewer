# How to Host your IPYNB Viewer for FREE

Since this is a fully client-side application (HTML/JS/CSS), you can host it for free on several platforms. Here are the two easiest ways:

## Option 1: Netlify (Easiest - Drag & Drop)
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag the entire `ipynb_viewer` folder from your computer into the box on the webpage.
3. **Done!** It will give you a live URL immediately (e.g., `https://random-name-123.netlify.app`).
4. You can then create a free account to change the URL name.

## Option 2: GitHub Pages (Professional & Permanent)
1. Create a free account on [GitHub](https://github.com/).
2. Create a new repository named `ipynb-viewer`.
3. Upload your files (`index.html`, `style.css`, `app.js`) to that repository.
4. Go to **Settings > Pages**.
5. Under "Branch", select `main` and click **Save**.
6. Your site will be live at `https://your-username.github.io/ipynb-viewer/`.

---

### Important: Adding your Google Ads ID
Before you upload the files, make sure to:
1. Open `index.html` in a text editor.
2. Replace `ca-pub-0000000000000000` with your actual **AdSense Publisher ID**.
3. Replace the `data-ad-slot` numbers with your actual ad slot IDs.

Once hosted, Google will start showing ads on your site automatically!
