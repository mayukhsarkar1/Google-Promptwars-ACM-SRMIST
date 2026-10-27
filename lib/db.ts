import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Platform, Worker, Shift, Ticket } from './types';
let instance: DatabaseSync;
export function db() {
 if(instance) return instance;
 const path=process.env.DATABASE_PATH || './data/fairshift.db'; mkdirSync(dirname(path),{recursive:true});
 const d=instance=new DatabaseSync(path);
 d.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS workers(id TEXT PRIMARY KEY, payload TEXT NOT NULL); CREATE TABLE IF NOT EXISTS shifts(id TEXT PRIMARY KEY, workerId TEXT NOT NULL, start TEXT NOT NULL, end TEXT); CREATE UNIQUE INDEX IF NOT EXISTS one_active ON shifts(workerId) WHERE end IS NULL; CREATE TABLE IF NOT EXISTS tickets(id TEXT PRIMARY KEY, sector TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL, createdAt TEXT NOT NULL);`);
 if(!(d.prepare('SELECT id FROM workers LIMIT 1').get())) {
 const workers: Worker[]=[
 {id:'w1',name:'Arun Kumar',role:'Site technician',sector:'Construction',site:'Riverside Site A',rate:120,sentiment:4,skills:['Safety induction','Equipment handling','First aid']},
 {id:'w2',name:'Meena Devi',role:'Campus caretaker',sector:'Campus',site:'Greenfield Campus',rate:110,sentiment:5,skills:['Safety induction','Hygiene & sanitation']},
 {id:'w3',name:'Ravi Singh',role:'Steel fixer',sector:'Construction',site:'Riverside Site A',rate:140,sentiment:2,skills:['Safety induction','Working at height']},
 {id:'w4',name:'Lakshmi R',role:'Security associate',sector:'Campus',site:'Greenfield Campus',rate:125,sentiment:3,skills:['Fire safety','First aid']},
 {id:'w5',name:'Joseph D',role:'Electrician',sector:'Construction',site:'Riverside Site A',rate:160,sentiment:4,skills:['Electrical safety']},
 {id:'w6',name:'Priya S',role:'Kitchen assistant',sector:'Campus',site:'Greenfield Campus',rate:110,sentiment:4,skills:['Food safety','Safety induction']}];
 const now=Date.now(), iso=(h:number)=>new Date(now-h*3600000).toISOString();
 d.exec('BEGIN');
 try { for(const w of workers) {d.prepare('INSERT INTO workers VALUES (?,?)').run(w.id,JSON.stringify(w)); for(let day=1;day<=4;day++)d.prepare('INSERT INTO shifts VALUES (?,?,?,?)').run(`${w.id}-${day}`,w.id,iso(day*24+8),iso(day*24));}
 for(const [id,h] of [['w1',4],['w2',3],['w3',13],['w4',6]] as const)d.prepare('INSERT INTO shifts VALUES (?,?,?,NULL)').run(`active-${id}`,id,iso(h));
 d.prepare('INSERT INTO tickets VALUES (?,?,?,?,?,?)').run('FS-1001','Construction','Equipment','Loose guardrail near the east stairwell. Please inspect before the next shift.','Open',iso(2));
 d.prepare('INSERT INTO tickets VALUES (?,?,?,?,?,?)').run('FS-1002','Campus','Facilities','Drinking water dispenser is not working in the staff room.','In progress',iso(20));
 d.exec('COMMIT'); } catch(e) {d.exec('ROLLBACK'); throw e;}
 }
 return d;
}
export function snapshot(): Platform {const d=db();return {workers:d.prepare('SELECT payload FROM workers').all().map(w=>JSON.parse(w.payload as string) as Worker),shifts:d.prepare('SELECT * FROM shifts').all() as unknown as Shift[],tickets:d.prepare('SELECT * FROM tickets ORDER BY createdAt DESC').all() as unknown as Ticket[]};}
