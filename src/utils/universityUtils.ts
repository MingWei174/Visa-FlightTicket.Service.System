import partnersData from '../data/partners.json';
import { universitiesByCountry as defaultUniversities } from '../data';

export interface UniversityInfo {
  name: string;
  isSisterSchool: boolean;
  desc: string;
}

export function getMergedUniversities(): Record<string, UniversityInfo[]> {
  const merged: Record<string, UniversityInfo[]> = JSON.parse(JSON.stringify(defaultUniversities));

  partnersData.forEach((p: any) => {
    let rawCountry = p.country || "其他";
    let country = rawCountry.split(' ')[0] || rawCountry;
    if (rawCountry.includes("日本")) country = "日本";
    else if (rawCountry.includes("美國") || rawCountry.includes("USA") || rawCountry.includes("US")) country = "美國";
    else if (rawCountry.includes("加拿大")) country = "加拿大";
    else if (rawCountry.includes("澳洲") || rawCountry.includes("Australia")) country = "澳洲";
    else if (rawCountry.includes("韓國") || rawCountry.includes("Korea")) country = "韓國";
    else if (rawCountry.includes("德國") || rawCountry.includes("Germany")) country = "德國";
    else if (rawCountry.includes("英國") || rawCountry.includes("UK")) country = "英國";
    else if (rawCountry.includes("法國") || rawCountry.includes("France")) country = "法國";
    else if (rawCountry.includes("中") || rawCountry.includes("China")) country = "中國大陸";
    else country = rawCountry.split(' ')[0];

    if (!merged[country]) {
      merged[country] = [];
    }

    const uniName = p.nameCn ? `${p.nameCn} (${p.name})` : p.name;
    
    // Check if already exists
    const exists = merged[country].find(u => u.name === uniName || u.name.includes(p.name));
    if (!exists) {
      merged[country].push({
        name: uniName,
        isSisterSchool: true, // all from partners.json are sister schools
        desc: `本校姊妹校 (${p.type || '合作備忘錄'})`
      });
    } else {
      exists.isSisterSchool = true;
      exists.desc = `本校姊妹校 (${p.type || '合作備忘錄'})`;
    }
  });

  return merged;
}
