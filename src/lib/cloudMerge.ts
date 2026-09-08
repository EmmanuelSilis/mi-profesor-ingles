import type { Attempt } from './courseStore';
export function mergeAttempts(a:Record<string,Attempt[]>,b:Record<string,Attempt[]>) {
 const result:Record<string,Attempt[]>={};
 for(const id of new Set([...Object.keys(a),...Object.keys(b)])) {
  const unique=new Map<string,Attempt>();
  for(const item of [...(a[id]||[]),...(b[id]||[])]) unique.set(JSON.stringify([item.cardId,item.at,item.mode,item.answer,item.correct]),item);
  result[id]=[...unique.values()].sort((x,y)=>x.at.localeCompare(y.at)).slice(-5000);
 }
 return result;
}
