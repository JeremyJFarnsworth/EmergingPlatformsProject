Install outside dependencies
LM Studio: https://lmstudio.ai
Install the app
Download the Model: LM Gemma 3 4b
Download the model: Nomic Embed Text v1.5
Go to the developer panel in the side bar
Load both models
Start the server

Pinecone: https://www.pinecone.io
Push the Start Building Button
Login/create account
COPY THE API KEY IT GIVES YOU
create an index
Copy index name
Copy index host

git clone https://github.com/JeremyJFarnsworth/EmergingPlatformsProject

npm install

create a .env file that holds api key, index name, index host formatted like:
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
PINECONE_INDEX_HOST=

npm run dev

if you get this error:
Error [PineconeBadRequestError]: Forbidden
at async POST (app\api\upload\route.ts:56:3)
54 | const batch = vectors.slice(i, i + batchSize);
55 |

> 56 | await pineconeIndex.upsert({

     |   ^

57 | records: batch,
58 | });
59 | } {
cause: undefined

first double check your api key,
then if it still isn't working. you can add it here
replace process.env.PINECONE_API_KEY! with "YOUR_API_KEY"
const pinecone = new Pinecone({
apiKey: process.env.PINECONE_API_KEY!, // 🔴 REQUIRED
});

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
