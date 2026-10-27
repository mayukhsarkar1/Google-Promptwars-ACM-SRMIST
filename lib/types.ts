export type Sector = 'Construction' | 'Campus';
export type Language = 'en' | 'hi' | 'ta' | 'te';
export type TicketStatus = 'Open' | 'In progress' | 'Resolved';
export interface Worker { id: string; name: string; role: string; sector: Sector; site: string; rate: number; sentiment: number; skills: string[] }
export interface Shift { id: string; workerId: string; start: string; end: string | null }
export interface Ticket { id: string; sector: Sector; category: string; description: string; status: TicketStatus; createdAt: string }
export interface Platform { workers: Worker[]; shifts: Shift[]; tickets: Ticket[] }
