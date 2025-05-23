import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper para tratar funções assíncronas em controllers do Express
 */
// export const asyncHandler = (
//   handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
// ) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     handler(req, res, next).catch(next);
//   };
// };


const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};