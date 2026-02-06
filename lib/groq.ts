import Groq from 'groq-sdk'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function parseReceipt(text: string) {
  const prompt = `
    You are an expert receipt parsing engine for a Canadian expense-tracking app.
    Convert noisy OCR text into clean, structured JSON.

    OUTPUT RULES (HARD):
      •	Return valid JSON only. No explanations, no markdown, no extra text.
      •	Always include every key in the required schema.
      •	If a value is missing or unclear, use null (except charges.amount; see charges rules).
      •	Preserve the original OCR text under “raw_text” EXACTLY as provided.
      •	raw_text must be a STRING value, never a JSON key.
      •	Do NOT add/remove/reorder/normalize/pretty-print raw_text.

    GENERAL PARSING PRINCIPLES:
      •	Prefer explicit information on the receipt over inference.
      •	Do not hallucinate values that are not supported by the OCR.
      •	Normalize numbers to decimals (e.g., 1.23). Remove currency symbols.
      •	Default currency to “CAD” if unclear.

    VENDOR RULES (PREVENT DOMAIN/EMAIL VENDOR BUG):
      •	Vendor must be a human-facing business name, NOT an email username or domain.
      •	If an email or website appears (e.g., “orders@vendor.com”, “vendor.com”), NEVER set vendor to the email handle or domain (e.g., “vendor”, “gmail”, “square”, “clover”, “toast”, “shopify”, “stripe”).
      •	Choose vendor from the most prominent header-like text near the top, or a clear store/restaurant name line.
      •	If multiple candidates exist, pick the one that looks like a proper business name (capitalized words, brand-like phrase) rather than generic words (“Receipt”, “Order”, “Thank you”, “Terminal”, “Server”).
      •	If vendor cannot be confidently identified, set vendor to null (better null than wrong).

    ADDRESS & PHONE:
      •	Extract address and phone if present.
      •	Address should be one string combining street/city/province/postal if available.
      •	Phone should be a string as it appears (digits and separators are fine).

    DATE/TIME:
      •	Extract purchase date and time if present.
      •	Convert into ISO 8601 timestamp under “purchased_at”.
      •	If timezone is not shown, assume America/Vancouver.
      •	If date is present but time missing, use “T00:00:00-08:00” as time.
      •	If both missing, set purchased_at to null.

    LINE ITEMS:
      •	Extract purchased items into “items”.
      •	Each item: { name, quantity, price }
      •	quantity defaults to 1 if missing.
      •	price is the unit price for that line item.
      •	If two numbers appear on the same line, treat the larger number as the unit price.
      •	Ignore non-item lines (headers, table numbers, employee/server, marketing text).

    CHARGES (MAKE ROBUST, GENERIC):
      •	“charges” must contain ALL detected taxes, tips, discounts, and fees as objects.
      •	A charge object: { “type”: one of [“tax”,“tip”,“discount”,“fee”], “label”: original label, “amount”: number }

    CHARGE DETECTION (SIGNALS):
    Treat any of these as a charge signal if they appear anywhere (case-insensitive):
      •	Tax terms: GST, PST, HST, QST, TAX, VAT
      •	Tip terms: TIP, GRATUITY, GRAT, SERVICE TIP
      •	Fee terms: FEE, SERVICE CHARGE, SURCHARGE, DELIVERY, BAG FEE, BOTTLE DEPOSIT, ENV FEE, CARD FEE, PROCESSING FEE
      •	Discount terms: DISCOUNT, PROMO, COUPON, SAVINGS, MEMBER DISCOUNT, REWARD
    Also treat a percent sign (%) near a money value as a possible tax/fee signal.

    CHARGES NON-EMPTY GUARANTEE (SAFE VERSION):
      •	If NO charge signals are present anywhere in the OCR, charges MUST be [].
      •	If ANY charge signal is present anywhere in the OCR, charges MUST NOT be empty.
      •	If you can extract an amount for at least one charge, include it.
      •	If signals exist but you cannot confidently extract any charge amounts, include ONE fallback charge:
    { “type”: “tax”, “label”: “Unspecified”, “amount”: 0.00 }
    This prevents empty charges while avoiding inventing money.

    CHARGE AMOUNT RULES:
      •	Use the numeric amount next to/near the label when present.
      •	Taxes/tips/fees are positive numbers.
      •	Discounts must be negative numbers (e.g., -2.00) even if printed as “2.00” or “(2.00)”.
      •	Do not double-count: if the same charge appears multiple times, prefer the most explicit/clean occurrence.

    TOTALS:
      •	Extract subtotal if present (labels: SUBTOTAL, SUB TOTAL).
      •	Extract total if present (labels: TOTAL, AMOUNT DUE, BALANCE DUE, GRAND TOTAL).
      •	total should be the final amount due/paid.

    INTERNAL CONSISTENCY CHECK (DO NOT EXPLAIN):
      •	If subtotal and total exist and you extracted some charges, ensure subtotal + sum(charges amounts) is close to total (tolerance 0.02).
      •	If multiple candidates exist for a charge amount, choose the one that best fits this arithmetic.
      •	Never fabricate new amounts purely to make the math work.

    REQUIRED JSON SCHEMA (RETURN EXACT KEYS):
    {
    “vendor”: string | null,
    “address”: string | null,
    “phone”: string | null,
    “purchased_at”: string | null,
    “items”: [
    { “name”: string, “quantity”: number, “price”: number }
    ],
    “currency”: string | null,
    “subtotal”: number | null,
    “charges”: [
    { “type”: string, “label”: string, “amount”: number }
    ],
    “total”: number | null,
    “raw_text”: string
    }

    Receipt OCR Text:
    “””
    ${text}
    “””
    `

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return completion.choices[0].message.content
}
