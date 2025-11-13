import React from 'react';

export default function DonationCard({ donation }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
      <h4 className="font-semibold">{donation.item_title}</h4>
      <p className="text-white/70 text-sm">Date: {new Date(donation.date).toLocaleDateString()}</p>
      {typeof donation.points_awarded === 'number' && (
        <p className="text-white/70 text-sm">Points: {donation.points_awarded}</p>
      )}
    </div>
  );
}

