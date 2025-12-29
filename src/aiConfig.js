/**
 * AI Configuration for PersonaBalance
 * 
 * This module handles AI API integration for generating balance reports.
 * Supports both simulated analysis (for demo/testing) and real API integration.
 */

// Configuration
const AI_CONFIG = {
  // Set to 'simulated' for demo mode, or 'openai' / 'huggingface' for real API
  mode: 'simulated',
  
  // API Keys (should be set via environment variables in production)
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  huggingfaceApiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
  
  // API endpoints
  openaiEndpoint: 'https://api.openai.com/v1/chat/completions',
  huggingfaceEndpoint: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
};

/**
 * Generate AI report using configured service
 * @param {Array} records - Array of interaction records
 * @returns {Promise<Object>} Report object with content and metadata
 */
export async function generateAIReport(records) {
  if (AI_CONFIG.mode === 'simulated') {
    return generateSimulatedReport(records);
  } else if (AI_CONFIG.mode === 'openai') {
    return generateOpenAIReport(records);
  } else if (AI_CONFIG.mode === 'huggingface') {
    return generateHuggingFaceReport(records);
  }
  
  return generateSimulatedReport(records); // Fallback
}

/**
 * Generate simulated report (for demo/testing)
 */
function generateSimulatedReport(records) {
  if (!records || records.length < 5) {
    return null;
  }

  const modes = records.map(r => r.mode);
  const scores = records.map(r => r.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  const calmCount = modes.filter(m => m === "Calm").length;
  const balancedCount = modes.filter(m => m === "Balanced").length;
  const aggressiveCount = modes.filter(m => m === "Aggressive").length;

  const totalInteractions = records.reduce((sum, r) => 
    sum + r.click_count + r.key_count + r.focus_count, 0
  );

  let report = `📊 Denge Analiz Raporu (${new Date().toLocaleString('tr-TR')})\n\n`;
  report += `Son ${records.length} analiz döngüsünde:\n`;
  report += `• Sakin Mod: %${Math.round((calmCount / modes.length) * 100)} (${calmCount} döngü)\n`;
  report += `• Dengeli Mod: %${Math.round((balancedCount / modes.length) * 100)} (${balancedCount} döngü)\n`;
  report += `• Agresif Mod: %${Math.round((aggressiveCount / modes.length) * 100)} (${aggressiveCount} döngü)\n\n`;
  report += `Ortalama Etkileşim Skoru: ${Math.round(avgScore)}\n`;
  report += `Toplam Etkileşim: ${totalInteractions} (Tıklama + Tuş + Odak)\n\n`;

  // Analysis and recommendations
  if (aggressiveCount > balancedCount && aggressiveCount > calmCount) {
    report += `⚠️ Analiz: Son dönemde yüksek aktivite gösteriyorsunuz.\n\n`;
    report += `💡 Öneriler:\n`;
    report += `• Düzenli molalar alın (Pomodoro tekniği)\n`;
    report += `• Nefes egzersizleri yapın\n`;
    report += `• Ekran dışı aktivitelere zaman ayırın\n`;
    report += `• Çalışma ritminizi yavaşlatmayı deneyin`;
  } else if (calmCount > balancedCount && calmCount > aggressiveCount) {
    report += `ℹ️ Analiz: Son dönemde düşük aktivite gösteriyorsunuz.\n\n`;
    report += `💡 Öneriler:\n`;
    report += `• Daha aktif olmak için küçük hedefler belirleyin\n`;
    report += `• Çalışma sürenizi kademeli olarak artırın\n`;
    report += `• Motivasyon teknikleri deneyin\n`;
    report += `• Düzenli aktivite rutini oluşturun`;
  } else {
    report += `✅ Analiz: Denge seviyeniz optimal görünüyor!\n\n`;
    report += `💡 Öneriler:\n`;
    report += `• Bu ritmi korumaya çalışın\n`;
    report += `• Düzenli molalar almaya devam edin\n`;
    report += `• Farkındalığınızı sürdürün`;
  }

  return {
    timestamp: new Date().toISOString(),
    content: report,
    stats: {
      calmCount,
      balancedCount,
      aggressiveCount,
      avgScore: Math.round(avgScore),
      totalInteractions
    }
  };
}

/**
 * Generate report using OpenAI API
 */
async function generateOpenAIReport(records) {
  if (!AI_CONFIG.openaiApiKey) {
    console.warn('OpenAI API key not configured, falling back to simulated report');
    return generateSimulatedReport(records);
  }

  try {
    // Prepare data summary for AI
    const summary = {
      totalCycles: records.length,
      modes: {
        calm: records.filter(r => r.mode === 'Calm').length,
        balanced: records.filter(r => r.mode === 'Balanced').length,
        aggressive: records.filter(r => r.mode === 'Aggressive').length
      },
      avgScore: records.reduce((sum, r) => sum + r.score, 0) / records.length,
      totalInteractions: records.reduce((sum, r) => 
        sum + r.click_count + r.key_count + r.focus_count, 0
      )
    };

    const prompt = `Sen bir dijital denge analiz uzmanısın. Kullanıcının son ${records.length} analiz döngüsündeki verilerini analiz et ve Türkçe bir denge raporu oluştur.

Veriler:
- Sakin Mod: ${summary.modes.calm} döngü
- Dengeli Mod: ${summary.modes.balanced} döngü  
- Agresif Mod: ${summary.modes.aggressive} döngü
- Ortalama Skor: ${Math.round(summary.avgScore)}
- Toplam Etkileşim: ${summary.totalInteractions}

Rapor formatı: Emoji'ler kullan, kısa ve anlaşılır ol, öneriler sun.`;

    const response = await fetch(AI_CONFIG.openaiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Sen bir dijital denge ve wellness uzmanısın.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    return {
      timestamp: new Date().toISOString(),
      content: aiContent,
      stats: summary,
      source: 'openai'
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateSimulatedReport(records); // Fallback
  }
}

/**
 * Generate report using HuggingFace API
 */
async function generateHuggingFaceReport(records) {
  if (!AI_CONFIG.huggingfaceApiKey) {
    console.warn('HuggingFace API key not configured, falling back to simulated report');
    return generateSimulatedReport(records);
  }

  try {
    const summary = {
      totalCycles: records.length,
      modes: {
        calm: records.filter(r => r.mode === 'Calm').length,
        balanced: records.filter(r => r.mode === 'Balanced').length,
        aggressive: records.filter(r => r.mode === 'Aggressive').length
      },
      avgScore: records.reduce((sum, r) => sum + r.score, 0) / records.length
    };

    const prompt = `Kullanıcı dijital denge analizi: Sakin=${summary.modes.calm}, Dengeli=${summary.modes.balanced}, Agresif=${summary.modes.aggressive}. Ortalama skor: ${Math.round(summary.avgScore)}. Türkçe kısa bir denge raporu ve öneriler sun.`;

    const response = await fetch(AI_CONFIG.huggingfaceEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.huggingfaceApiKey}`
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = Array.isArray(data) ? data[0].generated_text : data.generated_text;

    return {
      timestamp: new Date().toISOString(),
      content: aiContent,
      stats: summary,
      source: 'huggingface'
    };
  } catch (error) {
    console.error('HuggingFace API error:', error);
    return generateSimulatedReport(records); // Fallback
  }
}

/**
 * Update AI configuration
 */
export function updateAIConfig(config) {
  Object.assign(AI_CONFIG, config);
}

/**
 * Get current AI configuration
 */
export function getAIConfig() {
  return { ...AI_CONFIG };
}

