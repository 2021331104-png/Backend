import app from "../app.js";

// Vercel serverless entrypoint; Express handles routing
export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;
