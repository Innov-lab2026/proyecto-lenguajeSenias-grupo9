import { Request, Response, NextFunction } from 'express'
import { ZodType } from 'zod'

/** Valida `req.body` contra `schema`; en éxito lo reemplaza por los datos ya parseados/coercidos. */
export const validateBody = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message ?? 'Datos inválidos' })
    return
  }

  req.body = result.data
  next()
}
