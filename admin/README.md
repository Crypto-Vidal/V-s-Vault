# Dynasty labz - Content Management System (CMS)

A lightweight, easy-to-use content management system for updating website content without editing HTML files directly.

## 🚀 Features

- **Easy Content Editing**: Update text, headlines, and descriptions through a user-friendly interface
- **Media Library**: Upload and manage images, videos, and documents
- **Live Preview**: Preview changes before publishing
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Secure Access**: Password-protected admin panel
- **No Database Required**: Uses JSON files for content storage
- **Holographic UI**: Beautiful, futuristic interface matching your website design

## 📁 Directory Structure

```
admin/
├── css/
│   └── admin.css           # Admin panel styling
├── js/
│   ├── auth.js            # Authentication system
│   ├── dashboard.js       # Dashboard functionality
│   ├── editor.js          # Content editor
│   └── media.js           # Media library manager
├── dashboard.html         # Main dashboard
├── editor.html            # Content editor page
├── login.html             # Login page
├── media.html             # Media library page
└── README.md             # This file

content/
├── site-content.json      # Website content data
└── media.json             # Media library data

js/
└── content-loader.js      # Loads content into website pages
```

## 🔐 Access & Login

### Default Credentials

**⚠️ IMPORTANT: Change these credentials before deploying to production!**

- **Username**: `admin`
- **Password**: `dynastylabz2024`

### Changing Credentials

1. Open `admin/js/auth.js`
2. Find the `AUTH_CONFIG` object:
```javascript
const AUTH_CONFIG = {
    defaultUsername: 'admin',
    defaultPassword: 'dynastylabz2024',
    // ...
};
```
3. Change the username and password
4. Save the file

**For Production**: Implement proper backend authentication with encrypted passwords.

## 📝 How to Use

### 1. Accessing the Admin Panel

1. Navigate to `/admin/login.html`
2. Enter your credentials
3. Click "Access Dashboard"

### 2. Editing Content

#### Homepage Content

1. Go to **Content Editor** from the dashboard
2. Click on the **Home Page** tab
3. Edit sections:
   - **Hero Section**: Main headline, subtitle, stats
   - **Services**: Service cards with icons and descriptions
   - **Call-to-Action**: Bottom section encouraging user action
4. Click **💾 Save Changes**
5. Download the updated `site-content.json` file
6. Replace `content/site-content.json` with the downloaded file

#### Header & Footer

1. In Content Editor, click **Header & Footer** tab
2. Edit:
   - Logo text
   - Navigation links
   - Footer information
3. Click **💾 Save Changes**
4. Download and replace the JSON file

### 3. Managing Media

#### Uploading Files

1. Go to **Media Library**
2. Click **📤 Upload Media**
3. Drag & drop files or click **Browse Files**
4. Supported formats:
   - Images: JPG, PNG, GIF, SVG, WebP
   - Videos: MP4, WebM, MOV
   - Documents: PDF, DOC, DOCX

#### Using Media

1. Click on any media item to view details
2. Click **📋 Copy URL** to copy the file URL
3. Use the URL in your content or HTML

#### Deleting Media

1. Click on the media item
2. Click **🗑️ Delete**
3. Confirm deletion

### 4. Preview Changes

Before publishing changes:

1. In Content Editor, click **👁️ Preview Changes**
2. A new tab opens showing your changes
3. Review all sections
4. Close preview when done

## 🔄 Publishing Workflow

### Current System (JSON-based)

1. Make changes in the admin panel
2. Click **Save Changes**
3. Download the updated JSON file
4. Replace the file in your `content/` directory:
   - For content: `content/site-content.json`
   - For media: `content/media.json`
5. Commit and push changes to your repository
6. Changes appear on the live site

### Automated Deployment (Future Enhancement)

For easier publishing, consider integrating with:
- **GitHub Actions**: Auto-deploy when JSON files change
- **Netlify/Vercel**: Continuous deployment from repository
- **Backend API**: Save changes directly to server

## 📊 Dashboard Overview

### Stats Cards

- **Total Pages**: Number of pages in your website
- **Media Files**: Total uploaded media items
- **Last Update**: When content was last modified
- **Status**: System status

### Quick Actions

- **Edit Content**: Jump to content editor
- **Upload Media**: Add new media files
- **Edit Homepage**: Quick access to homepage editing
- **Preview Site**: View your live website

### Recent Changes

Shows a log of recent content updates and changes.

## 🎨 Content Structure

### Homepage Content (`home` section)

