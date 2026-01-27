import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import userRoutes from "./routes/user.routes.js";
import slotRoutes from "./routes/slot.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();
const swaggerDoc = YAML.load("./docs/swagger.yaml");

app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use("/users", userRoutes);
app.use("/slots", slotRoutes);
app.use("/bookings", bookingRoutes);

app.use(errorHandler);

export default app;
