import * as z from "zod";

export const sendMessageSchema = z.object({
  message: z.string().min(1),
  tenantId: z.string().min(1),
  existingChatId: z.string().min(1).optional(),
});
export const getMessageSchema = z.object({
  chatId: z.string().min(1),
});

export const deleteChatSchema = z.object({
  chatId: z.string().min(1),
});
