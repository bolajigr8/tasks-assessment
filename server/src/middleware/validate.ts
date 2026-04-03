import { Request, Response, NextFunction } from 'express'
import { validationResult, FieldValidationError } from 'express-validator'

// This sits after any express-validator chain in a route.
// If there are errors, it short-circuits with a 400 before the controller runs.
export function validate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    res.status(400).json({
      status: 'fail',
      errors: errors.array().map((e) => ({
        // e.path holds the actual field name (e.g. "email", "title").
        // e.type is the error category ("field", "alternative_grouped", etc.)
        // and is not useful to the client.
        field: (e as FieldValidationError).path ?? e.type,
        message: e.msg,
      })),
    })
    return
  }

  next()
}
