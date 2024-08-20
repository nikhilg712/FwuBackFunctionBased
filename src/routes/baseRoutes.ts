import { NextFunction, Request, Response, Router } from "express";

const baseRouter = Router();
// Initialize routes function
const initializeRoutes = (router: Router) => {
  const path = "/";

  // // Define routes
  router.get(`${path}`, (request: Request, response: Response) => {
    response.send("Base routes");
  });
};

initializeRoutes(baseRouter);

export default baseRouter;
