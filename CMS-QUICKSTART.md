# 🚀 Quick Start Guide - Dynasty labz CMS

Get started with your new Content Management System in 5 minutes!

## ⚡ Instant Access

### Step 1: Access the Admin Panel

1. Open your browser
2. Navigate to: **`/admin/login.html`**
3. Enter credentials:
   - **Username**: `admin`
   - **Password**: `dynastylabz2024`
4. Click **Access Dashboard**

### Step 2: Edit Your First Content

1. Click **Content Editor** (or the ✏️ icon)
2. Under **Home Page** tab, change the hero title:
   - **Line 1**: Try "Welcome to My Website"
   - **Line 2**: Try "Building the Future"
3. Click **💾 Save Changes**
4. A file will download: `site-content.json`

### Step 3: Apply Changes to Your Site

1. Move the downloaded `site-content.json` to: `content/site-content.json`
2. Refresh your homepage
3. See your changes live! 🎉

### Step 4: Preview Before Publishing

1. Make any changes in the editor
2. Click **👁️ Preview Changes** (top right)
3. Review in the new tab
4. If satisfied, save and download

---

## 📋 Common Tasks

### Change Homepage Hero Section

```
Admin → Content Editor → Home Page → Hero Section
```
- Update title lines
- Change subtitle
- Modify stats (numbers and labels)
- Edit button text and links

### Update Service Cards

```
Admin → Content Editor → Home Page → Services Section
```
- Change section title
- Update each card's:
  - Icon (use emojis: 🤖 ⚡ 💻 📊)
  - Title
  - Description
  - Link

### Modify Header/Footer

```
Admin → Content Editor → Header & Footer
```
- Logo text and accent
- Navigation links
- Footer branding
- Copyright text

### Upload Images

```
Admin → Media Library → Upload Media
```
1. Click **📤 Upload Media**
2. Drag & drop or browse for files
3. Wait for upload to complete
4. Click on image to copy URL
5. Use URL in your content

---

## 🎯 5-Minute Customization Checklist

- [ ] Change hero title to your business name
- [ ] Update hero subtitle with your tagline
- [ ] Modify stats to reflect your metrics
- [ ] Update service cards with your services
- [ ] Change CTA button text
- [ ] Update logo text in header
- [ ] Customize footer tagline
- [ ] Upload your logo image
- [ ] Preview all changes
- [ ] Save and publish

---

## 💾 Publishing Your Changes

### Method 1: Manual (Current)

1. Save in admin panel
2. Download JSON file
3. Replace file in `content/` folder
4. Commit to Git:
   ```bash
   git add content/site-content.json
   git commit -m "Update website content"
   git push
   ```

### Method 2: Automated (Recommended for Production)

Set up automatic deployment with Vercel/Netlify:

1. Connect your Git repository
2. Enable auto-deploy on push
3. Every time you push JSON changes, site auto-updates

---

## 🆘 Quick Fixes

### "Can't Login"
- **Solution**: Check credentials in `/admin/js/auth.js`
- Default: admin / dynastylabz2024

### "Changes Not Showing"
- **Solution**: Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Verify JSON file is in correct location

### "Preview Not Working"
- **Solution**: Ensure `content-loader.js` is included in HTML
- Check browser console for errors

### "Media Won't Upload"
- **Solution**: Keep files under 5MB
- Try different file format
- Check browser console

---

## 📁 File Locations

| What | Where |
|------|-------|
| Admin login | `/admin/login.html` |
| Dashboard | `/admin/dashboard.html` |
| Content editor | `/admin/editor.html` |
| Media library | `/admin/media.html` |
| Website content | `/content/site-content.json` |
| Media files | `/content/media.json` |
| Content loader | `/js/content-loader.js` |

---

## 🎨 Content Templates

### Hero Title Template
```
Line 1: [Action Verb] [Subject]
Line 2: With [Your Unique Value]

Example:
Line 1: "Transforming Businesses"
Line 2: "With AI Intelligence"
```

### Service Card Template
```
Icon: [Relevant Emoji]
Title: [Service Name - 2-4 words]
Description: [What you do - 15-20 words]
Link: [Where to learn more]

Example:
Icon: 🤖
Title: "AI Integration"
Description: "Seamlessly integrate cutting-edge AI solutions into your existing business workflows and systems."
Link: "services.html"
```

### CTA Template
```
Title: [Action-oriented question or statement]
Description: [What happens next - 10-15 words]
Button: [Clear action verb + benefit]

Example:
Title: "Ready to Transform Your Business?"
Description: "Let's discuss how AI can revolutionize your operations."
Button: "Get Free Consultation"
```

---

## 🔐 Security Reminder

**⚠️ BEFORE GOING LIVE:**

1. Change default admin password
2. Use HTTPS (enable in hosting)
3. Don't commit passwords to Git
4. Consider backend authentication
5. Enable access logging

---

## 📞 Need Help?

1. Check `/admin/README.md` for detailed documentation
2. Review browser console for error messages
3. Test in incognito/private mode
4. Try a different browser

---

## 🎉 You're Ready!

Your content management system is fully set up and ready to use. Start customizing your website content without touching any code!

**Pro Tips:**
- Save often
- Preview before publishing
- Keep backups of your JSON files
- Use version control (Git)
- Test on mobile devices too

---

**Happy Editing! 🚀**

*For detailed documentation, see: `/admin/README.md`*
