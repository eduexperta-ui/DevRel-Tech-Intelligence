const dbProps = {
  "Title (제목)": { type: "title" },
  "분석 기간": { type: "rich_text" },
  "분석 카테고리": { type: "rich_text" },
  "타겟 연령": { type: "rich_text" },
  "분석 목적": { type: "rich_text" }
};

const properties = {};
const setPropValue = (propName, value) => {
  if (!propName || value === undefined || value === null) return;
  const propType = dbProps[propName]?.type;
  if (!propType) return;
  const stringValue = Array.isArray(value) ? value.join(', ') : String(value);

  if (propType === 'title') {
    properties[propName] = { title: stringValue ? [{ text: { content: stringValue.substring(0, 2000) } }] : [] };
  } else if (propType === 'rich_text') {
    properties[propName] = { rich_text: stringValue ? [{ text: { content: stringValue.substring(0, 2000) } }] : [] };
  }
};

const pValue = '1주일';
if (dbProps['분석 기간']) setPropValue('분석 기간', pValue);

console.log(properties);
