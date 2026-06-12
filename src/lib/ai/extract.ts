import { chatJSON } from "./client";
import { VISION_MODEL, DEFAULT_MODEL } from "./config";
import {
  EXTRACTION_SYSTEM,
  extractionUserText,
  EXTRACTION_IMAGE_INSTRUCTION,
} from "./prompts";
import { ExtractionResultSchema, type MenuItem } from "./types";

/**
 * Call 1 — Extraction. Turns pasted text OR a menu photo into structured
 * menu items. `model` overrides the configured default (e.g. from the admin
 * AI-settings picker while testing).
 */
export async function extractFromText(
  rawText: string,
  model: string = DEFAULT_MODEL
): Promise<MenuItem[]> {
  const result = await chatJSON<unknown>({
    model,
    system: EXTRACTION_SYSTEM,
    user: extractionUserText(rawText),
    temperature: 0.1,
  });
  return ExtractionResultSchema.parse(result).items;
}

/**
 * `imageDataUrl` is a data: URL (e.g. "data:image/jpeg;base64,...") or a public
 * image URL. Requires a vision-capable model.
 */
export async function extractFromImage(
  imageDataUrl: string,
  model: string = VISION_MODEL
): Promise<MenuItem[]> {
  const result = await chatJSON<unknown>({
    model,
    system: EXTRACTION_SYSTEM,
    user: [
      { type: "text", text: EXTRACTION_IMAGE_INSTRUCTION },
      { type: "image_url", image_url: { url: imageDataUrl } },
    ],
    temperature: 0.1,
  });
  return ExtractionResultSchema.parse(result).items;
}
