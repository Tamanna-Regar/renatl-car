import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const API_URL = 'https://renatl-car-ie8p.onrender.com';

export default function Inspection() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const vehicleType = new URLSearchParams(location.search).get('vehicle_type') || 'car';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [inspectionType, setInspectionType] = useState('check_in');
  const [odometer, setOdometer] = useState('');
  const [fuelLevel, setFuelLevel] = useState(50);
  const [conditionNotes, setConditionNotes] = useState('');
  const [photoUrls, setPhotoUrls] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [helmetIssued, setHelmetIssued] = useState(0);
  const [helmetReturned, setHelmetReturned] = useState(0);
  const [helmetCondition, setHelmetCondition] = useState('good');
  const [safetyChecks, setSafetyChecks] = useState({ brakes: false, lights: false, tyres: false });
  const [status, setStatus] = useState('');
  const [comparison, setComparison] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submitInspection = async (event) => {
    event.preventDefault();
    setStatus('');
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          user_email: user.email || 'guest@gmail.com',
          inspection_type: inspectionType,
          odometer: Number(odometer),
          fuel_level: Number(fuelLevel),
          condition_notes: conditionNotes.trim(),
          photo_urls: photoUrls.split(',').map((url) => url.trim()).filter(Boolean),
          confirmed,
          helmet_count_issued: Number(helmetIssued),
          helmet_count_returned: Number(helmetReturned),
          helmet_condition: helmetCondition,
          brakes_checked: safetyChecks.brakes,
          lights_checked: safetyChecks.lights,
          tyres_checked: safetyChecks.tyres,
          safety_confirmed: Object.values(safetyChecks).every(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Inspection could not be saved.');
      setStatus(data.message);
      if (inspectionType === 'check_out') {
        const comparisonResponse = await fetch(`${API_URL}/api/bookings/${bookingId}/inspection/comparison`);
        const comparisonData = await comparisonResponse.json();
        if (comparisonResponse.ok) setComparison(comparisonData);
      }
      setTimeout(() => navigate('/my-bookings'), inspectionType === 'check_out' ? 4200 : 1600);
    } catch (error) {
      setStatus(error.message || 'Inspection could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadingPhotos(true);
    setStatus('');
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_URL}/api/uploads`, { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Photo upload failed.');
        uploaded.push(`${API_URL}${data.url}`);
      }
      setPhotoUrls((current) => [current, ...uploaded].filter(Boolean).join(', '));
      setStatus(`${uploaded.length} photo${uploaded.length === 1 ? '' : 's'} uploaded.`);
    } catch (error) {
      setStatus(error.message || 'Photo upload failed.');
    } finally {
      setUploadingPhotos(false);
      event.target.value = '';
    }
  };

  return (
    <main className="inspection-page">
      <section className="inspection-card">
        <p className="inspection-eyebrow">Digital handover record</p>
        <h1>Vehicle Inspection</h1>
        <p className="inspection-subtitle">
          Record the vehicle condition before pickup or after return for booking <strong>#{bookingId}</strong>.
        </p>

        <form onSubmit={submitInspection} className="inspection-form">
          <div className="inspection-toggle">
            <button type="button" className={inspectionType === 'check_in' ? 'active' : ''} onClick={() => setInspectionType('check_in')}>Check-in / Pickup</button>
            <button type="button" className={inspectionType === 'check_out' ? 'active' : ''} onClick={() => setInspectionType('check_out')}>Check-out / Return</button>
          </div>

          <label>
            Odometer reading (km)
            <input type="number" min="0" value={odometer} onChange={(event) => setOdometer(event.target.value)} required />
          </label>

          <label>
            Fuel level: <strong>{fuelLevel}%</strong>
            <input type="range" min="0" max="100" value={fuelLevel} onChange={(event) => setFuelLevel(event.target.value)} />
          </label>

          <label>
            Condition notes
            <textarea rows="4" value={conditionNotes} onChange={(event) => setConditionNotes(event.target.value)} placeholder="Mention scratches, dents, cleanliness, accessories, or missing items." />
          </label>

          <label>
            Photo URLs <span>(optional, comma separated)</span>
            <input type="text" value={photoUrls} onChange={(event) => setPhotoUrls(event.target.value)} placeholder="https://example.com/front.jpg, https://example.com/side.jpg" />
            <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple onChange={uploadPhotos} disabled={uploadingPhotos} />
            <small>{uploadingPhotos ? 'Uploading photos...' : 'Upload JPG, PNG, WEBP, or PDF files (max 10 MB each).'}</small>
          </label>

          {vehicleType.toLowerCase() === 'bike' && <fieldset className="inspection-bike-safety">
            <legend>Bike safety checklist</legend>
            <label>
              Helmets issued
              <input type="number" min="0" value={helmetIssued} onChange={(event) => setHelmetIssued(event.target.value)} />
            </label>
            <label>
              Helmets returned
              <input type="number" min="0" max={helmetIssued} value={helmetReturned} onChange={(event) => setHelmetReturned(event.target.value)} />
            </label>
            <label>
              Helmet condition
              <select value={helmetCondition} onChange={(event) => setHelmetCondition(event.target.value)}>
                <option value="good">Good</option>
                <option value="worn">Worn</option>
                <option value="damaged">Damaged</option>
                <option value="missing">Missing</option>
              </select>
            </label>
            <div className="inspection-checks">
              {Object.entries({ brakes: 'Brakes checked', lights: 'Lights checked', tyres: 'Tyres checked' }).map(([key, label]) => (
                <label key={key} className="inspection-confirm">
                  <input type="checkbox" checked={safetyChecks[key]} onChange={(event) => setSafetyChecks({ ...safetyChecks, [key]: event.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>}

          <label className="inspection-confirm">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            I confirm that these odometer, fuel, and condition details are accurate.
          </label>

          {status && <div className="inspection-status">{status}</div>}
          {comparison?.comparison_available && (
            <div className="inspection-status" style={{ textAlign: 'left', background: '#fff7ed', color: '#9a3412' }}>
              <strong>Smart return comparison</strong>
              <div>Distance travelled: {comparison.distance_travelled_km} km</div>
              <div>Fuel change: {comparison.fuel_delta_percent}%</div>
              <div>New damage indicators: {comparison.new_damage_indicators.length ? comparison.new_damage_indicators.join(', ') : 'None detected'}</div>
              <div>Estimated deposit adjustment: Rs {comparison.deposit_adjustment_estimate}</div>
              <div><strong>{comparison.recommendation}</strong></div>
            </div>
          )}

          <div className="inspection-actions">
            <button type="button" className="secondary" onClick={() => navigate('/my-bookings')}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save inspection'}</button>
          </div>
        </form>
      </section>
    </main>
  );
}
