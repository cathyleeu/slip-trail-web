import { z } from 'zod'
import { RECEIPT_CATEGORIES } from './constants'
import { buildAddressNormalized } from './nomalizedAddress'
import { ChargeType } from '@types'

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
  type: z.enum(ChargeType).optional(),
  label: z.string(),
  amount: z.number(),
})

/**
 * Feeling tag for purchase sentiment tracking
 */
export const feelingTagSchema = z.enum([
  'Necessary',
  'Impulsive',
  'Social',
  'Treat',
  'Routine',
  'Stress',
  'Celebration',
])

/**
 * Schema for parsed receipt data
 */
export const parsedReceiptSchema = z.object({
  vendor: z.string(),
  category: z.enum(RECEIPT_CATEGORIES).catch('other'),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  purchased_at: z.string().nullable().optional(), // ISO date string
  currency: z.string().default('CAD'),
  subtotal: z.number().nullable().optional(),
  total: z.number(),
  raw_text: z.string().nullable().optional(),
  items: z.array(receiptItemSchema).optional(),
  charges: z.array(receiptChargeSchema).optional(),
  feeling: feelingTagSchema.nullable().optional(),
  memo: z.string().nullable().optional(),
})

// Parsing drafts allow unknown values; final-save schemas above remain stricter.
const unknownText = z.string().trim().transform((value) => value || null).nullish().transform((value) => value ?? null)
const unknownNumber = z.number().nullish().transform((value) => value ?? null)
const addressComponentsSchema = z.object({
  unit: unknownText,
  house_number: unknownText,
  road: unknownText,
  neighborhood: unknownText,
  city: unknownText,
  district_or_county: unknownText,
  region: unknownText,
  region_code: unknownText,
  postal_code: unknownText,
  country: unknownText,
  country_code: unknownText,
})

export const receiptDraftSchema = z.object({
  vendor: unknownText,
  category: z.enum(RECEIPT_CATEGORIES).catch('other'),
  address: unknownText,
  address_normalized: z.object({
    raw_address_text: unknownText,
    components: addressComponentsSchema.nullish().transform((value) => value ?? addressComponentsSchema.parse({})),
  }).nullish().transform((value) => buildAddressNormalized(value ?? { components: addressComponentsSchema.parse({}) })),
  phone: unknownText,
  purchased_at: z.iso.datetime({ offset: true }).nullish().transform((value) => value ?? null),
  currency: unknownText.transform((value) => value ?? 'CAD'),
  subtotal: unknownNumber,
  total: unknownNumber,
  items: z.array(z.object({
    name: z.string(),
    quantity: unknownNumber,
    price: unknownNumber,
  })).nullish().transform((value) => value ?? []),
  charges: z.array(z.object({
    type: z.enum(ChargeType),
    label: z.string(),
    amount: unknownNumber,
  })).nullish().transform((value) => value ?? []),
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
  category: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
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
export function parseFormJsonOptional<T>(form: FormData, key: string, schema: z.ZodSchema<T>): T | null {
  const value = form.get(key)
  if (!value || value === 'null') return null
  return parseFormJson(form, key, schema)
}

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
