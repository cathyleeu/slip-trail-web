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

    VENDOR RULES (MUST PRODUCE A NON-NULL VENDOR WHEN POSSIBLE):
      •	vendor should be a human-facing business/store name.
      •	vendor must NOT be null if the OCR contains ANY plausible business-name-like text.
      •	Only use null if the OCR contains no plausible business name at all.

    VENDOR CANDIDATE SEARCH (DETERMINISTIC):
      •	Scan the first 12 non-empty lines of OCR for vendor candidates.
      •	A candidate line is any line that:
      •	contains at least 2 letters (A–Z) AND
      •	is NOT primarily numeric AND
      •	is NOT an excluded/generic line (see EXCLUSIONS).
      •	Prefer the earliest candidate line(s) near the top.

    VENDOR ASSEMBLY:
      •	If there are multiple short adjacent lines that look like the name split across lines (e.g., “OEB” on one line, “Breakfast” on next, “Co.” on next), combine them into one vendor name separated by spaces.
      •	Keep the combined name concise: at most 6 words.
      •	Remove trailing punctuation and extra symbols.

    VENDOR EXCLUSIONS (NEVER USE AS VENDOR):
      •	Any email address or line containing ‘@’
      •	Any website/domain line containing ‘.com’, ‘.ca’, ‘.net’, ‘.org’, ‘www.’
      •	Payment processors / platforms / generic tech words:
    “square”, “squareup”, “clover”, “toast”, “moneris”, “verifone”, “ingenico”, “shopify”, “stripe”, “paypal”, “visa”, “mastercard”, “amex”, “interac”
      •	Generic receipt words (case-insensitive):
    “receipt”, “order”, “invoice”, “tax invoice”, “table”, “server”, “employee”, “cashier”, “terminal”, “merchant”, “store”, “thank”, “thanks”, “welcome”, “please”, “balance due”, “amount due”, “total”, “subtotal”, “gst”, “pst”, “hst”, “tax”, “tip”, “gratuity”

    VENDOR FALLBACK (IF STILL UNCERTAIN):
      •	If no candidate found in the first 12 lines, search the entire OCR for the first line that looks like a proper name (same candidate rules).
      •	If still none found, set vendor to null.

    IMPORTANT:
      •	NEVER set vendor to an email handle or domain token (e.g., “eatoeb”).
      •	If the only brand hint is found in an email/domain (e.g., “event@eatoeb.com”) BUT there is nearby name-like text anywhere (e.g., “Breakfast Co.”), vendor must be that name-like text rather than the domain.

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
