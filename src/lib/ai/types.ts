import { z } from "zod";

/** A beer extracted from a menu (mirrors the `menu_items` table). */
export const MenuItemSchema = z.object({
  name: z.string().min(1),
  style: z.string().default(""),
  abv: z.number().nullable().default(null),
  description: z.string().nullable().default(null),
  selling_points: z.string().nullable().default(null),
});
export type MenuItem = z.infer<typeof MenuItemSchema>;

export const ExtractionResultSchema = z.object({
  items: z.array(MenuItemSchema),
});
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

/** A generated quiz question (mirrors the `questions` table). */
export const QuestionSchema = z.object({
  /** 0-based index into `items` this question is about; null = menu-wide. */
  item_index: z.number().int().nullable().default(null),
  category: z.enum(["recall", "selling", "scenario"]),
  prompt: z.string().min(1),
  choices: z.array(z.string().min(1)).min(2).max(5),
  correct_index: z.number().int().min(0),
  explanation: z.string().min(1),
});
export type Question = z.infer<typeof QuestionSchema>;

export const GenerationResultSchema = z.object({
  questions: z.array(QuestionSchema),
});
export type GenerationResult = z.infer<typeof GenerationResultSchema>;
