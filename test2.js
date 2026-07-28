const properties = {};
const dbProps = {
  "Title (제목)": { type: "title" },
  "분석 기간": { type: "rich_text" },
  "분석 카테고리": { type: "rich_text" },
  "타겟 연령": { type: "rich_text" },
  "분석 목적": { type: "rich_text" }
};

const setPropValue = (propName, value) => {
  if (!propName || value === undefined || value === null) return;
  
  const propType = dbProps[propName]?.type;
  if (!propType) return;
  const stringValue = Array.isArray(value) ? value.join(', ') : String(value);

  if (propType === 'title') {
    properties[propName] = { title: [{ text: { content: stringValue.substring(0, 2000) } }] };
  } else if (propType === 'rich_text') {
    properties[propName] = { rich_text: [{ text: { content: stringValue.substring(0, 2000) } }] };
  }
};

setPropValue('Title (제목)', 'Test Title');

const expectedMappings = [
  { keys: ['period', '기간'], value: '1주일' },
  { keys: ['target', '연령', 'ages'], value: '20대' },
  { keys: ['categor', '카테고리', '분류'], value: '데님' },
  { keys: ['keyword', '키워드'], value: '없음' },
  { keys: ['purpose', '목적'], value: '트렌드 분석' },
  { keys: ['impact', '영향도', '중요도'], value: 'High' },
];

const dbPropNames = Object.keys(dbProps);
for (const m of expectedMappings) {
  const propName = dbPropNames.find(k => m.keys.some(kw => k.toLowerCase().includes(kw.toLowerCase())));
  if (propName && !properties[propName]) {
      setPropValue(propName, m.value);
  }
}

console.log(JSON.stringify(properties, null, 2));