```json
{
  "home": {
    "hero": {
      "title": {
        "line1": "Main headline",
        "line2": "Secondary headline"
      },
      "subtitle": "Tagline or description",
      "stats": [
        { "number": "100+", "label": "Description" }
      ],
      "primaryCTA": { "text": "Button text", "link": "url" },
      "secondaryCTA": { "text": "Button text", "link": "url" }
    },
    "services": {
      "sectionTitle": "Section heading",
      "cards": [
        {
          "icon": "🤖",
          "title": "Service name",
          "description": "Service description",
          "link": "service-page.html"
        }
      ]
    },
    "cta": {
      "title": "Call to action title",
      "description": "CTA description",
      "buttonText": "Button text",
      "link": "contact.html"
    }
  }
}
```

### Header & Footer (`header` and `footer` sections)

```json
{
  "header": {
    "logo": {
      "text": "Main text",
      "accent": "Accent text"
    },
    "navigation": [
      { "text": "Link text", "link": "url" }
    ]
  },
  "footer": {
    "brand": {
      "text": "Brand",
      "accent": "Accent"
    },
    "tagline": "Footer tagline",
    "copyright": "Copyright text"
  }
}
```

## 🔧 Customization

### Adding New Content Sections

1. **Update JSON structure** in `content/site-content.json`:
```json
{
  "newSection": {
    "title": "Section Title",
    "content": "Section content"
  }
}
```

2. **Add editor fields** in `admin/editor.html`:
```html
<div class="form-group">
  <label for="newSectionTitle">New Section Title</label>
  <input type="text" id="newSectionTitle" class="form-input">
</div>
```

3. **Update editor.js** to handle the new fields:
```javascript
setValue('newSectionTitle', this.content.newSection.title);
```

4. **Update content-loader.js** to apply the content:
```javascript
updateNewSection(section) {
  const element = document.querySelector('.new-section-title');
  if (element) element.textContent = section.title;
}
```

### Styling the Admin Panel

Edit `admin/css/admin.css` to customize:
- Colors: Modify CSS variables at the top
- Layout: Adjust grid and flexbox properties
- Typography: Change font sizes and families

### Adding More Pages

To add CMS support for other pages (About, Services, etc.):

1. Add page content to `site-content.json`
2. Create editor sections in `editor.html`
3. Update `editor.js` to handle the new content
4. Include `content-loader.js` in the page HTML
5. Add update functions in `content-loader.js`

## 🚨 Troubleshooting

### Cannot Login

- Check credentials in `admin/js/auth.js`
- Clear browser cache and localStorage
- Check browser console for errors

### Changes Not Showing

- Ensure JSON file is replaced correctly
- Clear browser cache
- Check file permissions
- Verify JSON syntax (use JSONLint.com)

### Media Not Uploading

- Check file size (keep under 5MB for best performance)
- Verify file format is supported
- Check browser console for errors
- Ensure localStorage has space

### Preview Not Working

- Ensure `content-loader.js` is included in HTML
- Check browser console for fetch errors
- Verify JSON file path is correct

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer: Not supported

## 🔒 Security Notes

### Current Implementation

This is a **client-side only** system for demonstration and development. For production:

1. **Authentication**: Implement server-side authentication
2. **Authorization**: Add role-based access control
3. **File Storage**: Use proper backend storage (AWS S3, Cloudinary, etc.)
4. **Validation**: Validate and sanitize all inputs server-side
5. **HTTPS**: Always use HTTPS in production
6. **Session Management**: Implement secure session handling

### Recommended Improvements

- [ ] Backend API for content management
- [ ] Database for content storage
- [ ] User management with encrypted passwords
- [ ] Activity logging and audit trail
- [ ] Content versioning and rollback
- [ ] Multi-user support with permissions
- [ ] Automated backups

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic content editor
- ✅ Media library
- ✅ JSON-based storage
- ✅ Preview functionality

### Phase 2 (Future)
- [ ] Backend integration
- [ ] Real-time content updates
- [ ] Content scheduling
- [ ] SEO management
- [ ] Analytics dashboard

### Phase 3 (Advanced)
- [ ] Multi-language support
- [ ] A/B testing
- [ ] Email templates
- [ ] Blog post management
- [ ] E-commerce integration

## 💡 Best Practices

1. **Backup Regularly**: Always backup JSON files before making changes
2. **Test in Preview**: Use preview mode before publishing
3. **Keep Content Short**: Maintain readability with concise text
4. **Optimize Images**: Compress images before uploading
5. **Use Version Control**: Commit JSON changes to Git
6. **Document Changes**: Note what you changed and why

## 🤝 Support

For questions or issues:
1. Check this README first
2. Review browser console for errors
3. Test in different browsers
4. Clear cache and try again

## 📄 License

This CMS is part of the Dynasty labz website project.

---

**Built with ❤️ for easy content management**

*Last updated: 2024*
