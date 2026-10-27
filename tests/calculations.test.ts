import { describe,it,expect } from 'vitest';
import {shiftHours,payBreakdown,fatigueReasons} from '../lib/calculations';
import type {Shift} from '../lib/types';
const now=Date.parse('2026-10-27T12:00:00Z');
function shift(start:string,end:string|null):Shift{return {id:start,workerId:'w1',start,end};}
describe('shift accounting',()=>{
 it('calculates an overnight shift',()=>expect(shiftHours(shift('2026-10-26T22:00:00Z','2026-10-27T06:00:00Z'))).toBe(8));
 it('calculates live hours using the supplied clock',()=>expect(shiftHours(shift('2026-10-27T08:00:00Z',null),now)).toBe(4));
 it('rejects negative and invalid intervals',()=>{expect(shiftHours(shift('2026-10-27T13:00:00Z',null),now)).toBe(0);expect(shiftHours(shift('invalid',null),now)).toBe(0);});
 it('pays overtime at 1.5x after eight hours',()=>expect(payBreakdown([shift('2026-10-26T20:00:00Z','2026-10-27T06:00:00Z')],100,now)).toEqual({regular:8,overtime:2,basePay:800,overtimePay:300,total:1100}));
 it('does not count separate short shifts as overtime',()=>expect(payBreakdown([shift('2026-10-25T08:00:00Z','2026-10-25T14:00:00Z'),shift('2026-10-26T08:00:00Z','2026-10-26T14:00:00Z')],100,now).overtime).toBe(0));
 it('handles empty records',()=>expect(payBreakdown([],120,now).total).toBe(0));
});
describe('fatigue policy',()=>{
 it('flags long active shifts',()=>expect(fatigueReasons([shift('2026-10-26T22:00:00Z',null)],now)).toContain('Shift exceeds 12 hours'));
 it('allows twelve hours exactly',()=>expect(fatigueReasons([shift('2026-10-27T00:00:00Z',null)],now)).toEqual([]));
 it('flags short rest regardless of input order',()=>expect(fatigueReasons([shift('2026-10-27T04:00:00Z',null),shift('2026-10-26T10:00:00Z','2026-10-26T18:00:00Z')],now)).toContain('Less than 11 hours between shifts'));
 it('ignores hours before the rolling week for weekly total',()=>expect(fatigueReasons([shift('2026-10-01T00:00:00Z','2026-10-04T00:00:00Z')],now)).not.toContain('More than 48 hours this week'));
 it('flags weekly overload',()=>{const shifts=Array.from({length:5},(_,i)=>shift(new Date(now-(i*24+10)*3600000).toISOString(),new Date(now-i*24*3600000).toISOString()));expect(fatigueReasons(shifts,now)).toContain('More than 48 hours this week');});
});
