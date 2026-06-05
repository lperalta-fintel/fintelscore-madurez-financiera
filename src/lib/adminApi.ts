import { supabase } from './supabase';
import { normalizeRawScore } from '../utils/scoring';

export interface Submission {
  id: string;
  lead_id: string;
  answers: Record<string, number>;
  raw_score: number;
  calculated_level: number;
  final_level: number;
  alerts: string[];
  created_at: string;
  lead: {
    id: string;
    name: string;
    position: string;
    company: string;
    email: string;
    whatsapp: string;
    client_id: string | null;
    created_at: string;
  };
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  created_at: string;
}

export interface QuestionConfig {
  id: string;
  question_text: string;
  category: string;
  options: string[];
  order_num: number;
  is_active: boolean;
  created_at: string;
}

export interface AnchorRule {
  id: string;
  name: string;
  description: string;
  config: {
    question_id: number;
    trigger_value?: number;
    trigger_value_not?: number;
    min_calculated_level: number;
    max_level: number;
    alert_message: string;
  };
  is_active: boolean;
  created_at: string;
}

export async function getSubmissions(page = 1, limit = 10, search = ''): Promise<{ data: Submission[]; count: number }> {
  let query = supabase
    .from('quiz_responses')
    .select(`
      id,
      lead_id,
      answers,
      raw_score,
      calculated_level,
      final_level,
      alerts,
      created_at,
      lead:quiz_leads(id, name, position, company, email, whatsapp, client_id, created_at)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%`, { referencedTable: 'quiz_leads' });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching submissions:', error);
    return { data: [], count: 0 };
  }

  const transformed = (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    lead: Array.isArray(item.lead) ? item.lead[0] : item.lead,
  }));
  return { data: transformed as Submission[], count: count || 0 };
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const { data, error } = await supabase
    .from('quiz_responses')
    .select(`
      id,
      lead_id,
      answers,
      raw_score,
      calculated_level,
      final_level,
      alerts,
      created_at,
      lead:quiz_leads(id, name, position, company, email, whatsapp, client_id, created_at)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching submission:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  const transformed = {
    ...data,
    lead: Array.isArray(data.lead) ? data.lead[0] : data.lead,
  };
  return transformed as Submission;
}

export async function deleteSubmission(id: string, leadId: string): Promise<boolean> {
  const { error: responseError } = await supabase
    .from('quiz_responses')
    .delete()
    .eq('id', id);

  if (responseError) {
    console.error('Error deleting response:', responseError);
    return false;
  }

  const { error: leadError } = await supabase
    .from('quiz_leads')
    .delete()
    .eq('id', leadId);

  if (leadError) {
    console.error('Error deleting lead:', leadError);
  }

  return true;
}

export async function linkSubmissionToClient(leadId: string, clientId: string | null): Promise<boolean> {
  const { error } = await supabase
    .from('quiz_leads')
    .update({ client_id: clientId })
    .eq('id', leadId);

  if (error) {
    console.error('Error linking submission:', error);
    return false;
  }

  return true;
}

export async function getDashboardStats(): Promise<{
  totalTests: number;
  averageScore: number;
  testsThisMonth: number;
  totalClients: number;
}> {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [testsResult, monthlyResult, clientsResult] = await Promise.all([
    supabase.from('quiz_responses').select('raw_score'),
    supabase.from('quiz_responses').select('id', { count: 'exact' }).gte('created_at', firstDayOfMonth),
    supabase.from('clients').select('id', { count: 'exact' }),
  ]);

  const tests = testsResult.data || [];
  const totalTests = tests.length;
  const averageScore = totalTests > 0
    ? Math.round(tests.reduce((sum, t) => sum + normalizeRawScore(t.raw_score, 10), 0) / totalTests)
    : 0;

  return {
    totalTests,
    averageScore,
    testsThisMonth: monthlyResult.count || 0,
    totalClients: clientsResult.count || 0,
  };
}

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  return data;
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching client:', error);
    return null;
  }

  return data;
}

export async function createClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    return null;
  }

  return data;
}

export async function updateClient(id: string, client: Partial<Omit<Client, 'id' | 'created_at'>>): Promise<boolean> {
  const { error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id);

  if (error) {
    console.error('Error updating client:', error);
    return false;
  }

  return true;
}

export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting client:', error);
    return false;
  }

  return true;
}

export async function getClientAssessments(clientId: string): Promise<Submission[]> {
  const { data: leads } = await supabase
    .from('quiz_leads')
    .select('id')
    .eq('client_id', clientId);

  if (!leads || leads.length === 0) {
    return [];
  }

  const leadIds = leads.map((l) => l.id);
  const { data, error } = await supabase
    .from('quiz_responses')
    .select(`
      id,
      lead_id,
      answers,
      raw_score,
      calculated_level,
      final_level,
      alerts,
      created_at,
      lead:quiz_leads(id, name, position, company, email, whatsapp, client_id, created_at)
    `)
    .in('lead_id', leadIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client assessments:', error);
    return [];
  }

  const transformed = (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    lead: Array.isArray(item.lead) ? item.lead[0] : item.lead,
  }));
  return transformed as Submission[];
}

export async function getQuestions(): Promise<QuestionConfig[]> {
  const { data, error } = await supabase
    .from('questions_config')
    .select('*')
    .order('order_num', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }

  return data;
}

export async function updateQuestion(id: string, updates: Partial<Omit<QuestionConfig, 'id' | 'created_at'>>): Promise<boolean> {
  const { error } = await supabase
    .from('questions_config')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating question:', error);
    return false;
  }

  return true;
}

export async function reorderQuestions(questions: { id: string; order_num: number }[]): Promise<boolean> {
  for (const q of questions) {
    const { error } = await supabase
      .from('questions_config')
      .update({ order_num: q.order_num })
      .eq('id', q.id);

    if (error) {
      console.error('Error reordering questions:', error);
      return false;
    }
  }

  return true;
}

export async function getAnchorRules(): Promise<AnchorRule[]> {
  const { data, error } = await supabase
    .from('anchor_rules')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching anchor rules:', error);
    return [];
  }

  return data;
}

export async function updateAnchorRule(id: string, updates: Partial<Omit<AnchorRule, 'id' | 'created_at'>>): Promise<boolean> {
  const { error } = await supabase
    .from('anchor_rules')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating anchor rule:', error);
    return false;
  }

  return true;
}

export async function createQuestion(question: {
  question_text: string;
  category: string;
  options: string[];
  order_num: number;
}): Promise<QuestionConfig | null> {
  const { data, error } = await supabase
    .from('questions_config')
    .insert({
      question_text: question.question_text,
      category: question.category,
      options: question.options,
      order_num: question.order_num,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating question:', error);
    return null;
  }

  return data;
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('questions_config')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting question:', error);
    return false;
  }

  return true;
}

export interface RuleDependency {
  rule: AnchorRule;
  questionOrderNum: number;
}

export async function getQuestionRuleDependencies(questionOrderNum: number): Promise<RuleDependency[]> {
  const rules = await getAnchorRules();
  return rules
    .filter((rule) => rule.config.question_id === questionOrderNum)
    .map((rule) => ({ rule, questionOrderNum }));
}

export async function getAllRuleDependencies(): Promise<Map<number, AnchorRule[]>> {
  const rules = await getAnchorRules();
  const map = new Map<number, AnchorRule[]>();

  for (const rule of rules) {
    const qId = rule.config.question_id;
    if (!map.has(qId)) {
      map.set(qId, []);
    }
    map.get(qId)!.push(rule);
  }

  return map;
}
