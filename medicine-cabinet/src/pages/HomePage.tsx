import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMedicines } from '../hooks/useMedicines';
import { calculateExpiryInfo, isExpired, isExpiringSoon } from '../utils/expiryUtils';
import { isLowStock } from '../utils/lowStockUtils';

export const HomePage = () => {
  const { user } = useAuth();
  const { medicines, loading } = useMedicines();

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p className="text-muted mt-2">Loading...</p>
      </div>
    );
  }

  // Calculate alerts
  const lowStockMeds = medicines.filter(m => isLowStock(m.quantity, m.initialQuantity));
  const expiringSoonMeds = medicines.filter(m => isExpiringSoon(m.expiryDate));
  const expiredMeds = medicines.filter(m => isExpired(m.expiryDate));
  
  const totalAlerts = lowStockMeds.length + expiringSoonMeds.length + expiredMeds.length;

  // Get recently added (last 3)
  const recentlyAdded = [...medicines]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const getUserName = () => {
    if (!user?.email) return 'Welcome';
    const name = user.email.split('@')[0];
    return `Welcome, ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)' }}>
      <h1>{getUserName()}</h1>
      
      {/* Medicine Cabinet Summary */}
      <div className="card mb-3">
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
          Medicine Cabinet
        </h2>
        <div className="flex justify-between" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <div>
            <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '600' }}>
              {medicines.length}
            </span>
            <p className="text-muted" style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
              Total medicines
            </p>
          </div>
          {totalAlerts > 0 && (
            <div>
              <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '600', color: 'var(--color-warning)' }}>
                {totalAlerts}
              </span>
              <p className="text-muted" style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                Alerts
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {totalAlerts > 0 && (
        <div className="mb-3">
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
            ⚠️ Alerts
          </h2>
          
          {expiredMeds.length > 0 && (
            <div className="alert alert-danger mb-2">
              <strong>{expiredMeds.length} Expired:</strong>
              <ul style={{ margin: 'var(--spacing-sm) 0 0', paddingLeft: 'var(--spacing-md)' }}>
                {expiredMeds.slice(0, 3).map(m => (
                  <li key={m.id}>{m.name}</li>
                ))}
                {expiredMeds.length > 3 && <li>And {expiredMeds.length - 3} more...</li>}
              </ul>
            </div>
          )}
          
          {expiringSoonMeds.length > 0 && (
            <div className="alert alert-warning mb-2">
              <strong>{expiringSoonMeds.length} Expiring Soon:</strong>
              <ul style={{ margin: 'var(--spacing-sm) 0 0', paddingLeft: 'var(--spacing-md)' }}>
                {expiringSoonMeds.slice(0, 3).map(m => (
                  <li key={m.id}>
                    {m.name} ({calculateExpiryInfo(m.expiryDate).displayText})
                  </li>
                ))}
                {expiringSoonMeds.length > 3 && <li>And {expiringSoonMeds.length - 3} more...</li>}
              </ul>
            </div>
          )}
          
          {lowStockMeds.length > 0 && (
            <div className="alert alert-warning">
              <strong>{lowStockMeds.length} Low Stock:</strong>
              <ul style={{ margin: 'var(--spacing-sm) 0 0', paddingLeft: 'var(--spacing-md)' }}>
                {lowStockMeds.slice(0, 3).map(m => (
                  <li key={m.id}>{m.name}</li>
                ))}
                {lowStockMeds.length > 3 && <li>And {lowStockMeds.length - 3} more...</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <div className="mb-3">
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
            Recently Added
          </h2>
          <div className="card" style={{ padding: 0 }}>
            {recentlyAdded.map(medicine => (
              <Link
                key={medicine.id}
                to={`/medicines/${medicine.id}`}
                className="list-item"
                style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-xs)' }}>
                      {medicine.name}
                    </h3>
                    <p className="text-muted" style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                      {medicine.quantity} {medicine.unit} • Expires: {new Date(medicine.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-3">
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
          Quick Actions
        </h2>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <Link to="/add-medicine" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Medicine
          </Link>
          <Link to="/shopping-list" className="btn btn-secondary">
            🛒 Shopping List
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {medicines.length === 0 && (
        <div className="text-center" style={{ padding: 'var(--spacing-xl)' }}>
          <h2>Your medicine cabinet is empty</h2>
          <p className="text-muted">Add your first medicine to get started.</p>
          <Link to="/add-medicine" className="btn btn-primary">
            + Add Medicine
          </Link>
        </div>
      )}
    </div>
  );
};
