import type { Shift } from './types';
export function shiftHours(shift: Pick<Shift, 'start' | 'end'>, now = Date.now()) {
 const start = Date.parse(shift.start), end = shift.end ? Date.parse(shift.end) : now;
 return Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, (end-start)/3600000) : 0;
}
export function payBreakdown(shifts: Shift[], rate: number, now = Date.now()) {
 const regular = shifts.reduce((sum,s)=>sum+Math.min(8,shiftHours(s,now)),0);
 const overtime = shifts.reduce((sum,s)=>sum+Math.max(0,shiftHours(s,now)-8),0);
 return { regular, overtime, basePay: regular*rate, overtimePay: overtime*rate*1.5, total: (regular+overtime*1.5)*rate };
}
export function fatigueReasons(shifts: Shift[], now = Date.now()) {
 const sorted = [...shifts].sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
 const reasons: string[] = [];
 if (sorted.some(s=>shiftHours(s,now)>12)) reasons.push('Shift exceeds 12 hours');
 const weekHours = sorted.reduce((sum,s)=>sum+Math.max(0,(Math.min(s.end?Date.parse(s.end):now,now)-Math.max(Date.parse(s.start),now-7*86400000))/3600000),0);
 if (weekHours>48) reasons.push('More than 48 hours this week');
 if (sorted.some((s,i)=>i>0 && sorted[i-1].end && (Date.parse(s.start)-Date.parse(sorted[i-1].end!))/3600000<11)) reasons.push('Less than 11 hours between shifts');
 return reasons;
}
