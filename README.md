# Visionz+

A powerful data visualization and analysis platform powered by AI.

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```
   - Update other environment variables as needed

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `NODE_ENV`: Node environment (development/production)

## API Endpoints

### AI Generation

- `POST /api/ai/generate`
  - Generates AI-powered visualizations and analysis
  - Requires valid OpenAI API key
  - Request body:
    ```json
    {
      "prompt": "Your analysis prompt here"
    }
    ```

## Error Handling

The API includes comprehensive error handling for:
- Missing or invalid OpenAI API key
- API quota exceeded
- Invalid requests
- Server errors

## Security Notes

- Never commit your `.env` file
- Keep your OpenAI API key secure
- Use environment variables for all sensitive data
