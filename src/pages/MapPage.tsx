import React, { useState, useEffect, useCallback } from 'react';
import { plotsData } from '../data/plots';
import type { Plot } from '../data/plots';
import { InteractiveMap } from '../components/InteractiveMap';
import { BookingModal } from '../components/BookingModal';

type BookingStep = 'idle' | 'form' | 'success';

export const MapPage: React.FC = () => {
  const [plots, setPlots] = useState<Plot[]>(plotsData);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>('idle');
  const [bookedPlotId, setBookedPlotId] = useState<string | null>(null);

  // Fetch live plot statuses from server
  const fetchPlots = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/plots`);
      if (!res.ok) return;
      const serverPlots: Plot[] = await res.json();
      // Merge server statuses into client plotsData (client has full geometry data)
      setPlots(prev => prev.map(p => {
        const serverPlot = serverPlots.find(sp => sp.id === p.id);
        return serverPlot ? { ...p, status: serverPlot.status } : p;
      }));
    } catch {
      // Server offline — use local data
    }
  }, []);

  useEffect(() => { fetchPlots(); }, [fetchPlots]);

  const handleSelectPlot = (plot: Plot) => {
    setSelectedPlot(plot);
    if (plot.type === 'utility') return;
    if (plot.status === 'booked' || plot.status === 'blocked' || plot.status === 'pending') return;
    setBookingStep('form');
  };

  const handleBooked = (plotId: string) => {
    setBookedPlotId(plotId);
    setBookingStep('success');
    // Optimistically update UI to pending
    setPlots(prev => prev.map(p => p.id === plotId ? { ...p, status: 'pending' } : p));
  };

  const handleCloseModal = () => {
    setBookingStep('idle');
    setSelectedPlot(null);
  };

  const handleSuccessClose = () => {
    setBookingStep('idle');
    setSelectedPlot(null);
    setBookedPlotId(null);
    fetchPlots(); // Refresh
  };

  const bookedPlot = bookedPlotId ? plots.find(p => p.id === bookedPlotId) : null;

  return (
    <div className="w-full h-full bg-[#e6f2ec] overflow-hidden p-4 flex items-center justify-center">
      <div className="w-full h-full max-w-full max-h-full flex items-center justify-center">
        <InteractiveMap
          plots={plots}
          onSelectPlot={handleSelectPlot}
          selectedPlot={selectedPlot}
        />
      </div>

      {/* Booking Form Modal */}
      {bookingStep === 'form' && selectedPlot && (
        <BookingModal
          plot={selectedPlot}
          onClose={handleCloseModal}
          onBooked={handleBooked}
        />
      )}

      {/* Success Modal */}
      {bookingStep === 'success' && bookedPlot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400, textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{ width: 56, height: 56, background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 style={{ fontWeight: 800, color: '#059669', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Booking Submitted!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Your booking request for <strong>Plot {bookedPlot.id}</strong> has been submitted successfully.
              The admin will review and confirm your booking shortly.
            </p>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1rem', margin: '1.25rem 0', fontSize: '0.82rem', color: '#166534' }}>
              <div><strong>Plot {bookedPlot.id}</strong></div>
              <div style={{ marginTop: '0.5rem', color: '#d97706', fontWeight: 600 }}>Status: Pending Approval</div>
            </div>
            <button className="btn btn-primary" onClick={handleSuccessClose} style={{ width: '100%' }}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Status tooltip for non-bookable plots */}
      {selectedPlot && bookingStep === 'idle' && (selectedPlot.status !== 'available' || selectedPlot.type === 'utility') && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', padding: '0.6rem 1.25rem',
          borderRadius: '2rem', fontSize: '0.82rem', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 500,
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {selectedPlot.type === 'utility'
            ? `${selectedPlot.id} is a utility plot`
            : selectedPlot.status === 'booked'
            ? `Plot ${selectedPlot.id} is already booked`
            : selectedPlot.status === 'pending'
            ? `Plot ${selectedPlot.id} has a pending booking`
            : `Plot ${selectedPlot.id} is blocked`}
          <button onClick={() => setSelectedPlot(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', marginLeft: '0.25rem' }}>x</button>
        </div>
      )}
    </div>
  );
};
