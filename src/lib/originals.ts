function database(): Promise<IDBDatabase> {
 return new Promise((resolve,reject)=>{const r=indexedDB.open('english-originals-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
}
export async function putOriginal(id:string, file:Blob) {
 const db=await database();return new Promise<void>((resolve,reject)=>{const t=db.transaction('files','readwrite');t.objectStore('files').put(file,id);t.oncomplete=()=>{db.close();resolve();};t.onerror=()=>{db.close();reject(t.error);};});
}
export async function getOriginal(id:string):Promise<Blob|undefined> {
 const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction('files').objectStore('files').get(id);r.onsuccess=()=>{db.close();resolve(r.result);};r.onerror=()=>{db.close();reject(r.error);};});
}
