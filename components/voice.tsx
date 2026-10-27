'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Volume2} from 'lucide-react';
import {usePlatform} from './provider';
type Recognition={lang:string;interimResults:boolean;onresult:((event:{results:{0:{0:{transcript:string}}}})=>void)|null;onerror:(()=>void)|null;onend:(()=>void)|null;start:()=>void;abort:()=>void};
const locales={en:'en-IN',hi:'hi-IN',ta:'ta-IN',te:'te-IN'};
export function Voice({text,onTranscript}:{text:string;onTranscript?:(s:string)=>void}){
 const {lang,t}=usePlatform();const [notice,setNotice]=useState(''),[recording,setRecording]=useState(false);const ref=useRef<Recognition|null>(null);
 useEffect(()=>()=>{ref.current?.abort();window.speechSynthesis?.cancel();},[]);
 function speak(){if(!('speechSynthesis'in window)){setNotice('Audio is unavailable. Please use the text on screen.');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=locales[lang];speechSynthesis.speak(u);}
 function record(){if(recording){ref.current?.abort();return;}const w=window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};const C=w.SpeechRecognition||w.webkitSpeechRecognition;if(!C){setNotice('Voice input is unavailable in this browser. You can type below.');return;}const r=ref.current=new C();r.lang=locales[lang];r.interimResults=false;r.onresult=e=>onTranscript?.(e.results[0][0].transcript);r.onerror=()=>{setNotice('Microphone unavailable or speech not recognized. Please type or retry.');setRecording(false);};r.onend=()=>setRecording(false);try{r.start();setRecording(true);setNotice('');}catch{setNotice('Unable to start microphone.');}}
 return <><div className="voice"><button type="button" className="outline" onClick={speak}><Volume2 size={18}/>{t.listen}</button>{onTranscript&&<button type="button" className="outline" aria-pressed={recording} onClick={record}><Mic size={18}/>{recording?'● Stop':t.voice}</button>}</div><span role="status" className="muted">{notice}</span></>;
}
