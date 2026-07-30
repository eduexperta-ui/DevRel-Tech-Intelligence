import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { Client } from '@notionhq/client';
import path from 'path';
import { getTrendAnalysisPrompt } from './src/services/promptService.js';

// Main Express Application Entry Point
export const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

const cleanEnv = (value: string | undefined) =>
  (value || '').trim().replace(/^[\"\']|[\"\']$/g, '');

const extractNotionId = (input: string) => {
  const match = input.match(
    /[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i
  );
  return match ? match[0].replace(/-/g, '') : '';
};

const parseRichText = (text: string) => {
  const result: any[] = [];
  const regex =
    /(!?\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(_([^_]+)_)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ text: { content: text.substring(lastIndex, match.index) } });
    }

    if (match[1]) {
      result.push({
        text: {
          content: match[2],
          link: { url: match[3] },
        },
      });
    } else if (match[4]) {
      result.push({
        text: { content: match[5] },
        annotations: { bold: true },
      });
    } else if (match[6] || match[8]) {
      result.push({
        text: { content: match[7] || match[9] },
        annotations: { italic: true },
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push({ text: { content: text.substring(lastIndex) } });
  }

  return result.length > 0 ? result : [{ text: { content: text } }];
};

const toPlainTextRichText = (text: string) => {
  const cleaned = text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .trim();

  if (!cleaned) return [];

  const chunks: any[] = [];
  for (let i = 0; i < cleaned.length; i += 1800) {
    chunks.push({
      type: 'text',
      text: {
        content: cleaned.substring(i, i + 1800),
      },
    });
  }

  return chunks;
};

const parseMarkdownToNotionBlocks = (markdown: string) => {
  const blocks: any[] = [];
  const lines = markdown.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: toPlainTextRichText(line.replace('### ', '')) },
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: toPlainTextRichText(line.replace('## ', '')) },
      });
    } else if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: { rich_text: toPlainTextRichText(line.replace('# ', '')) },
      });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: toPlainTextRichText(line.replace(/^[-*]\s/, '')),
        },
      });
    } else if (/^\d+\.\s/.test(line)) {
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: toPlainTextRichText(line.replace(/^\d+\.\s/, '')),
        },
      });
    } else if (line.startsWith('> ')) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: { rich_text: toPlainTextRichText(line.replace('> ', '')) },
      });
    } else if (line === '---' || line === '***') {
      blocks.push({ object: 'block', type: 'divider', divider: {} });
    } else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: toPlainTextRichText(line) },
      });
    }
  }

  return blocks;
};

app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

app.get(['/api/config-check', '/config-check'], (req, res) => {
  const notionApiKey = cleanEnv(process.env.NOTION_API_KEY);
  const notionDbIdRaw = cleanEnv(process.env.NOTION_DATABASE_ID);
  const geminiApiKey = cleanEnv(process.env.Gemini_API_Key);

  const normalizedNotionDbId = extractNotionId(notionDbIdRaw);
  const notionDbIdFormatValid = /^[a-f0-9]{32}$/i.test(normalizedNotionDbId);

  res.json({
    notionApiKeyPresent: !!notionApiKey,
    notionDbIdPresent: !!notionDbIdRaw,
    notionDbIdFormatValid,
    geminiApiKeyPresent: !!geminiApiKey,
    nodeEnv: process.env.NODE_ENV,
    debug: {
      notionApiKeyStatus: notionApiKey ? 'exists' : 'missing-or-empty',
      notionDbIdRawPreview: notionDbIdRaw ? `${notionDbIdRaw.slice(0, 8)}...` : 'missing',
      normalizedNotionDbIdPreview: normalizedNotionDbId
        ? `${normalizedNotionDbId.slice(0, 8)}...`
        : 'invalid',
    },
  });
});

