import { cleanText, usableText } from './course.ts';
export function needsOcr(text:string, hasImages:boolean, force:boolean) {
 return force || !usableText(text) || (hasImages && text.replace(/\s/g,'').length < 1200);
}
export function chooseExtraction(native:string, ocr:string, confidence:number, force:boolean) {
 if(force || !usableText(native))return 'ocr';
 // Keep a useful native layer if image recognition produces less or unreliable text.
 return confidence >= 65 && cleanText(ocr).length > native.length * 1.15 ? 'ocr' : 'text';
}
export function preferSecondOcr(first:{text:string;confidence:number},second:{text:string;confidence:number}) {
 const words=(s:string)=>(s.match(/\p{L}{2,}/gu)||[]).length;
 return second.confidence >= first.confidence-5 && words(second.text)>words(first.text)*1.2;
}
