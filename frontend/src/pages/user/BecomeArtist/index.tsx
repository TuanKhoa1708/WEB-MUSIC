import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic2, Link, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApplyArtist, useMyArtistRequest } from '@/hooks/useArtistRequests';
import toast from 'react-hot-toast';

export function BecomeArtistPage() {
  const navigate = useNavigate();
  const { data: request, isLoading } = useMyArtistRequest();
  const { mutateAsync: apply, isPending } = useApplyArtist();

  const [formData, setFormData] = useState({
    stageName: '',
    bio: '',
    facebook: '',
    instagram: '',
    youtube: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stageName) {
      toast.error('Stage name is required');
      return;
    }

    try {
      await apply({
        stageName: formData.stageName,
        bio: formData.bio,
        socialLinks: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          youtube: formData.youtube,
        }
      });
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  if (isLoading) {
    return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>Loading...</div>;
  }

  // If user already has a pending or approved request
  if (request) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090909', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: 480,
            width: '100%',
            background: '#111',
            borderRadius: 24,
            padding: 40,
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          {request.status === 'pending' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(247,181,0,0.1)', color: '#F7B500', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Mic2 size={32} />
              </div>
              <h2 style={{ fontSize: 24, color: '#fff', marginBottom: 12 }}>Application Pending</h2>
              <p style={{ color: '#888', fontSize: 15, lineHeight: 1.5, marginBottom: 24 }}>
                We have received your application to become an artist. Our team is currently reviewing it. Please check back later!
              </p>
            </>
          )}

          {request.status === 'approved' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(61,220,132,0.1)', color: '#3DDC84', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: 24, color: '#fff', marginBottom: 12 }}>Congratulations!</h2>
              <p style={{ color: '#888', fontSize: 15, lineHeight: 1.5, marginBottom: 24 }}>
                Your application has been approved. You are now an artist on Pulse.
              </p>
              <button
                onClick={() => navigate('/artist/dashboard')}
                style={{
                  background: '#3FD6FF',
                  color: '#000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Go to Artist Dashboard
              </button>
            </>
          )}

          {request.status === 'rejected' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,91,91,0.1)', color: '#FF5B5B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Mic2 size={32} />
              </div>
              <h2 style={{ fontSize: 24, color: '#fff', marginBottom: 12 }}>Application Rejected</h2>
              <p style={{ color: '#888', fontSize: 15, lineHeight: 1.5, marginBottom: 24 }}>
                Unfortunately, your application to become an artist was rejected. 
                {request.adminMessage && <><br /><br /><strong>Reason:</strong> {request.adminMessage}</>}
              </p>
            </>
          )}

          {request.status !== 'approved' && (
            <button
              onClick={() => navigate('/home')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 12,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 12
              }}
            >
              Back to Home
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090909', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          alignSelf: 'flex-start', 
          background: 'transparent', 
          border: 'none', 
          color: '#888', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 32,
          padding: '8px 16px',
          borderRadius: 8
        }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 600,
          width: '100%',
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mic2 size={32} color="#3FD6FF" /> Become an Artist
        </h1>
        <p style={{ color: '#888', fontSize: 15, marginBottom: 32 }}>
          Share your music with the world. Apply for an artist account today.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Stage Name */}
          <div>
            <label style={{ display: 'block', color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Stage Name <span style={{ color: '#FF5B5B' }}>*</span></label>
            <input
              type="text"
              value={formData.stageName}
              onChange={(e) => setFormData(p => ({ ...p, stageName: e.target.value }))}
              placeholder="e.g. The Weeknd"
              style={{
                width: '100%',
                background: '#111',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '14px 16px',
                borderRadius: 12,
                color: '#fff',
                fontSize: 15,
                outline: 'none'
              }}
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label style={{ display: 'block', color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Biography</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell us a bit about your musical journey..."
              rows={4}
              style={{
                width: '100%',
                background: '#111',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '14px 16px',
                borderRadius: 12,
                color: '#fff',
                fontSize: 15,
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Social Links */}
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16, fontWeight: 600 }}>Social Links (Optional)</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link size={20} color="#1877F2" />
                <input
                  type="url"
                  placeholder="Facebook URL"
                  value={formData.facebook}
                  onChange={(e) => setFormData(p => ({ ...p, facebook: e.target.value }))}
                  style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8, color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link size={20} color="#E4405F" />
                <input
                  type="url"
                  placeholder="Instagram URL"
                  value={formData.instagram}
                  onChange={(e) => setFormData(p => ({ ...p, instagram: e.target.value }))}
                  style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8, color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link size={20} color="#FF0000" />
                <input
                  type="url"
                  placeholder="YouTube URL"
                  value={formData.youtube}
                  onChange={(e) => setFormData(p => ({ ...p, youtube: e.target.value }))}
                  style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8, color: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              background: 'linear-gradient(135deg, #3FD6FF, #2094ff)',
              color: '#000',
              border: 'none',
              padding: '16px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.7 : 1,
              marginTop: 12
            }}
          >
            {isPending ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