app.post(['/api/analyze', '/analyze'], async (req, res) => {
  try {
    const {
      period,
      selectedCategories,
      targetAges,
      purpose,
      dataSources,
      keyword,
      articleCount,
      imageBase64,
      templateId,
    } = req.body;

    const apiKey = cleanEnv(process.env.Gemini_API_Key);

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY가 서버에 설정되지 않았습니다.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const textPrompt = getTrendAnalysisPrompt(
      period,
      selectedCategories,
      targetAges,
      purpose,
      dataSources,
      keyword,
      articleCount,
      templateId
    );

    const parts: any[] = [{ text: textPrompt }];

    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeType =
        imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType,
        },
      });
    }

    const config = {
      systemInstruction:
        '너는 개발 조직 및 테크 기업에 특화된 DevRel Tech Intelligence 에이전트야. 너의 최종 목표는 DevRel 담당자, 테크 리더, 개발자 교육 기획자가 즉시 실행할 수 있는 기술 정보 브리프 및 DevRel 액션 리포트를 만드는 거야. 항상 설정된 타깃과 분석 목적을 기준으로 유의미한 엔지니어링 인사이트를 정리해줘.',
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
      seed: 42,
    };

    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash-lite',
    ];

    let response: any = null;
    let lastError: any = null;
    let usedModel: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const result = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config,
        });

        response = result;
        usedModel = modelName;
        lastError = null;
        break;
      } catch (err: any) {
        console.warn(`[Gemini] model failed: ${modelName}`, err?.message || err);
        lastError = err;
      }
    }

    if (!response) {
      const rawMessage = String(lastError?.message || lastError || '').toLowerCase();

      if (
        rawMessage.includes('not found') ||
        rawMessage.includes('404') ||
        rawMessage.includes('model') ||
        rawMessage.includes('unsupported')
      ) {
        return res.status(500).json({
          error: 'Gemini 모델명 또는 API 요청 대상이 올바르지 않습니다.',
          debug: lastError?.message || String(lastError),
        });
      }

      if (
        rawMessage.includes('api key') ||
        rawMessage.includes('api_key_invalid') ||
        rawMessage.includes('permission denied') ||
        rawMessage.includes('unauthorized') ||
        rawMessage.includes('403')
      ) {
        return res.status(500).json({
          error: 'Gemini API 키가 유효하지 않거나 권한이 없습니다.',
          debug: lastError?.message || String(lastError),
        });
      }

      if (
        rawMessage.includes('quota') ||
        rawMessage.includes('429') ||
        rawMessage.includes('resource exhausted')
      ) {
        return res.status(500).json({
          error: 'Gemini API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.',
          debug: lastError?.message || String(lastError),
        });
      }

      return res.status(500).json({
        error: 'Gemini 분석 중 서버 오류가 발생했습니다.',
        debug: lastError?.message || String(lastError),
      });
    }

function normalizeSourceServer(title: string, uri: string) {
  const isRedirect = uri.includes("vertexaisearch.cloud.google.com") || uri.includes("google.com/url");
  return {
    title: title.trim(),
    uri: uri.trim(),
    isGroundingRedirect: isRedirect,
    sourceType: isRedirect ? "grounding_redirect" : "direct",
    domain: (() => { try { return new URL(uri).hostname; } catch { return undefined; } })(),
    statusLabel: isRedirect ? "GROUNDING REDIRECT" : "ORIGINAL URL",
  };
}

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

    const extractedSources = groundingChunks
      .map((chunk: any) => {
        const title = chunk?.web?.title;
        const uri = chunk?.web?.uri;
        if (title && uri) {
          return normalizeSourceServer(title, uri);
        }
        return null;
      })
      .filter((s: any) => s !== null);

    return res.json({
      text: response.text,
      sources: extractedSources,
      ...response,
      usedModel,
    });
  } catch (error: any) {
    console.error('Analyze API error:', error);

    return res.status(500).json({
      error: error?.message || '분석 중 오류가 발생했습니다.',
    });
  }
});

