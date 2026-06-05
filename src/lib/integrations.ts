import { supabase } from './supabase';

export interface ResultImages {
  score_image_url: string;
  pyramid_image_url: string;
  analysis: {
    current_level: number;
    level_name: string;
    level_description: string;
    analysis_text: string;
    next_steps: string[];
    alerts: string[];
  };
}

export async function generateResultImages(params: {
  score: number;
  finalLevel: number;
  calculatedLevel: number;
  alerts: string[];
  leadId: string;
  responseId: string;
}): Promise<ResultImages | null> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-result-images`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating result images:', error);
    return null;
  }
}

export async function loadFacebookPixel() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'facebook_pixel_id')
      .maybeSingle();

    if (error || !data?.value) {
      return;
    }

    const pixelId = data.value.trim();
    if (!pixelId) return;

    if (window.fbq) {
      console.log('Facebook Pixel already loaded');
      return;
    }

    (function(f: any, b: any, e: string, v: string, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    console.log('Facebook Pixel loaded:', pixelId);
  } catch (error) {
    console.error('Error loading Facebook Pixel:', error);
  }
}

export async function sendWebhook(payload: {
  lead: {
    name: string;
    email: string;
    whatsapp: string;
    position: string;
    company: string;
  };
  score: {
    raw_score: number;
    calculated_level: number;
    final_level: number;
    alerts: string[];
  };
  images?: {
    score_image_url: string;
    pyramid_image_url: string;
  };
  analysis?: {
    current_level: number;
    level_name: string;
    level_description: string;
    analysis_text: string;
    next_steps: string[];
    alerts: string[];
  };
  timestamp: string;
}) {
  try {
    const { data: webhookData, error: webhookError } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['webhook_url', 'webhook_enabled']);

    if (webhookError || !webhookData) {
      return { success: false, error: 'Webhook configuration not found' };
    }

    const settings = webhookData.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    if (settings.webhook_enabled !== 'true') {
      console.log('Webhook is disabled');
      return { success: true, skipped: true };
    }

    const webhookUrl = settings.webhook_url?.trim();
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL not configured' };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log('Webhook sent successfully to:', webhookUrl);
    return { success: true };
  } catch (error) {
    console.error('Error sending webhook:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function trackFacebookEvent(eventName: string, params?: Record<string, any>) {
  if (window.fbq) {
    window.fbq('track', eventName, params);
    console.log('Facebook event tracked:', eventName, params);
  }
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}
