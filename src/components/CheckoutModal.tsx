import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Play, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const { 
    activeCheckoutSong, 
    closeCheckout, 
    currentUser, 
    onPaymentSuccess, 
    playSong, 
    setCurrentView,
    siteSettings,
    showToast 
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('devotee@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Ashok Kumar');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'gashok7094@gmail.com');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+91 98765 43210');

  if (!activeCheckoutSong) return null;

  const song = activeCheckoutSong;
  const isAlreadyPurchased = currentUser?.purchasedSongIds.includes(song.id) || currentUser?.role === 'ADMIN';

  const handleSimulatePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: song.id,
          userId: currentUser?.id || 'usr-devotee'
        })
      });

      const orderData = await orderRes.json();

      // 2. Simulate Razorpay Gateway confirmation delay
      await new Promise(r => setTimeout(r, 1200));

      // 3. Backend verifies signature and records purchase
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewayOrderId: orderData.gatewayOrderId || `order_RZP_${Date.now()}`,
          gatewayPaymentId: `pay_RZP_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          songId: song.id,
          userId: currentUser?.id || 'usr-devotee',
          userName: customerName,
          userEmail: customerEmail
        })
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        setIsSuccess(true);
        setDownloadToken(verifyData.downloadToken);
        onPaymentSuccess(verifyData.order, verifyData.downloadToken);

        // Confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F0C75E', '#E58A32', '#FFFFFF']
        });
      } else {
        showToast('Payment verification error', 'error');
      }
    } catch {
      showToast('Network error during checkout verification', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadMaster = () => {
    // Trigger lossless master audio download simulation
    const blob = new Blob([
      `NAAD DIVINE - SACRED AUDIO CERTIFICATE & MASTER LICENSE\n` +
      `=====================================================\n` +
      `Title: ${song.title}\n` +
      `Vocalist: ${song.credits.singer}\n` +
      `Composer: ${song.credits.composer}\n` +
      `Raga: ${song.raga || 'Bhairav'}\n` +
      `Tuning: 432Hz Solfeggio Sacred Frequency\n` +
      `Format: 24-bit 96kHz Lossless WAV Master\n` +
      `Issued To: ${customerName} (${customerEmail})\n` +
      `License Token: ${downloadToken || 'SIGNED_AUTHENTIC_2026'}\n` +
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `Thank you for supporting authentic sacred devotional music.`
    ], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title.replace(/\s+/g, '_')}_432Hz_Master_Audio.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Downloading Lossless Master Audio for "${song.title}" ✨`, 'success');
  };

  return (
    <div
      id="checkout-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in"
      onClick={closeCheckout}
    >
      <div
        id="checkout-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl bg-[#121212] border border-[#D4AF37]/40 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.2)] flex flex-col overflow-hidden animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-5 bg-[#161616] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#E52020] bg-[#FFDE00] flex-shrink-0 shadow-md">
              <img
                src="/logo.png"
                alt="Subam Audio"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/logo.png'; }}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isSuccess || isAlreadyPurchased ? 'Sacred Audio License Ready' : 'Secure Razorpay Checkout'}
              </h3>
              <p className="text-xs text-[#888888]">
                Subam Audio Records • 256-Bit Encrypted
              </p>
            </div>
          </div>

          <button
            onClick={closeCheckout}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#CCCCCC] hover:text-white border border-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Post-Purchase Success Screen */}
          {isSuccess || isAlreadyPurchased ? (
            <div className="text-center space-y-6 py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-bold text-white font-serif">
                  Your Sacred Audio Is Ready
                </h3>
                <p className="text-xs text-[#A8A8A8] max-w-sm mx-auto">
                  {isAlreadyPurchased
                    ? 'You have already unlocked this track. Stream in full audio anytime or download the lossless master file.'
                    : 'Payment verified successfully. You now have lifetime ownership of the 432Hz Lossless Master recording.'}
                </p>
              </div>

              {/* Unlocked Song Card */}
              <div className="p-4 rounded-xl bg-[#161616] border border-[#D4AF37]/30 flex items-center gap-4 text-left max-w-md mx-auto">
                <img
                  src={song.coverImage}
                  alt={song.title}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg'; }}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    MASTER UNLOCKED
                  </span>
                  <h4 className="text-sm font-bold text-white truncate mt-1">{song.title}</h4>
                  <p className="text-xs text-[#888888] truncate">{song.credits.singer}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <button
                  onClick={() => {
                    playSong(song, false);
                    closeCheckout();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#1F1F1F] hover:bg-[#282828] border border-white/10 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current text-[#D4AF37]" />
                  <span>Play Full Master</span>
                </button>

                <button
                  onClick={handleDownloadMaster}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F0C75E] text-black font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download WAV Master</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentView('account');
                    closeCheckout();
                  }}
                  className="text-xs text-[#F0C75E] hover:underline"
                >
                  Go to My Library & Download Center →
                </button>
              </div>
            </div>
          ) : (
            /* Purchase Details & Payment Form */
            <div className="space-y-6">
              
              {/* Order Summary Box */}
              <div className="p-4 rounded-xl bg-[#161616] border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={song.coverImage}
                    alt={song.title}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg'; }}
                    className="w-14 h-14 rounded-lg object-cover border border-[#D4AF37]/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{song.title}</h4>
                    <p className="text-xs text-[#888888]">{song.credits.singer}</p>
                    <span className="text-[10px] text-[#D4AF37]">432Hz 24-bit FLAC / WAV Master Audio</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-[#F0C75E] font-mono">
                    ₹{song.price}
                  </span>
                  <p className="text-[10px] text-[#777777]">Inc. GST</p>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#CCCCCC] block">
                  Devotee Contact Details (For Digital License Receipt)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-white/10 text-xs text-white outline-none focus:border-[#D4AF37]"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-white/10 text-xs text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#CCCCCC] block">
                  Select Payment Method
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'UPI'
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F0C75E]'
                        : 'bg-[#161616] border-white/10 text-[#888888] hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI / GPay / PhonePe</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'CARD'
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F0C75E]'
                        : 'bg-[#161616] border-white/10 text-[#888888] hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('NETBANKING')}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'NETBANKING'
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F0C75E]'
                        : 'bg-[#161616] border-white/10 text-[#888888] hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* Input depending on method */}
                {paymentMethod === 'UPI' && (
                  <div className="p-3 rounded-xl bg-[#161616] border border-white/5 space-y-1.5">
                    <span className="text-[11px] text-[#888888]">Virtual Payment Address (VPA):</span>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#1E1E1E] border border-white/10 text-xs text-white font-mono outline-none"
                    />
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="p-3 rounded-xl bg-[#161616] border border-white/5 space-y-1.5">
                    <span className="text-[11px] text-[#888888]">Card Number:</span>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#1E1E1E] border border-white/10 text-xs text-white font-mono outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Total & Pay Button */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#888888]">Total Amount Payable:</span>
                  <span className="text-xl font-bold text-[#F0C75E] font-mono">₹{song.price}.00</span>
                </div>

                <button
                  id="razorpay-pay-submit-btn"
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F0C75E] text-[#070707] font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying with Razorpay Engine...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{song.price} & Unlock Master Audio</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#777777]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Razorpay Verified Gateway • Backend Cryptographic Signature Verification</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