app.post(['/api/save-to-notion', '/save-to-notion'], async (req, res) => {
  try {
    const { markdown, period, categories, targetAges, purpose, notionPayload } = req.body;

    const notionApiKey = cleanEnv(process.env.NOTION_API_KEY);
    const notionDbIdRaw = cleanEnv(process.env.NOTION_DATABASE_ID);
    const notionDbId = extractNotionId(notionDbIdRaw);

    if (!notionApiKey || !notionDbIdRaw) {
      return res.status(400).json({
        success: false,
        error: '노션 설정(API Key 또는 Database ID)이 누락되었습니다.',
      });
    }

    if (!/^[a-f0-9]{32}$/i.test(notionDbId)) {
      return res.status(400).json({
        success: false,
        error: `노션 데이터베이스 ID 형식이 올바르지 않습니다. 현재 값: "${notionDbIdRaw}"`,
      });
    }

    const notion = new Client({ auth: notionApiKey });
    const payloadProps = notionPayload?.database_properties || {};

    let contentToParse = markdown || notionPayload?.markdown_body || '';
    if (!contentToParse.includes('분석 기간:')) {
      contentToParse =
        `> **분석 기간:** ${period || '1주일'}\n` +
        `> **분석 카테고리:** ${categories || '전체'}\n` +
        `> **타겟 연령:** ${targetAges || '전체'}\n` +
        `> **분석 목적:** ${purpose || '트렌드 분석'}\n\n` +
        contentToParse;
    }

    const blocks = parseMarkdownToNotionBlocks(contentToParse);

    const nowIso = new Date().toISOString();

    const titleValue =
      payloadProps?.Title ||
      `[${period || '기간 미지정'}] ${categories || '전체'} 트렌드 분석 - ${
        purpose || '트렌드 분석'
      } (${targetAges || '전체'})`;

    const pValue = payloadProps?.Period || period || '최근 1주';
    const cValue = payloadProps?.Categories || categories || '전체';
    const tValue = payloadProps?.TargetAges || targetAges || '전체';
    const purpValue = payloadProps?.Purpose || purpose || '트렌드 분석';

    const properties: Record<string, any> = {
      Title: {
        title: [
          {
            type: 'text',
            text: {
              content: String(titleValue).substring(0, 2000),
            },
          },
        ],
      },
      Period: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: String(pValue).substring(0, 2000),
            },
          },
        ],
      },
      Categories: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: String(cValue).substring(0, 2000),
            },
          },
        ],
      },
      TargetAges: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: String(tValue).substring(0, 2000),
            },
          },
        ],
      },
      Purpose: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: String(purpValue).substring(0, 2000),
            },
          },
        ],
      },
      Date: {
        date: {
          start: nowIso,
        },
      },
    };

    console.log('Hardcoded Notion properties:', JSON.stringify(properties, null, 2));
    console.log('Parsed block count:', blocks.length);

    const firstBlockChildren = [
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `이 리포트는 ${period || '선택 기간'} 동안의 데이터를 바탕으로 생성된 마켓 인텔리전스입니다.`,
              },
            },
          ],
          icon: { emoji: '📊' as any },
          color: 'blue_background',
        },
      },
      { object: 'block', type: 'divider', divider: {} },
      ...blocks.slice(0, 95),
    ];

    let notionResponse: any;
    let fallbackUsed = false;
    let fallbackMessage = '';

    try {
      notionResponse = await notion.pages.create({
        parent: { database_id: notionDbId },
        properties,
        children: firstBlockChildren,
      } as any);
    } catch (e: any) {
      if (e.status === 400 || (e.message && e.message.includes('400'))) {
        fallbackUsed = true;
        fallbackMessage = e.message;

        console.warn(
          'First pages.create failed with properties, retrying with ONLY title. Error:',
          e.message
        );

        notionResponse = await notion.pages.create({
          parent: { database_id: notionDbId },
          properties: { Title: properties['Title'] },
          children: firstBlockChildren,
        } as any);
      } else {
        throw e;
      }
    }

    const pageId = notionResponse.id;
    const successProperties = fallbackUsed ? ['Title'] : Object.keys(properties);

    if (blocks.length > 95) {
      for (let i = 95; i < blocks.length; i += 80) {
        await notion.blocks.children.append({
          block_id: pageId,
          children: blocks.slice(i, i + 80),
        });
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    return res.json({
      success: true,
      url: notionResponse.url,
      mappedProperties: successProperties,
      debugMappedProperties: properties,
      debugFallbackUsed: fallbackUsed,
      blockCount: blocks.length,
      message: fallbackUsed
        ? `전체 속성 매핑 실패(제목+리포트 본문만 저장됨): ${fallbackMessage}`
        : undefined,
    });
  } catch (error: any) {
    console.error('Error saving to Notion:', error);

    let errorMessage = error?.message || '노션 저장 중 오류가 발생했습니다.';

    if (
      error?.code === 'restricted_resource' ||
      error?.status === 403 ||
      errorMessage.includes('403')
    ) {
      errorMessage =
        '노션 데이터베이스 접근 권한이 없습니다 (403). 데이터베이스 페이지에서 Integration을 연결해주세요.';
    } else if (
      error?.code === 'object_not_found' ||
      error?.status === 404 ||
      errorMessage.includes('404')
    ) {
      errorMessage =
        '노션 데이터베이스를 찾을 수 없습니다. Database ID와 Integration 연결 상태를 다시 확인해주세요.';
    } else if (errorMessage.includes('The string did not match the expected pattern')) {
      errorMessage = '노션 데이터베이스 ID 형식이 올바르지 않습니다.';
    }

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

const isVercel = !!process.env.VERCEL;
const isProd = process.env.NODE_ENV === 'production';

const startServer = async () => {
  if (isVercel) return;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

if (!isVercel) {
  startServer();
}

export default app;