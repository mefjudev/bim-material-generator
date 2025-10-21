# Material Schedule Generator

A web application that analyzes images and generates BIM material schedules using OpenAI's GPT-4 Vision.

## Features

- **Image Upload**: Drag & drop or click to upload images
- **AI Analysis**: Uses OpenAI GPT-4 Vision to identify materials
- **Material Schedule**: Generates structured material data with:
  - Material codes
  - Locations
  - Finish descriptions
  - Supplier information
  - Price ranges (optional)
  - Material types
- **Export**: Download results as CSV
- **Responsive Design**: Works on desktop and mobile

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up OpenAI API key**:
   - Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a `.env.local` file in the root directory
   - Add your API key:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and go to `http://localhost:3000`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `OPENAI_API_KEY` in Vercel's environment variables
4. Deploy!

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Testing Guide for iOS Developers

Since you're an iOS developer, here's how to test this web app:

### Local Testing

1. **Start the development server**:
   ```bash
   cd bim-material-generator
   npm run dev
   ```

2. **Open in browser**: Go to `http://localhost:3000`

3. **Test the features**:
   - Upload different types of images (JPG, PNG)
   - Try drag & drop functionality
   - Test the generate button
   - Check the BIM schedule output
   - Test export functionality

### Mobile Testing

1. **Find your computer's IP address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Access from your iPhone/iPad**:
   - Connect to the same WiFi network
   - Open Safari and go to `http://YOUR_IP_ADDRESS:3000`
   - Test touch interactions and responsive design

### Production Testing

1. **Deploy to Vercel** (free):
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables
   - Test the live URL

2. **Test on different devices**:
   - iPhone Safari
   - iPad Safari
   - Desktop Chrome/Safari
   - Test the Framer integration

### Common Issues

- **API Key not working**: Make sure it's set in environment variables
- **Images not uploading**: Check file size and format
- **Slow responses**: OpenAI API can take 10-30 seconds
- **Mobile issues**: Test responsive design on actual devices

## Integration with Framer

Your client can integrate this by:

1. **Embed as iframe**:
   ```html
   <iframe src="https://your-app.vercel.app" width="100%" height="600px"></iframe>
   ```

2. **Link from Framer**:
   - Add a button in Framer
   - Link to your deployed app
   - Opens in new tab/window

3. **Custom domain** (optional):
   - Set up a custom domain in Vercel
   - Use subdomain like `tools.yourdomain.com`

## Cost Estimation

- **OpenAI API**: ~$0.01-0.10 per image analysis
- **Vercel Hosting**: Free tier (100GB bandwidth/month)
- **Domain**: Optional (~$10-15/year)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your OpenAI API key is working
3. Test with different images
4. Check network connectivity

## Deployment Status
- ✅ ESLint errors fixed
- ✅ TypeScript errors resolved
- ✅ Client-side image compression implemented
- ✅ BIM data structure and display updated per client feedback
- ✅ Table column widths adjusted for better visibility
- ✅ 'Type' column reintroduced
- ✅ Ready for production deployment