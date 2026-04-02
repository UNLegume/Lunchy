import { z } from 'zod';

export const createSessionSchema = z.object({
  displayName: z.string().min(1).max(20),
  location: z.string().min(1),
});

export const joinSessionSchema = z.object({
  displayName: z.string().min(1).max(20),
});

export const preferencesSchema = z.object({
  memberId: z.string().min(1),
  allergy: z.array(z.string()),
  category: z.enum(['meat', 'fish', 'other']),
  hungerLevel: z.number().int().min(0).max(10),
  place: z.string().nullable(),
  budget: z.string(),
});

export const voteSchema = z.object({
  candidateId: z.string().min(1),
});

export const voteWithMemberSchema = z.object({
  memberId: z.string().min(1),
  candidateId: z.string().min(1),
});

export const closeSessionSchema = z.object({
  organizerId: z.string().min(1),
});
