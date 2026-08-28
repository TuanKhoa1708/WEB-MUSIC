import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Check, Shield, Loader2, AlertCircle } from 'lucide-react'
import { useDemoConfirmPayment } from '@/hooks/listener/useSubscription'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import type { SubscriptionPackage } from '@/types/subscription.types'

export function MoMoPaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshUser } = useAuth()
  const confirmPayment = useDemoConfirmPayment()

  const plan: SubscriptionPackage | undefined = location.state?.plan
  const orderId: string | undefined = location.state?.orderId

  const [step, setStep] = useState<'scan' | 'verifying' | 'success'>('scan')
  
  // Guard
  useEffect(() => {
    if (!plan || !orderId) {
      toast.error('Invalid payment session.')
      navigate('/listener/premium')
    }
  }, [plan, orderId, navigate])

  if (!plan || !orderId) return null

  const handleConfirmPayment = async () => {
    setStep('verifying')

    try {
      const res = await confirmPayment.mutateAsync({
        orderId,
        packageId: plan._id,
        paymentMethod: 'MOMO',
      })

      if (res.paymentStatus === 'COMPLETED') {
        // Success!
        setStep('success')
        
        // Optimistically update AuthContext so the rest of the app knows immediately
        refreshUser({
          isPremium: true,
          subscriptionPlan: 'premium',
          subscriptionExpiresAt: res.expiresAt || null,
        })

        // Redirect to success page after a short delay
        setTimeout(() => {
          navigate('/listener/premium/success', { 
            replace: true, 
            state: { plan, transactionId: res.transactionId, orderId: res.orderId } 
          })
        }, 1500)
      } else {
        throw new Error(res.message || 'Payment verification failed.')
      }
    } catch (err: any) {
      setStep('scan')
      toast.error(err?.message || 'Payment failed. Please try again.')
    }
  }

  // A mock Momo deep link URI for the QR
  const qrPayload = `momo://pay?amount=${plan.price}&orderId=${orderId}&merchantName=PulseMusic`

  return (
    <div style={{ padding: '40px 24px', maxWidth: 640, margin: '0 auto', minHeight: '80vh' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/listener/premium')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: '#666',
          cursor: 'pointer', fontSize: 14, fontWeight: 500,
          marginBottom: 28, padding: 0, transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
      >
        <ArrowLeft size={16} /> Cancel Payment
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        style={{
          background: '#fff',
          borderRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(165,0,100,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          background: '#A50064',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              Thanh toán bằng MoMo
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
              Mở ứng dụng MoMo để quét mã
            </p>
          </div>
          <div style={{
            background: '#fff', color: '#A50064',
            padding: '6px 12px', borderRadius: 8,
            fontSize: 16, fontWeight: 900,
          }}>
            MoMo
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '40px 32px', display: 'flex', gap: 40, alignItems: 'center', flexDirection: 'column' }}>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
              Số tiền thanh toán
            </p>
            <p style={{ fontSize: 40, fontWeight: 900, color: '#A50064', margin: 0, lineHeight: 1 }}>
              {plan.price.toLocaleString('vi-VN')} <span style={{ fontSize: 24, fontWeight: 700, color: '#666' }}>VND</span>
            </p>
            <p style={{ fontSize: 13, color: '#888', marginTop: 12 }}>
              Đơn hàng: <b>{orderId}</b>
            </p>
          </div>

          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 20,
            border: '2px dashed #A50064',
            position: 'relative',
          }}>
            {/* React QR Code rendering the mock payload */}
            <QRCodeSVG
              value={qrPayload}
              size={240}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
            {/* Logo overlay on QR */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff', padding: 6, borderRadius: 8,
            }}>
              <div style={{
                background: '#A50064', width: 40, height: 40, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 800,
              }}>
                MoMo
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ textAlign: 'center', maxWidth: 320 }}>
            <ol style={{ textAlign: 'left', color: '#444', fontSize: 14, lineHeight: 1.6, paddingLeft: 20, margin: '0 0 24px 0' }}>
              <li>Mở ứng dụng <b>MoMo</b> trên điện thoại.</li>
              <li>Chọn <b>Quét mã</b> và quét mã QR trên.</li>
              <li>Nhấn <b>"Đã thanh toán"</b> bên dưới để hoàn tất (Demo Mode).</li>
            </ol>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 24, color: '#E6007E' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>This is a Demo Payment Environment</span>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={step !== 'scan'}
              style={{
                width: '100%', height: 52, borderRadius: 14,
                background: step === 'success' ? '#4CAF50' : '#A50064',
                border: 'none', color: '#fff',
                fontSize: 16, fontWeight: 800, cursor: step === 'scan' ? 'pointer' : 'wait',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.3s',
                boxShadow: step === 'scan' ? '0 8px 24px rgba(165,0,100,0.3)' : 'none',
              }}
            >
              {step === 'verifying' && <><Loader2 size={18} className="animate-spin" /> Đang xác nhận...</>}
              {step === 'success' && <><Check size={18} /> Giao dịch thành công</>}
              {step === 'scan' && 'Tôi Đã Hoàn Tất Thanh Toán'}
            </button>
          </div>

        </div>
        
        {/* Footer info */}
        <div style={{
          background: '#f8f8f8', padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          borderTop: '1px solid #eee'
        }}>
          <Shield size={14} color="#666" />
          <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
            Thanh toán an toàn bởi hệ thống MoMo Demo
          </span>
        </div>
      </motion.div>
    </div>
  )
}
