'use client';
import { createContext,useContext,useState,useEffect,useCallback, type ReactNode } from 'react';
import type { Language,Platform } from '@/lib/types';
import {translations} from '@/lib/translations';
const Context=createContext<null|{data:Platform|null;error:string;lang:Language;setLang:(l:Language)=>void;t:typeof translations.en;mutate:(body:Record<string,unknown>)=>Promise<string|undefined>;busy:boolean}>(null);
export function Provider({children}:{children:ReactNode}){
 const [data,setData]=useState<Platform|null>(null),[error,setError]=useState(''),[lang,setLang]=useState<Language>('en'),[busy,setBusy]=useState(false);
 const refresh=useCallback(async()=>{try{const r=await fetch('/api/platform');if(!r.ok)throw Error('Unable to load data');setData(await r.json());setError('');}catch{setError('Unable to connect. Please retry.');}},[]);
 useEffect(()=>{refresh();const timer=setInterval(refresh,15000);return()=>clearInterval(timer);},[refresh]);
 useEffect(()=>{const saved=localStorage.getItem('fairshift-language');if(saved&&saved in translations)setLang(saved as Language);},[]);
 useEffect(()=>{document.documentElement.lang=lang;},[lang]);
 async function mutate(body:Record<string,unknown>){setBusy(true);setError('');try{const r=await fetch('/api/platform',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const json=await r.json();if(!r.ok)throw Error(json.error);setData(json.data);return json.receipt as string|undefined;}catch(e){setError(e instanceof Error?e.message:'Unable to save');throw e;}finally{setBusy(false);}}
 return <Context.Provider value={{data,error,lang,setLang:(l)=>{setLang(l);localStorage.setItem('fairshift-language',l);},t:translations[lang],mutate,busy}}>{children}</Context.Provider>;
}
export function usePlatform(){const c=useContext(Context);if(!c)throw Error('Missing provider');return c;}
