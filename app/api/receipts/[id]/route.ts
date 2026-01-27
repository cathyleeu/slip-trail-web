import { withAuth } from '@lib/apiHandler'
import { apiSuccess } from '@lib/apiResponse'
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
      throw new Error(`Failed to fetch receipt: ${error.message}`)
    }

    if (!data) {
      throw new Error('Receipt not found')
    }

    return apiSuccess(data)
  })(req)
}

export async function PATCH(req: Request, { params }: Params) {
  return withAuth(async (req, { user, supabase }) => {
    const { id } = await params
    const body = await req.json()

    // Validate update data with Zod
    const validated = validateSchema(receiptUpdateSchema, body, 'receipt update')
    const { receipt, location } = validated

    if (!receipt && !location) {
      throw new Error('No data to update')
    }

    // Prepare update data
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

    const updateData = Object.fromEntries(
      Object.entries({ ...receipt, ...location }).filter(
        ([key, value]) =>
          value !== undefined &&
          (allowedFields.includes(key as typeof allowedFields[number]) || key === 'latitude' || key === 'longitude')
      )
    )

    const { data, error } = await supabase
      .from('receipts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update receipt: ${error.message}`)
    }

    if (!data) {
      throw new Error('Receipt not found')
    }

    return apiSuccess(data)
  })(req)
}

export async function DELETE(req: Request, { params }: Params) {
  return withAuth(async (req, { user, supabase }) => {
    const { id } = await params

    const { error } = await supabase.from('receipts').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to delete receipt: ${error.message}`)
    }

    return apiSuccess({ success: true })
  })(req)
}
