'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Ticket, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function GatePassPage() {
  const { tenantSlug } = useParams();
  const [gatePasses, setGatePasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpToVerify, setOtpToVerify] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [verifyMsg, setVerifyMsg] = useState('');

  // form state for creating
  const [studentId, setStudentId] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [reason, setReason] = useState('');

  const fetchGatePasses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gatepass?tenantId=123`); // Use proper tenant ID mapping in production
      const data = await res.json();
      if (data.data) {
        setGatePasses(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantSlug) fetchGatePasses();
  }, [tenantSlug]);

  const handleVerify = async () => {
    setVerifyStatus('loading');
    setVerifyMsg('');
    try {
      const res = await fetch('/api/gatepass/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: '123', otp: otpToVerify })
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyStatus('success');
        setVerifyMsg(data.message);
        fetchGatePasses();
      } else {
        setVerifyStatus('error');
        setVerifyMsg(data.error);
      }
    } catch (err) {
      setVerifyStatus('error');
      setVerifyMsg('Network Error');
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/gatepass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: '123',
          studentId,
          parentName,
          parentPhone,
          reason
        })
      });
      if (res.ok) {
        setStudentId('');
        setParentName('');
        setParentPhone('');
        setReason('');
        fetchGatePasses();
        alert("Gate pass created and OTP generated!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed");
      }
    } catch (err) {
      alert("Network Error");
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-rose-600" />
            Gate Pass & Safety
          </h1>
          <p className="text-slate-500 mt-1">
            Issue exit passes and verify OTPs for early pickups.
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger render={
            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg hover:shadow-rose-500/20">
              <Ticket className="w-5 h-5 mr-2" />
              Issue New Pass
            </Button>
          } />
          <DialogContent>
             <DialogHeader>
               <DialogTitle>Issue Gate Pass</DialogTitle>
             </DialogHeader>
             <div className="space-y-4 pt-4">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Student DB ID</label>
                   <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="cl...student_id..." className="mt-1" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Parent Name</label>
                   <Input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="John Doe" className="mt-1" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Parent Phone</label>
                   <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+91 9876543210" className="mt-1" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Reason</label>
                   <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Medical emergency..." className="mt-1" />
                </div>
                <Button onClick={handleCreate} className="w-full bg-rose-600 hover:bg-rose-700">Generate OTP</Button>
             </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* OTP Verification Block */}
        <Card className="md:col-span-1 bg-gradient-to-br from-slate-900 to-black text-white border-0 shadow-2xl">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-emerald-400" /> Verify Exit OTP
             </CardTitle>
             <CardDescription className="text-slate-400">Validate a parent's OTP at the gate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Input 
                value={otpToVerify} 
                onChange={(e) => setOtpToVerify(e.target.value)} 
                type="text" 
                maxLength={6}
                placeholder="123456" 
                className="text-center text-4xl tracking-[0.5em] h-20 bg-slate-800/50 border-slate-700 text-emerald-400 font-black placeholder:text-slate-700"
              />
              <Button 
                onClick={handleVerify} 
                disabled={otpToVerify.length !== 6 || verifyStatus === 'loading'}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-wider rounded-xl transition-all"
              >
                {verifyStatus === 'loading' ? 'Verifying...' : 'Authorize Exit'}
              </Button>
              
              {verifyStatus === 'success' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                   <p className="text-sm font-bold text-emerald-400">{verifyMsg}</p>
                </div>
              )}
              {verifyStatus === 'error' && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                   <p className="text-sm font-bold text-rose-400">{verifyMsg}</p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* List of active passes */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
           <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between pb-4">
              <div>
                 <CardTitle>Today's Gate Passes</CardTitle>
                 <CardDescription>Live feed of requests and exits</CardDescription>
              </div>
           </CardHeader>
           <CardContent className="p-0">
             <div className="divide-y divide-slate-100">
               {gatePasses.length === 0 ? (
                 <div className="p-12 text-center text-slate-500 italic">No gate passes issued today.</div>
               ) : (
                 gatePasses.map((gp) => (
                   <div key={gp.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="space-y-1">
                         <h3 className="font-bold text-slate-900">{gp.studentName}</h3>
                         <p className="text-sm text-slate-500 flex items-center gap-2">
                            Requested by {gp.parentName} ({gp.parentPhone})
                         </p>
                         <p className="text-xs text-slate-400">Reason: {gp.reason}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         {gp.status === 'REQUESTED' ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                               <Clock className="w-3 h-3 mr-1" /> Pending Exit
                            </Badge>
                         ) : gp.status === 'VERIFIED' ? (
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                               <CheckCircle2 className="w-3 h-3 mr-1" /> Exited
                            </Badge>
                         ) : (
                            <Badge variant="outline">{gp.status}</Badge>
                         )}
                         {gp.status === 'REQUESTED' && (
                           <div className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded">
                             OTP: {gp.otp}
                           </div>
                         )}
                      </div>
                   </div>
                 ))
               )}
             </div>
           </CardContent>
        </Card>

      </div>
    </div>
  );
}
