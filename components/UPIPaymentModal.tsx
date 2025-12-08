import React, { useState } from 'react';
import { X, Check, Copy, Smartphone, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export const UPIPaymentModal = ({ isOpen, onClose, onSuccess }: UPIPaymentModalProps) => {
  const { success, error } = useToast();
  const [amount, setAmount] = useState<string>('100');
  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const [upiApp, setUpiApp] = useState<string>('');

  // Mock UPI ID for the platform
  const PLATFORM_UPI_ID = "assignmate@upi"; 
  const PLATFORM_NAME = "AssignMate Services";

  const handleAmountSelect = (val: string) => setAmount(val);

  const handleProceed = () => {
    const val = parseInt(amount);
    if (!val || val < 10) {
      error("Minimum amount is ₹10");
      return;
    }
    setStep('payment');
  };

  const handlePaymentSimulation = () => {
    // In a real app, this would verify the transaction with a backend
    setTimeout(() => {
      onSuccess(parseInt(amount));
      success(`₹${amount} added to wallet successfully!`);
      onClose();
      setStep('amount');
    }, 2000);
  };

  // Generate UPI Intent Link
  // format: upi://pay?pa=<upi_id>&pn=<name>&am=<amount>&cu=INR
  const getUPILink = () => {
    return `upi://pay?pa=${PLATFORM_UPI_ID}&pn=${encodeURIComponent(PLATFORM_NAME)}&am=${amount}&cu=INR`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-orange-600 p-4 flex justify-between items-center text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Smartphone size={20}/> Add Money
            </h3>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {step === 'amount' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-slate-500 text-sm font-medium mb-2">Enter Amount</p>
                  <div className="relative inline-block">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold text-slate-800 text-center focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['50', '100', '200', '500'].map((val) => (
                    <button 
                      key={val}
                      onClick={() => handleAmountSelect(val)}
                      className={`py-2 rounded-xl text-sm font-bold border transition-all ${amount === val ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'}`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleProceed}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Pay
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Paying</p>
                  <h2 className="text-3xl font-extrabold text-slate-900">₹{amount}</h2>
                </div>

                {/* UPI Apps Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <a href={getUPILink()} onClick={handlePaymentSimulation} className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-orange-200 transition-all cursor-pointer">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Google_Pay_Logo.svg" className="h-6 mb-2" alt="GPay"/>
                    <span className="text-xs font-bold text-slate-600">Google Pay</span>
                  </a>
                  <a href={getUPILink()} onClick={handlePaymentSimulation} className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-orange-200 transition-all cursor-pointer">
                    <img src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" className="h-6 mb-2" alt="PhonePe"/>
                    <span className="text-xs font-bold text-slate-600">PhonePe</span>
                  </a>
                  <a href={getUPILink()} onClick={handlePaymentSimulation} className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-orange-200 transition-all cursor-pointer">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" className="h-6 mb-2" alt="Paytm"/>
                    <span className="text-xs font-bold text-slate-600">Paytm</span>
                  </a>
                  <button onClick={() => setStep('amount')} className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                    <span className="text-xs font-bold">Change Amount</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-slate-400 font-bold">OR SCAN QR</span>
                  </div>
                </div>

                <div className="flex justify-center">
                   <div className="p-3 bg-white border-2 border-slate-900 rounded-xl relative group cursor-pointer" onClick={handlePaymentSimulation}>
                      <QrCode size={120} className="text-slate-900"/>
                      <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-slate-900 text-sm">
                        Click to Simulate<br/>Success
                      </div>
                   </div>
                </div>
                
                <p className="text-[10px] text-center text-slate-400">
                  Secure payments via UPI. <br/> Money is added to your AssignMate wallet instantly.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
