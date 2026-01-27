import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import yaml from "yaml";

/**
 * Loads swagger.yaml and exposes Swagger UI at /docs
 */
export const setupSwagger = (app) => {
  const swaggerPath = path.join(process.cwd(), "docs", "swagger.yaml");

  const file = fs.readFileSync(swaggerPath, "utf8");
  const swaggerDocument = yaml.parse(file);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
