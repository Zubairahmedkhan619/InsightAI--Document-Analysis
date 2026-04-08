# InsightAI--Document-Analysis


InsightAI is a powerful web application that allows users to analyze documents instantly using advanced AI. Upload files, paste links, or analyze shared URLs to get key findings and actionable insights.

## Features

- **Document Analysis**: AI-powered analysis of various document types (PDFs, text files, web pages)
- **Multiple Input Methods**: Upload files directly or analyze content from URLs
- **Real-time Processing**: Live status updates during analysis
- **Multilingual Support**: Output insights in multiple languages
- **Analysis History**: Track and review past analyses
- **Credits System**: Manage usage with a credit-based system
- **PDF Export**: Generate and download analysis results as PDF
- **User Authentication**: Secure sign-in with Clerk
- **Subscription Management**: Stripe-powered subscriptions and payments

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Authentication**: Clerk
- **Payments**: Stripe
- **File Storage**: AWS S3
- **AI Processing**: Groq API
- **UI Components**: Radix UI, Framer Motion, Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account
- Stripe account
- AWS S3 bucket

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/insightai.git
cd insightai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# CLOUDFLARE R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=


# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region

# AI API
GROQ_API_KEY=your_groq_api_key

# RESEND
RESEND_API_KEY=

```

4. Set up the database:
Run the SQL schema from `supabase/schema.sql` in your Supabase dashboard.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up/Sign In**: Create an account or sign in to access the application
2. **Upload Document**: Use the upload zone to select a file or paste a URL
3. **Configure Analysis**: Choose analysis type and output language
4. **Analyze**: Click analyze to process the document
5. **View Results**: Review the AI-generated insights and findings
6. **Download**: Export results as PDF (Pro feature)
7. **Manage Credits**: Monitor usage and upgrade for more credits

## API Routes

- `POST /api/upload` - Upload files to S3
- `POST /api/jobs` - Create analysis jobs
- `GET /api/jobs` - Get analysis history
- `GET /api/jobs/[id]` - Get specific job details
- `GET /api/credits` - Get user credits
- `POST /api/detect-language` - Detect document language
- `POST /api/stripe/create-checkout` - Create Stripe checkout sessions
- `POST /api/stripe/webhooks/*` - Handle Stripe webhooks

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── ...
├── components/            # React components
│   ├── analysis/          # Analysis-related components
│   ├── landing/           # Landing page components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase client setup
│   └── utils.ts           # Helper functions
└── middleware.ts          # Next.js middleware
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

This project is private and proprietary.

## Built with

- Next.js
- Supabase
- Groq AI
- Clerk Authentication
- Stripe Payments
- AWS S3


