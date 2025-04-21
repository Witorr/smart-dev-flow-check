import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

async function transcribeAudioWithHuggingFace(audioFile, hfKey) {
  const formData = new FormData();
  formData.append('file', audioFile, 'audio.webm');
  formData.append('model', 'openai/whisper-large');

  const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hfKey}`
    },
    body: formData
  });
  if (!response.ok) {
    throw new Error('Erro ao transcrever áudio com Hugging Face: ' + (await response.text()));
  }
  const result = await response.json();
  return result.text || '';
}

async function parseFormData(req) {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const period = formData.get('period') as string;
    const teamType = formData.get('teamType') as string;
    const technologies = formData.get('technologies') ? JSON.parse(formData.get('technologies') as string) : [];
    const audioFile = formData.get('audio') as File | null;
    return { period, teamType, technologies, audioFile };
  } else {
    // JSON fallback
    const body = await req.json();
    return {
      period: body.period,
      teamType: body.teamType,
      technologies: body.technologies,
      audioFile: null
    };
  }
}

// --- SLACK WEBHOOK ---
async function notifySlack(projectName, creator) {
  const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  if (!webhookUrl) return;
  const payload = {
    text: `Novo projeto criado: *${projectName}* por ${creator}`
  };
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// --- REMOVIDO: Google Calendar/OAuth ---
// TODO: Implementar integração com Calendly API

serve(async (req) => {
  console.log("Requisição recebida:", req.method, req.url);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;
  const method = req.method;

  // SLACK NOTIFY ENDPOINT
  if (pathname.endsWith('/slack-notify')) {
    try {
      const { projectName, creator } = await req.json();
      await notifySlack(projectName, creator);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // --- DEFAULT: EXISTING CHECKLIST FLOW ---
  let period = '', teamType = '', technologies = [], audioFile = null, description = '';
  try {
    ({ period, teamType, technologies, audioFile } = await parseFormData(req));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid form data' }), { status: 400, headers: corsHeaders });
  }

  // 1. Transcribe audio if present
  let hfKey = Deno.env.get('HF_API_KEY');
  if (audioFile) {
    try {
      description = await transcribeAudioWithHuggingFace(audioFile, hfKey);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Erro ao transcrever áudio: ' + e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // 2. Generate checklist with Hugging Face
  const prompt = `Gere um checklist em formato de array JSON para um projeto com as seguintes características: tecnologias: ${technologies.join(', ')}, período: ${period}, equipe: ${teamType}${description ? ', descrição: ' + description : ''}.\nChecklist:`;
  let hfData;
  try {
    const hfRes = await fetch('https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-1.3B', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt
      })
    });
    const hfText = await hfRes.text();
    try {
      hfData = JSON.parse(hfText);
    } catch (e) {
      throw new Error('Resposta da Hugging Face não é JSON: ' + hfText);
    }
    if (!hfRes.ok) {
      throw new Error('Erro da Hugging Face: ' + hfText);
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Erro ao gerar checklist: ' + e.message }), { status: 500, headers: corsHeaders });
  }

  // 3. Parse checklist from Hugging Face response
  let checklist = [];
  try {
    const generated = hfData[0]?.generated_text || '';
    const match = generated.match(/\[(.|\n|\r)*\]/);
    if (match) {
      checklist = JSON.parse(match[0]);
    } else {
      throw new Error('Checklist não encontrado no texto gerado');
    }
    if (!Array.isArray(checklist)) throw new Error('Checklist não é array');
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Checklist retornado pela Hugging Face é inválido: ' + e.message }), { status: 500, headers: corsHeaders });
  }

  // 4. Salvar projeto e tasks no Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  let project;
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name: 'Projeto Inteligente', technologies, period, team_type: teamType, description }])
      .select()
      .single();
    if (error) {
      return new Response(JSON.stringify({ error: 'Erro ao criar projeto: ' + error.message }), { status: 500, headers: corsHeaders });
    }
    project = data;
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Erro inesperado ao criar projeto: ' + e.message }), { status: 500, headers: corsHeaders });
  }

  // Salva tasks em paralelo
  try {
    await Promise.all(
      checklist.map(task =>
        supabase.from('tasks').insert({
          project_id: project.id,
          title: task,
          is_completed: false
        })
      )
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Erro ao salvar tasks: ' + e.message }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ projectId: project.id, checklist, description }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
});
