# AI Bandhu – Voice Commerce Assistant

## Overview

AI Bandhu is an intelligent voice and text-based shopping assistant for Retail Bandhu. It enables retailers to place, manage, and modify orders through natural speech in Hindi, English, or mixed languages.

## Features

### 1. **Floating Button**
- Circular blue (#0072F5) button with robot emoji (🤖)
- Soft glow and pulse animation on hover
- Always visible bottom-right on every page
- Green indicator dot shows assistant is online

### 2. **Slide-In Drawer**
- Accessible from any page
- Friendly chat interface
- Contextual product suggestions
- Real-time order confirmation

### 3. **Voice Input**
- Browser Speech Recognition API (Hindi + English)
- Real-time waveform visualization while listening
- Auto-send final transcription
- Fallback to text input

### 4. **Natural Language Processing**
- Uses OpenAI GPT-4-turbo for intent parsing
- Understands mixed Hindi-English commands
- Extracts product names, quantities, and actions
- Confidence scoring for each interpretation

### 5. **Order Operations**
- **Add to cart**: "10 packet Tata Salt order करो।"
- **Remove**: "Remove 2 Surf Excel"
- **Update quantity**: "5 more Marie Gold"
- **View cart**: "कार्ट दिखाओ"
- **Quick checkout**: "checkout करो"
- **Search**: "Do you have biscuits?"

## Technical Stack

### Frontend
- React + Next.js (Client Component)
- shadcn/ui for components
- Tailwind CSS for styling
- Web Speech API for voice input

### Backend
- Next.js API Routes
- Vercel AI SDK with OpenAI GPT-4-turbo
- Supabase for product data
- Custom intent parsing

## API Endpoints

### POST `/api/ai-bandhu/parse-intent`

**Request:**
\`\`\`json
{
  "command": "10 packet Tata Salt order करो"
}
\`\`\`

**Response:**
\`\`\`json
{
  "action": "add",
  "product": "Tata Salt",
  "quantity": 10,
  "message": "ठीक है! 10 पैकेट Tata Salt आपके कार्ट में जोड़ दिया गया है। ✅",
  "cartUpdate": {
    "quantity": 10,
    "action": "add"
  }
}
\`\`\`

## Usage

### Enable AI Bandhu

The assistant is automatically available on all pages via the global `AiBandhuWrapper` component in the root layout.

### Listen to Cart Updates

\`\`\`typescript
useEffect(() => {
  const handleCartUpdate = (event: CustomEvent) => {
    const { detail } = event
    // Update your cart state
    updateCart(detail)
  }

  window.addEventListener('ai-bandhu-cart-update', handleCartUpdate as EventListener)
  return () => window.removeEventListener('ai-bandhu-cart-update', handleCartUpdate as EventListener)
}, [])
\`\`\`

## Supported Commands

| Command | Example | Action |
|---------|---------|--------|
| Add to cart | "10 packet Tata Salt order करो" | Adds 10 units to cart |
| Remove | "Remove 2 Surf Excel" | Removes 2 units |
| Update | "5 more Marie Gold" | Adds 5 more units |
| View | "कार्ट दिखाओ" | Shows cart summary |
| Search | "Do you have biscuits?" | Searches products |
| Checkout | "checkout करो" | Initiates checkout |

## Customization

### Change Voice Language
Edit `recognitionRef.current.lang` in `ai-bandhu-drawer.tsx`:
\`\`\`typescript
recognitionRef.current.lang = 'hi-IN' // Hindi
recognitionRef.current.lang = 'en-IN' // English
\`\`\`

### Modify System Prompt
Update the `systemPrompt` in `/api/ai-bandhu/parse-intent/route.ts` to customize responses and available products.

### Styling
- Button: `components/ai-bandhu/ai-bandhu-button.tsx`
- Drawer: `components/ai-bandhu/ai-bandhu-drawer.tsx`
- Colors use Tailwind classes (easily customizable)

## Environment Variables

\`\`\`env
OPENAI_API_KEY=your_openai_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
\`\`\`

## Performance Considerations

- Voice recognition runs entirely client-side (no latency)
- Intent parsing cached for repeated commands
- Lazy-loads Speech API only when drawer opens
- Optimized waveform animation (CSS-based)

## Future Enhancements

- [ ] Multi-language support (Tamil, Telugu, Kannada, etc.)
- [ ] Proactive recommendations based on order history
- [ ] Integration with voice analytics for insights
- [ ] Bulk order templates for seasonal products
- [ ] Audio response from AI Bandhu
- [ ] Offline fallback mode

## Troubleshooting

### Voice Input Not Working
- Ensure HTTPS (Speech API requires secure context)
- Check browser permissions for microphone
- Verify language setting matches system language

### Intent Parsing Errors
- Provide clear, concise commands
- Include quantity numbers explicitly
- Use product names similar to database

### No Cart Updates
- Verify event listener is mounted
- Check browser console for errors
- Ensure Supabase session is active

---

**Status:** ✅ Production Ready
**Last Updated:** 2025-10-24
