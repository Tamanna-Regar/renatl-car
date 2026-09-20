import React, { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'http://127.0.0.1:8000';

export default function LiveFleetControlTower({ theme }) {
  const [telemetry, setTelemetry] = useState({});
  const [safetyEvents, setSafetyEvents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [journeyHistory, setJourneyHistory] = useState([]);
  const [connection, setConnection] = useState('connecting');

  useEffect(() => {
    let socket;
    let cancelled = false;

    const applySnapshot = (vehicles) => {
      setTelemetry((current) => ({
        ...current,
        ...vehicles.reduce((result, item) => {
          result[item.vehicle_id] = item;
          return result;
        }, {}),
      }));
    };

    fetch(`${API_URL}/api/fleet-live/snapshot`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Snapshot unavailable')))
      .then((data) => {
        if (!cancelled) applySnapshot(data.vehicles || []);
      })
      .catch(() => {
        if (!cancelled) setConnection('offline');
      });

    fetch(`${API_URL}/api/fleet-live/incidents`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Incidents unavailable')))
      .then((data) => {
        if (!cancelled) setIncidents(data.incidents || []);
      })
      .catch(() => {});

    fetch(`${API_URL}/api/fleet-live/history?limit=12`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('History unavailable')))
      .then((data) => {
        if (!cancelled) setJourneyHistory(data.history || []);
      })
      .catch(() => {});

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    socket = new WebSocket(`${protocol}://${window.location.hostname}:8000/ws/fleet-live`);
    socket.onopen = () => setConnection('live');
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'snapshot') applySnapshot(message.data || []);
      if (message.type === 'telemetry' && message.data?.vehicle_id) {
        setTelemetry((current) => ({ ...current, [message.data.vehicle_id]: message.data }));
        setJourneyHistory((current) => [message.data, ...current].slice(0, 12));
      }
      if (message.type === 'safety_event' && message.data?.vehicle_id) {
        setSafetyEvents((current) => [
          message.data,
          ...current.filter((event) => `${event.vehicle_id}-${event.type}` !== `${message.data.vehicle_id}-${message.data.type}`),
        ].slice(0, 6));
      }
      if (message.type === 'incident_created' && message.data?.incident_id) {
        setIncidents((current) => [message.data, ...current.filter((incident) => incident.incident_id !== message.data.incident_id)].slice(0, 8));
      }
      if (message.type === 'incident_updated' && message.data?.incident_id) {
        setIncidents((current) => current
          .map((incident) => incident.incident_id === message.data.incident_id ? { ...incident, status: message.data.status } : incident)
          .filter((incident) => incident.status !== 'resolved'));
      }
    };
    socket.onerror = () => setConnection('offline');
    socket.onclose = () => setConnection('offline');

    return () => {
      cancelled = true;
      socket?.close();
    };
  }, []);

  const vehicles = useMemo(() => Object.values(telemetry).sort((a, b) => (
    String(a.vehicle_id).localeCompare(String(b.vehicle_id))
  )), [telemetry]);
  const moving = vehicles.filter((vehicle) => Number(vehicle.speed_kmh) > 0).length;
  const geofenceWarnings = vehicles.filter((vehicle) => vehicle.geofence_status === 'outside').length;
  const averageEcoScore = vehicles.length
    ? Math.round(vehicles.reduce((sum, vehicle) => sum + Number(vehicle.eco_score ?? 0), 0) / vehicles.length)
    : 0;
  const averageCarbonIntensity = vehicles.length
    ? Math.round(vehicles.reduce((sum, vehicle) => sum + Number(vehicle.carbon_intensity_g_per_km ?? 0), 0) / vehicles.length)
    : 0;
  const mappedVehicles = vehicles.filter((vehicle) => Number.isFinite(Number(vehicle.latitude)) && Number.isFinite(Number(vehicle.longitude)));
  const mapCenter = mappedVehicles.length
    ? [Number(mappedVehicles[0].latitude), Number(mappedVehicles[0].longitude)]
    : [20.5937, 78.9629];
  const updateIncident = async (incidentId, status) => {
    const response = await fetch(`${API_URL}/api/fleet-live/incidents/${incidentId}?status=${status}`, { method: 'PATCH' });
    if (!response.ok) return;
    setIncidents((current) => current
      .map((incident) => incident.incident_id === incidentId ? { ...incident, status } : incident)
      .filter((incident) => incident.status !== 'resolved'));
  };

  return (
    <section className="live-control-tower" style={{ background: theme.surface, borderColor: theme.divider }}>
      <div className="live-control-header">
        <div>
          <div className="live-control-title">Real-time Fleet Control Tower</div>
          <div className="live-control-subtitle">Device telemetry stream, not a delayed dashboard snapshot</div>
        </div>
        <span className={`live-connection live-connection-${connection}`}>
          <span className="live-connection-dot" /> {connection === 'live' ? 'LIVE' : connection.toUpperCase()}
        </span>
      </div>

      <div className="live-control-metrics">
        <div><strong>{vehicles.length}</strong><span>Reporting</span></div>
        <div><strong>{moving}</strong><span>Moving now</span></div>
        <div><strong className={geofenceWarnings ? 'live-warning-text' : ''}>{geofenceWarnings}</strong><span>Geofence signals</span></div>
        <div><strong className={averageEcoScore >= 80 ? 'live-eco-good' : 'live-eco-watch'}>{averageEcoScore}/100</strong><span>Eco-drive score</span></div>
        <div><strong className={averageCarbonIntensity <= 100 ? 'live-eco-good' : 'live-eco-watch'}>{averageCarbonIntensity}</strong><span>Avg CO₂ g/km</span></div>
      </div>

      {safetyEvents.length > 0 && (
        <div className="live-safety-events">
          <div className="live-safety-events-title">Live Safety Guardian</div>
          {safetyEvents.map((event, index) => (
            <div className={`live-safety-event live-safety-event-${event.severity}`} key={`${event.vehicle_id}-${event.type}-${index}`}>
              <strong>{event.vehicle_id}</strong>
              <span>{event.message}</span>
            </div>
          ))}
        </div>
      )}

      {incidents.length > 0 && (
        <div className="live-incident-center">
          <div className="live-safety-events-title">Live Incident Command Center <span>{incidents.length} open</span></div>
          {incidents.slice(0, 4).map((incident) => (
            <div className="live-incident-row" key={incident.incident_id}>
              <div>
                <strong>{incident.vehicle_id}</strong>
                <span>{incident.message}</span>
              </div>
              <div className="live-incident-actions">
                {incident.status === 'open' && <button type="button" onClick={() => updateIncident(incident.incident_id, 'acknowledged')}>Acknowledge</button>}
                <button type="button" onClick={() => updateIncident(incident.incident_id, 'resolved')}>Resolve</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {journeyHistory.length > 0 && (
        <div className="live-journey-replay">
          <div className="live-safety-events-title">Digital Twin Journey Replay <span>latest {journeyHistory.length} signals</span></div>
          <div className="live-journey-track">
            {journeyHistory.map((point, index) => (
              <div className="live-journey-point" key={`${point.vehicle_id}-${point.recorded_at}-${index}`}>
                <span className="live-journey-dot" />
                <div>
                  <strong>{point.vehicle_id}</strong>
                  <span>{Number(point.speed_kmh || 0)} km/h · {point.fuel_level == null ? 'fuel n/a' : `${point.fuel_level}% fuel`}</span>
                </div>
                <time>{point.recorded_at ? new Date(point.recorded_at).toLocaleTimeString() : 'now'}</time>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="live-fleet-map">
        <div className="live-safety-events-title">Live Fleet Radar <span>{mappedVehicles.length} location signals</span></div>
        {mappedVehicles.length === 0 ? (
          <div className="live-map-empty">GPS coordinates aate hi vehicles live map par appear honge.</div>
        ) : (
          <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={false} className="live-map">
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {mappedVehicles.map((vehicle) => (
              <CircleMarker
                key={`map-${vehicle.vehicle_id}`}
                center={[Number(vehicle.latitude), Number(vehicle.longitude)]}
                radius={vehicle.geofence_status === 'outside' ? 10 : 7}
                pathOptions={{
                  color: vehicle.geofence_status === 'outside' ? '#ef4444' : '#22d3ee',
                  fillColor: vehicle.geofence_status === 'outside' ? '#ef4444' : '#22d3ee',
                  fillOpacity: 0.8,
                }}
              >
                <Popup>
                  <strong>{vehicle.vehicle_id}</strong><br />
                  {Number(vehicle.speed_kmh || 0)} km/h · {vehicle.ignition ? 'Moving/ignition on' : 'Parked'}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className="live-empty-state">Connect a vehicle device or send telemetry to <code>/api/fleet-live/telemetry</code> to see live signals here.</div>
      ) : (
        <div className="live-vehicle-grid">
          {vehicles.map((vehicle) => (
            <div className="live-vehicle-card" key={vehicle.vehicle_id}>
              <div className="live-vehicle-name">{vehicle.vehicle_id}</div>
              <div className="live-vehicle-readings">
                <span>{Number(vehicle.speed_kmh || 0)} km/h</span>
                <span>{vehicle.fuel_level == null ? '—' : `${vehicle.fuel_level}% fuel`}</span>
                <span>{vehicle.battery_level == null ? '—' : `${vehicle.battery_level}% battery`}</span>
                <span className={Number(vehicle.eco_score) >= 80 ? 'live-eco-good' : 'live-eco-watch'}>{vehicle.eco_score ?? '—'}/100 eco</span>
                <span className={Number(vehicle.carbon_intensity_g_per_km) <= 100 ? 'live-eco-good' : 'live-eco-watch'}>{vehicle.carbon_intensity_g_per_km ?? '—'} g/km CO₂</span>
                <span className={Number(vehicle.estimated_range_km) < 30 ? 'live-warning-text' : 'live-eco-good'}>
                  {vehicle.estimated_range_km == null ? '—' : `${vehicle.estimated_range_km} km range`}
                </span>
                <span className={vehicle.trip_status === 'Arriving soon' ? 'live-eco-good' : 'live-eco-watch'}>
                  {vehicle.eta_minutes == null ? 'ETA —' : `ETA ${vehicle.eta_minutes} min`}
                </span>
                <span className={vehicle.traffic_factor >= 1.5 ? 'live-warning-text' : 'live-eco-good'}>
                  {vehicle.traffic_label || 'Traffic —'}
                </span>
              </div>
              <div className={Number(vehicle.estimated_range_km) < 100 ? 'live-energy-watch' : 'live-energy-ready'}>
                {vehicle.energy_status || 'Energy status unavailable'}
              </div>
              <div className="live-trip-status">
                {vehicle.trip_status || 'Trip status unavailable'}
                {vehicle.remaining_distance_km == null ? '' : ` · ${vehicle.remaining_distance_km} km remaining`}
                {vehicle.traffic_factor == null ? '' : ` · ${vehicle.traffic_factor}x traffic`}
              </div>
              <div className={vehicle.geofence_status === 'outside' ? 'live-status-outside' : 'live-status-ok'}>
                {vehicle.geofence_status === 'outside' ? 'Outside geofence' : 'Geofence clear'} · {vehicle.ignition ? 'Ignition on' : 'Parked'}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
