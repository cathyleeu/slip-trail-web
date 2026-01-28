import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
import { ERROR_MESSAGES } from '@lib/constants'
import { receiptUpdateSchema, validateSchema } from '@lib/validation'

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, { params }: Params) {
  return withAuth(async (req, { user, supabase }) => {
    const { id } = await params

    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      throw new Error(`${ERROR_MESSAGES.FAILED_TO_FETCH_RECEIPT}: ${error.message}`)
    }

    if (!data) {
      throw new Error(ERROR_MESSAGES.RECEIPT_NOT_FOUND)
    }

    return apiSuccess(data)
  })(req)
}

/**
 * Prepare receipt update data by filtering allowed fields
 */
function prepareUpdateData(
  receipt?: Record<string, unknown>,
  location?: { latitude: number; longitude: number } | null
): Record<string, unknown> {
  const allowedFields = [
    'vendor',
    'address',
    'phone',
    'purchased_at',
    'currency',
    'subtotal',
    'total',
    'raw_text',
    'items',
    'charges',
  ] as const

  return Object.fromEntries(
    Object.entries({ ...receipt, ...location }).filter(
      ([key, value]) =>
        value !== undefined &&
        (allowedFields.includes(key as (typeof allowedFields)[number]) ||
          key === 'latitude' ||
          key === 'longitude')
    )
  )
}

export async function PATCH(req: Request, { params }: Params) {
  return withAuth(async (req, { user, supabase }) => {
    const { id } = await params
    const body = await req.json()

    // Validate update data with Zod
    const validated = validateSchema(receiptUpdateSchema, body, 'receipt update')
    const { receipt, location } = validated

    if (!receipt && !location) {
      throw new Error(ERROR_MESSAGES.NO_DATA_TO_UPDATE)
    }

    const updateData = prepareUpdateData(receipt, location)

    const { data, error } = await supabase
      .from('receipts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`${ERROR_MESSAGES.FAILED_TO_UPDATE_RECEIPT}: ${error.message}`)
    }

    if (!data) {
      throw new Error(ERROR_MESSAGES.RECEIPT_NOT_FOUND)
    }

    return apiSuccess(data)
  })(req)
}

export async function DELETE(req: Request, { params }: Params) {
  return withAuth(async (req, { user, supabase }) => {
    const { id } = await params

    const { error } = await supabase.from('receipts').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      throw new Error(`${ERROR_MESSAGES.FAILED_TO_DELETE_RECEIPT}: ${error.message}`)
    }

    return apiSuccess({ success: true })
  })(req)
}
