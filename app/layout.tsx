import type { Metadata } from 'next';
import {Provider} from '@/components/provider';
import './globals.css';
export const metadata:Metadata={title:'FairShift · Decent Work Platform',description:'Fairer shifts, safer workplaces. A multi-sector SDG 8 demonstration.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><Provider>{children}</Provider></body></html>;}
