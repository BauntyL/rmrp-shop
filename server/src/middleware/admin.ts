import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Не авторизован" });
  }

  if (req.user.role !== "admin" && req.user.role !== "moderator") {
    return res.status(403).json({ error: "Недостаточно прав" });
  }

  next();
}; 