import Groq from 'groq-sdk'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function parseReceipt(text: string) {
  const prompt = `
    You are an expert receipt parsing engine for an expense-tracking app.
    Convert noisy OCR text into clean, structured JSON.

    OUTPUT RULES (HARD):
    • Return valid JSON only. No explanations, no markdown, no extra text.
    • Always include every key in the required schema.
    • If a value is missing or unclear, use null (except charges.amount; see charges rules).
    • Preserve the original OCR text under "raw_text" EXACTLY as provided.
    • raw_text MUST be the exact text between RAW_TEXT_START and RAW_TEXT_END below.
    • raw_text must be a STRING value, never a JSON key.
    • Do NOT add/remove/reorder/normalize/pretty-print raw_text.
    • Do NOT make raw_text empty if any OCR text exists.

    GENERAL PARSING PRINCIPLES:
    • Prefer explicit information on the receipt over inference.
    • Do not hallucinate values that are not supported by the OCR.
    • Normalize numbers to decimals (e.g., 1.23). Remove currency symbols.
    • Default currency to "CAD" if unclear.

    ────────────────────────────────
    VENDOR RULES (MUST PRODUCE A NON-NULL VENDOR WHEN POSSIBLE)
    ────────────────────────────────
    • vendor should be a human-facing business/store name.
    • vendor must NOT be null if the OCR contains ANY plausible business-name-like text.
    • Only use null if the OCR contains no plausible business name at all.

    VENDOR CANDIDATE SEARCH (DETERMINISTIC):
    • Scan the first 12 non-empty lines of OCR for vendor candidates.
    • A candidate line is any line that:
      - contains at least 2 letters (A-Z) AND
      - is NOT primarily numeric AND
      - is NOT an excluded/generic line (see EXCLUSIONS).
    • Prefer the earliest candidate line(s) near the top.

    VENDOR ASSEMBLY:
    • If multiple short adjacent lines look like a name split across lines, combine with spaces.
    • Keep it concise: at most 6 words.
    • Remove trailing punctuation and extra symbols.

    VENDOR EXCLUSIONS (NEVER USE AS VENDOR):
    • Any email address or line containing '@'
    • Any website/domain line containing '.com', '.ca', '.net', '.org', 'www.'
    • Payment processors / platforms / generic tech words:
      “square”, “squareup”, “clover”, “toast”, “moneris”, “verifone”, “ingenico”,
      “shopify”, “stripe”, “paypal”, “visa”, “mastercard”, “amex”, “interac”
    • Generic receipt words (case-insensitive):
      “receipt”, “order”, “invoice”, “tax invoice”, “table”, “server”, “employee”, “cashier”,
      “terminal”, “merchant”, “store”, “thank”, “thanks”, “welcome”, “please”,
      “balance due”, “amount due”, “total”, “subtotal”, “gst”, “pst”, “hst”, “tax”, “tip”, “gratuity”

    VENDOR FALLBACK (IF STILL UNCERTAIN):
    • If no candidate found in the first 12 lines, search the entire OCR for the first proper-name-like line.
    • If still none found, set vendor to null.
    • NEVER set vendor to an email handle or domain token (e.g., “eatoeb”).

    ────────────────────────────────
    ADDRESS & PHONE
    ────────────────────────────────
    ADDRESS (HUMAN-FACING):
    • Extract address if present.
    • "address" should be one string combining street/city/region/postal/country if available.
    • If address is too fragmentary or unclear, set address = null.

    PHONE:
    • Extract phone if present.
    • Phone should be a string as it appears.

    ────────────────────────────────
    ADDRESS NORMALIZATION (SEARCH-FRIENDLY)
    ────────────────────────────────
    You MUST ALSO output "address_normalized" using the schema below.

    GOAL:
    • Produce a geocoding-friendly normalized address query plus alternates for retry.
    • Do NOT guess missing parts. Do NOT hallucinate.

    DETERMINISM (HARD):
    • For the same raw_address_text, you MUST produce the exact same output every time.
    • Use a fixed formatting rule:
      - region must be returned without periods (e.g., "B.C." -> "BC") when region is 2-3 letters with dots.
      - postal_code must preserve original casing unless it matches a known pattern with high confidence.
    •	alternates MUST follow the exact ALTERNATES section below (same order, no extra patterns).

    ADDRESS_NORMALIZED SCHEMA:
    {
      "raw_address_text": string,
      "components": {
        "unit": string | null,
        "house_number": string | null,
        "road": string | null,
        "neighborhood": string | null,
        "city": string | null,
        "district_or_county": string | null,
        "region": string | null,
        "region_code": string | null,
        "postal_code": string | null,
        "country": string | null,
        "country_code": string | null
      },
      "query": string | null,
      "alternates": string[],
      "quality": "high" | "medium" | "low",
      "notes": string | null
    }

    HOW TO SET raw_address_text:
    • If you found any address-like text on the receipt, set raw_address_text to that extracted raw address text (may include commas/spaces).
    • If no address-like text exists, set raw_address_text to "" (empty string).

    COMPONENT EXTRACTION RULES:
    • Extract components only if explicitly supported by OCR.
    • unit examples: "Unit 2", "Apt 5", "Suite 300", "#12", "2-1425"
    • house_number: number token before road if present.
    • road: street name + type if present (e.g., "Store St", "Main Street").
    • city: city/town if present.
    • region/region_code: state/province/region as printed. If clearly an abbreviation (e.g., CA, BC, NY), put it in region_code; else use region.
    • postal_code: keep as printed; only apply minimal casing/spacing when clearly identifiable (e.g., US ZIP, UK postcode, Canada postal).
    • country/country_code: ONLY if explicitly present OR uniquely implied with very high confidence (otherwise null).

    QUERY OUTPUT FORMAT (HARD):
    • query MUST be in this exact format:
      "{street_part}, {city_part}, {region_part}"
    • street_part MUST be:
      - If both house_number and road exist: "{house_number} {road}"
      - Else if road exists: "{road}"
      - Else: null (and then query must be null)
    • city_part MUST be city if present, otherwise omit it.
    • region_part MUST prefer region_code if present, else region if present, otherwise omit it.
    • query MUST NOT include postal_code.
    • query MUST NOT include country or country_code.
    • query MUST use commas exactly as separators between parts.
    • If city_part is omitted, query MUST be exactly "{street_part}, {region_part}" (single comma).
    • If only one usable part exists, set query=null.

    ALTERNATES (DETERMINISTIC + ORDERED):
    • alternates MUST be generated in this exact order, and MUST be unique:
      1) "{street_part}, {city_part}" (drop region_part if it exists)
      2) "{road}, {city_part}, {region_part}" (drop house_number if it exists)
    • alternates MUST NOT include postal_code.
    • alternates MUST NOT include country/country_code.
    • If query is null, alternates MUST be [].
    • Do not add any other alternates beyond these rules.

    REGION DOT STRIP (HARD):
    • If region looks like a short abbreviation with dots (e.g., "B.C.", "N.Y."), remove dots and set it as region_code ("BC", "NY").
    • In that case set region = null.

    QUALITY:
    • high: street_part AND city_part AND region_part are present
    • medium: any two of (street_part, city_part, region_part) are present
    • low: otherwise

    notes:
    • Use notes only to explain uncertainty very briefly (e.g., "postal code unclear", "multiple city candidates"). Else null.

    ────────────────────────────────
    DATE/TIME
    ────────────────────────────────
    • Extract purchase date and time if present.
    • Convert into ISO 8601 timestamp under "purchased_at".
    • If timezone is not shown, assume America/Vancouver.
    • If date present but time missing, use "T00:00:00-08:00".
    • If missing, set purchased_at to null.

    ────────────────────────────────
    LINE ITEMS
    ────────────────────────────────
    • Extract items into "items": { name, quantity, price }
    • quantity defaults to 1 if missing.
    • price is unit price.
    • If two numbers on same line, treat larger as unit price.
    • Ignore non-item lines.

    ────────────────────────────────
    CHARGES (MAKE ROBUST, GENERIC)
    ────────────────────────────────
    • "charges" must contain ALL detected taxes, tips, discounts, and fees as objects.
    • Charge object: { "type": one of ["tax","tip","discount","fee"], "label": original label, "amount": number }

    CHARGE SIGNALS (case-insensitive):
    • Tax: GST, PST, HST, QST, TAX, VAT
    • Tip: TIP, GRATUITY, GRAT, SERVICE TIP
    • Fee: FEE, SERVICE CHARGE, SURCHARGE, DELIVERY, BAG FEE, BOTTLE DEPOSIT, ENV FEE, CARD FEE, PROCESSING FEE
    • Discount: DISCOUNT, PROMO, COUPON, SAVINGS, MEMBER DISCOUNT, REWARD
    • Percent sign (%) near a money value counts as signal.

    NON-EMPTY GUARANTEE (SAFE VERSION):
    • If NO charge signals exist, charges MUST be [].
    • If ANY charge signal exists, charges MUST NOT be empty.
    • If signals exist but no amounts can be confidently extracted, include ONE fallback:
      { "type": "tax", "label": "Unspecified", "amount": 0.00 }

    AMOUNT RULES:
    • Taxes/tips/fees positive numbers.
    • Discounts negative numbers.
    • Avoid duplicates; prefer cleanest/most explicit occurrence.

    TOTALS:
    • Extract subtotal if present.
    • Extract total if present (final amount).
    • Never fabricate values.

    INTERNAL CONSISTENCY CHECK (DO NOT EXPLAIN):
    • If subtotal and total exist and you extracted charges, ensure subtotal + sum(charges) ≈ total (±0.02).
    • Choose amounts that best fit this arithmetic without inventing numbers.

    REQUIRED JSON SCHEMA (RETURN EXACT KEYS):
    {
      "vendor": string | null,
      "address": string | null,
      "address_normalized": {
        "raw_address_text": string,
        "components": {
          "unit": string | null,
          "house_number": string | null,
          "road": string | null,
          "neighborhood": string | null,
          "city": string | null,
          "district_or_county": string | null,
          "region": string | null,
          "region_code": string | null,
          "postal_code": string | null,
          "country": string | null,
          "country_code": string | null
        },
        "query": string | null,
        "alternates": string[],
        "quality": "high" | "medium" | "low",
        "notes": string | null
      },
      "phone": string | null,
      "purchased_at": string | null,
      "items": [
        { "name": string, "quantity": number, "price": number }
      ],
      "currency": string | null,
      "subtotal": number | null,
      "charges": [
        { "type": string, "label": string, "amount": number }
      ],
      "total": number | null,
      "raw_text": string
    }

    RAW_TEXT_START
    ${text}
    RAW_TEXT_END
    `

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return completion.choices[0].message.content
}
