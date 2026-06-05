import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface QuizLead {
  id?: string;
  name: string;
  position: string;
  company: string;
  email: string;
  whatsapp: string;
  created_at?: string;
}

export interface QuizResponse {
  id?: string;
  lead_id: string;
  answers: Record<string, number>;
  raw_score: number;
  calculated_level: number;
  final_level: number;
  alerts: string[];
  created_at?: string;
}

export async function saveQuizResult(
  lead: Omit<QuizLead, 'id' | 'created_at'>,
  response: Omit<QuizResponse, 'id' | 'lead_id' | 'created_at'>
): Promise<{ leadId: string; responseId: string } | null> {
  const { data: leadData, error: leadError } = await supabase
    .from('quiz_leads')
    .insert(lead)
    .select('id')
    .single();

  if (leadError || !leadData) {
    console.error('Error saving lead:', leadError);
    return null;
  }

  const { data: responseData, error: responseError } = await supabase
    .from('quiz_responses')
    .insert({
      ...response,
      lead_id: leadData.id,
    })
    .select('id')
    .single();

  if (responseError || !responseData) {
    console.error('Error saving response:', responseError);
    return null;
  }

  return { leadId: leadData.id, responseId: responseData.id };
}
