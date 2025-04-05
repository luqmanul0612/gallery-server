import express from "express";
import path from "path";
import dotenv from "dotenv";
import routes from "./src/routes";
import cors from "cors";

dotenv.config();

export const corsOptions = { origin: "*" };

const main = async () => {
  const app = express();

  app.use(express.json({ limit: 1.2 * 1024 * 1024 }));
  app.use(cors(corsOptions));
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", routes);

  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get(/(.*)/, (_, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });

  const PORT = process.env.PORT || 3210;
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
};

main().catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});
