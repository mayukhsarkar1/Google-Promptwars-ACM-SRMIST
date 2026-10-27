import { NextRequest, NextResponse } from 'next/server';
import { db, snapshot } from '@/lib/db';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json(snapshot(),{headers:{'Cache-Control':'no-store'}});}
export async function POST(req:NextRequest){
 const origin=req.headers.get('origin'); if(origin && new URL(origin).host!==req.headers.get('host')) return NextResponse.json({error:'Origin rejected'},{status:403});
 try {
 if(Number(req.headers.get('content-length')||0)>12000) throw new Error('Request too large');
 const b=await req.json(), d=db();
 if(b.action==='shift'){
 if(typeof b.workerId!=='string'||!d.prepare('SELECT id FROM workers WHERE id=?').get(b.workerId))throw new Error('Unknown worker');
 if(b.mode==='in'){try{d.prepare('INSERT INTO shifts VALUES (?,?,?,NULL)').run(crypto.randomUUID(),b.workerId,new Date().toISOString());}catch{throw new Error('A shift is already active');}}
 else if(b.mode==='out'){const result=d.prepare('UPDATE shifts SET end=? WHERE workerId=? AND end IS NULL').run(new Date().toISOString(),b.workerId);if(!result.changes)throw new Error('No active shift');}
 else throw new Error('Invalid shift action');
 }else if(b.action==='report'){
 if(!['Construction','Campus'].includes(b.sector)||!['Equipment','Facilities','Harassment','Other'].includes(b.category)||typeof b.description!=='string'||b.description.trim().length<10||b.description.length>2000)throw new Error('Choose a category and describe the issue in 10–2000 characters');
 const id=`FS-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
 d.prepare('INSERT INTO tickets VALUES (?,?,?,?,?,?)').run(id,b.sector,b.category,b.description.trim(),'Open',new Date().toISOString());
 return NextResponse.json({data:snapshot(),receipt:id});
 }else if(b.action==='status'){
 if(typeof b.id!=='string'||!['Open','In progress','Resolved'].includes(b.status))throw new Error('Invalid status');
 if(!d.prepare('UPDATE tickets SET status=? WHERE id=?').run(b.status,b.id).changes)throw new Error('Ticket not found');
 }else if(b.action==='sentiment'){
 if(typeof b.workerId!=='string'||!Number.isInteger(b.score)||b.score<1||b.score>5)throw new Error('Invalid feedback');
 const row=d.prepare('SELECT payload FROM workers WHERE id=?').get(b.workerId);if(!row)throw new Error('Unknown worker');
 const w=JSON.parse(row.payload as string);w.sentiment=b.score;d.prepare('UPDATE workers SET payload=? WHERE id=?').run(JSON.stringify(w),b.workerId);
 }else throw new Error('Unknown action');
 return NextResponse.json({data:snapshot()});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Request failed'},{status:400});}
}
