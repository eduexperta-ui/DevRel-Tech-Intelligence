const dbProps = {
  "Categories (카테고리)": {
    "id": "%3AMvj",
    "name": "Categories (카테고리)",
    "type": "rich_text",
    "rich_text": {}
  },
  "Impact (영향도 - High/Medium/Low)": {
    "id": "JvY%40",
    "name": "Impact (영향도 - High/Medium/Low)",
    "type": "rich_text",
    "rich_text": {}
  },
  "Keywords (핵심 키워드)": {
    "id": "Wd%5Ce",
    "name": "Keywords (핵심 키워드)",
    "type": "rich_text",
    "rich_text": {}
  },
  "Period (분석 기간)": {
    "id": "%5BbHj",
    "name": "Period (분석 기간)",
    "type": "rich_text",
    "rich_text": {}
  },
  "Purpose (분석 목적)": {
    "id": "cI%5Ea",
    "name": "Purpose (분석 목적)",
    "type": "rich_text",
    "rich_text": {}
  },
  "TargetAges (타겟 연령대)": {
    "id": "eVse",
    "name": "TargetAges (타겟 연령대)",
    "type": "rich_text",
    "rich_text": {}
  },
  "Title (제목)": {
    "id": "title",
    "name": "Title (제목)",
    "type": "title",
    "title": {}
  }
};

const findProp = (names) => {
  const dbPropNames = Object.keys(dbProps);
  for (const name of names) {
    const found = dbPropNames.find(dn => 
      dn === name || 
      dn.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(dn.toLowerCase())
    );
    if (found) return found;
  }
  return null;
};

const namesToFind = [
  ['Period (분석 기간)', 'Period', '기간', '분석 기간'],
  ['TargetAges (타겟 연령대)', 'TargetAges', '타겟 연령대', 'Target Ages'],
  ['Categories (카테고리)', 'Categories', '카테고리'],
  ['Keywords (핵심 키워드)', 'Keywords', '핵심 키워드', 'Keyword'],
  ['Purpose (분석 목적)', 'Purpose', '분석 목적'],
  ['Impact (영향도 - High/Medium/Low)', 'Impact', '영향도']
];

for (const names of namesToFind) {
  console.log("Finding", names[0], "=>", findProp(names));
}
