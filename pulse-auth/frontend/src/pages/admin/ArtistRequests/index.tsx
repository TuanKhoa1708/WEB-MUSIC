import { useState } from 'react';
import { motion } from 'framer-motion';
import { Inbox, Check, X, Eye, AlertTriangle } from 'lucide-react';
import { useAdminArtistRequests, useApproveArtistRequest, useRejectArtistRequest, useApproveRevokeRequest } from '@/hooks/useArtistRequests';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { ArtistRequest } from '@/types/artistRequest.types';
import toast from 'react-hot-toast';

export function ArtistRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const { data: requests = [], isLoading } = useAdminArtistRequests(statusFilter === 'all' ? undefined : statusFilter);
  const { mutateAsync: approveRequest, isPending: isApproving } = useApproveArtistRequest();
  const { mutateAsync: rejectRequest, isPending: isRejecting } = useRejectArtistRequest();
  const { mutateAsync: approveRevoke, isPending: isApprovingRevoke } = useApproveRevokeRequest();

  const [approveTarget, setApproveTarget] = useState<ArtistRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ArtistRequest | null>(null);
  const [revokeApproveTarget, setRevokeApproveTarget] = useState<ArtistRequest | null>(null);

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    try {
      await approveRequest(approveTarget._id);
      toast.success('Artist request approved!');
      setApproveTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    try {
      await rejectRequest({ id: rejectTarget._id, adminMessage: 'Does not meet criteria' });
      toast.success('Artist request rejected.');
      setRejectTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleRevokeApproveConfirm = async () => {
    if (!revokeApproveTarget) return;
    try {
      await approveRevoke(revokeApproveTarget._id);
      toast.success('Artist role revoked and songs deleted.');
      setRevokeApproveTarget(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve revocation');
    }
  };

  const columns: Column<ArtistRequest>[] = [
    {
      key: 'user',
      header: 'User',
      render: (row) => {
        const user = row.userId as any;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>
                {user?.fullName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{user?.fullName || 'Unknown User'}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{user?.email || ''}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'stageName',
      header: 'Stage Name',
      render: (row) => (
        <span style={{ fontSize: 13, fontWeight: 600, color: '#3FD6FF' }}>{row.stageName}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span style={{
          fontSize: 12,
          color: row.type === 'revoke_artist' ? '#FF5B5B' : '#3FD6FF',
          fontWeight: 600,
          background: row.type === 'revoke_artist' ? 'rgba(255,91,91,0.1)' : 'rgba(63,214,255,0.1)',
          padding: '4px 8px',
          borderRadius: 4
        }}>
          {row.type === 'revoke_artist' ? 'Revoke Role' : 'Become Artist'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => {
        let color = '#F7B500';
        let bg = 'rgba(247,181,0,0.1)';
        if (row.status === 'approved' || row.status === 'revoke_approved') {
          color = '#3DDC84';
          bg = 'rgba(61,220,132,0.1)';
        } else if (row.status === 'rejected' || row.status === 'revoke_pending') {
          color = '#FF5B5B';
          bg = 'rgba(255,91,91,0.1)';
        }
        return (
          <span style={{
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            background: bg,
            color: color,
            textTransform: 'uppercase'
          }}>
            {row.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Date',
      align: 'right',
      render: (row) => (
        <span style={{ fontSize: 12, color: '#444' }}>
          {new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
          {row.status === 'pending' && (
            <>
              <ActionBtn icon={<Check size={14} strokeWidth={3} />} title="Approve" color="#3DDC84" onClick={() => setApproveTarget(row)} />
              <ActionBtn icon={<X size={14} strokeWidth={3} />} title="Reject" color="#FF5B5B" onClick={() => setRejectTarget(row)} />
            </>
          )}
          {row.status === 'revoke_pending' && (
             <ActionBtn icon={<AlertTriangle size={14} strokeWidth={3} />} title="Approve Revocation" color="#FF5B5B" onClick={() => setRevokeApproveTarget(row)} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '28px', minHeight: '100%' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(63,214,255,0.08)', border: '1px solid rgba(63,214,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3FD6FF' }}>
            <Inbox size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Artist Requests</h1>
            <p style={{ fontSize: 13, color: '#444', marginTop: 4 }}>Review applications from users wanting to become artists</p>
          </div>
        </div>
      </motion.div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}
      >
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 13, outline: 'none' }}
          >
            <option value="pending">Pending Application</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="revoke_pending">Pending Revocation</option>
            <option value="revoke_approved">Revoked</option>
            <option value="all">All Requests</option>
          </select>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={requests}
          keyExtractor={(row) => row._id}
          isLoading={isLoading}
          skeletonRows={5}
        />
      </motion.div>

      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        open={!!approveTarget}
        title="Approve Artist Application"
        description={`Are you sure you want to approve ${approveTarget?.stageName}? This will grant them artist privileges.`}
        confirmLabel="Approve"
        cancelLabel="Cancel"
        variant="primary"
        isLoading={isApproving}
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Confirm Reject Dialog */}
      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject Artist Application"
        description={`Are you sure you want to reject the application for ${rejectTarget?.stageName}?`}
        confirmLabel="Reject"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isRejecting}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
      />

      {/* Confirm Revoke Dialog */}
      <ConfirmDialog
        open={!!revokeApproveTarget}
        title="Approve Role Revocation"
        description={
          <div>
            <p style={{ marginBottom: 12 }}>Are you sure you want to approve revocation for <strong>{revokeApproveTarget?.stageName}</strong>?</p>
            {revokeApproveTarget?.revokeReason && (
              <div style={{ padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 12, fontSize: 13, fontStyle: 'italic', color: '#aaa' }}>
                " {revokeApproveTarget.revokeReason} "
              </div>
            )}
            <p style={{ color: '#FF5B5B', fontWeight: 600 }}>This will delete ALL their songs and remove their artist privileges permanently.</p>
          </div>
        }
        confirmLabel="Approve Revocation"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isApprovingRevoke}
        onConfirm={handleRevokeApproveConfirm}
        onCancel={() => setRevokeApproveTarget(null)}
      />
    </div>
  );
}

function ActionBtn({ icon, title, color, onClick }: any) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 30, height: 30, borderRadius: 8, background: 'transparent', border: '1px solid transparent',
        color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}12`;
        e.currentTarget.style.color = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#666';
      }}
    >
      {icon}
    </button>
  );
}
