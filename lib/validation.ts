import { z } from 'zod'

// ============ Receipt Schemas ============

/**
 * Schema for receipt items
 */
export const receiptItemSchema = z.object({
  name: z.string(),
  quantity: z.number().optional(),
  price: z.number().optional(),
})

/**
 * Schema for receipt charges (tax, tip, etc.)
 */
export const receiptChargeSchema = z.object({
  label: z.string(),
  amount: z.number(),
})

/**
 * Schema for parsed receipt data
 */
export const parsedReceiptSchema = z.object({
  vendor: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  purchased_at: z.string().optional(), // ISO date string
  currency: z.string().default('CAD'),
  subtotal: z.number().optional(),
  total: z.number(),
  raw_text: z.string().optional(),
  items: z.array(receiptItemSchema).optional(),
  charges: z.array(receiptChargeSchema).optional(),
})

// ============ Location Schemas ============

/**
 * Schema for geographic location
 */
export const placeSchema = z.object({
  osm_ref: z.string().nullable().optional(),
  name: z.string().nullable(),
  address: z.string().nullable(),
  normalized_address: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lon: z.number().nullable().optional(),
})

// ============ Form Data Schemas ============

/**
 * Schema for receipt submission with image
 */
export const receiptSubmissionSchema = z.object({
  receipt: parsedReceiptSchema,
  place: placeSchema,
})

/**
 * Schema for receipt update
 */
export const receiptUpdateSchema = z.object({
  receipt: parsedReceiptSchema.partial().optional(),
  location: z
    .object({
      lat: z.number(),
      lon: z.number(),
    })
    .nullable()
    .optional(),
})

// ============ Query Parameter Schemas ============

/**
 * Schema for period query parameter
 */
export const periodSchema = z.enum(['last7', 'last30', 'ytd']).default('last30')

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
})

// ============ Helper Functions ============

/**
 * Safely parse and validate data with Zod schema
 * Throws descriptive error if validation fails
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown, context?: string): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    throw new Error(`Validation error${context ? ` in ${context}` : ''}: ${errors}`)
  }

  return result.data
}

/**
 * Parse JSON from FormData with validation
 */
export function parseFormJson<T>(form: FormData, key: string, schema: z.ZodSchema<T>): T {
  const value = form.get(key)

  if (typeof value !== 'string') {
    throw new Error(`Field "${key}" is required and must be a string`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error(`Invalid JSON in field "${key}"`)
  }

  return validateSchema(schema, parsed, key)
}

/**
 * Validate query parameters from URLSearchParams
 */
export function parseQueryParams<T>(searchParams: URLSearchParams, schema: z.ZodSchema<T>): T {
  const obj = Object.fromEntries(searchParams.entries())
  return validateSchema(schema, obj, 'query parameters')
}

// ============ Type Exports ============

export type ParsedReceipt = z.infer<typeof parsedReceiptSchema>
export type Place = z.infer<typeof placeSchema>
export type ReceiptItem = z.infer<typeof receiptItemSchema>
export type ReceiptCharge = z.infer<typeof receiptChargeSchema>
export type ReceiptSubmission = z.infer<typeof receiptSubmissionSchema>
export type ReceiptUpdate = z.infer<typeof receiptUpdateSchema>
export type Period = z.infer<typeof periodSchema>
export type Pagination = z.infer<typeof paginationSchema>
