import React from 'react';
import { EXCHANGE_STATUSES } from '../constants/enums';

export default function ExchangeCard({ request, onAccept, onReject }) {
  const isValidStatus = EXCHANGE_STATUSES.includes(request.status);
  const status = isValidStatus ? request.status : 'Pending';
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Accepted': return 'bg-green-500/80';
      case 'Rejected': return 'bg-red-500/80';
      case 'Pending': return 'bg-yellow-500/80';
      default: return 'bg-white/10';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{request.requested_title || request.item_title || 'Item'}</h4>
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>{status}</span>
      </div>
      <p className="text-white/70 text-sm">
        {request.is_sent ? 'To' : 'From'}: {request.owner_name || request.requester_name || request.from_user_name || 'User'}
      </p>
      {request.offered_title && (
        <p className="text-white/70 text-sm">Offers: {request.offered_title}</p>
      )}
      {typeof request.offered_points === 'number' && request.offered_points > 0 && (
        <p className="text-white/70 text-sm">Points: {request.offered_points}</p>
      )}
      {request.requested_image && (
        <img src={request.requested_image} alt={request.requested_title} className="w-20 h-20 object-cover rounded mt-2" />
      )}
      {request.offered_image && (
        <div className="mt-2">
          <p className="text-white/60 text-xs mb-1">Your item:</p>
          <img src={request.offered_image} alt={request.offered_title} className="w-20 h-20 object-cover rounded" />
        </div>
      )}
      {status === 'Pending' && !request.is_sent && (
        <div className="flex gap-2 pt-2">
          {onAccept && <button onClick={() => onAccept(request)} className="px-3 py-1 rounded bg-brand-500 hover:bg-brand-600">Accept</button>}
          {onReject && <button onClick={() => onReject(request)} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Reject</button>}
        </div>
      )}
    </div>
  );
}

