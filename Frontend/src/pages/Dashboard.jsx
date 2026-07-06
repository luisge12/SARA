import React from 'react';
import { Card } from '../components/Card';
import { Users, Activity, CalendarCheck, TrendingUp } from 'lucide-react';
import './Dashboard.css';

export function Dashboard() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="dashboard-subtitle">Welcome back, Dr. Smith. Here is your summary for today.</p>
        </div>
        <div className="dashboard-actions">
          {/* We could place date pickers or export buttons here */}
          <span className="current-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      <div className="kpi-grid">
        <Card className="kpi-card">
          <div className="kpi-content">
            <div>
              <p className="kpi-label">Total Patients</p>
              <h3 className="kpi-value">1,248</h3>
              <p className="kpi-trend positive"><TrendingUp size={14} /> +12% this month</p>
            </div>
            <div className="kpi-icon-wrapper primary-light">
              <Users size={24} className="kpi-icon" />
            </div>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-content">
            <div>
              <p className="kpi-label">Today's Appointments</p>
              <h3 className="kpi-value">24</h3>
              <p className="kpi-trend neutral">4 remaining</p>
            </div>
            <div className="kpi-icon-wrapper accent-light">
              <CalendarCheck size={24} className="kpi-icon" />
            </div>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-content">
            <div>
              <p className="kpi-label">Critical Alerts</p>
              <h3 className="kpi-value">3</h3>
              <p className="kpi-trend negative">Requires attention</p>
            </div>
            <div className="kpi-icon-wrapper alert-light">
              <Activity size={24} className="kpi-icon" />
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-main-grid">
        <Card title="Patient Overview" className="patient-overview-card">
          <div className="placeholder-chart">
             {/* Future charting library goes here */}
             <div className="chart-bars">
               <div className="chart-bar" style={{height: '60%'}}></div>
               <div className="chart-bar" style={{height: '80%'}}></div>
               <div className="chart-bar" style={{height: '40%'}}></div>
               <div className="chart-bar" style={{height: '90%'}}></div>
               <div className="chart-bar" style={{height: '70%'}}></div>
               <div className="chart-bar" style={{height: '100%', backgroundColor: 'var(--color-accent)'}}></div>
               <div className="chart-bar" style={{height: '50%'}}></div>
             </div>
             <p className="chart-caption">Weekly Patient Influx</p>
          </div>
        </Card>

        <Card title="Upcoming Appointments" action={<button className="btn btn-outline" style={{padding: '0.25rem 0.75rem', fontSize: '0.75rem'}}>View All</button>}>
          <div className="appointment-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="appointment-item">
                <div className="appointment-time">
                  <span className="time">09:{i * 15} AM</span>
                  <span className="duration">30 min</span>
                </div>
                <div className="appointment-details">
                  <h4>Jane Doe {i}</h4>
                  <p>General Checkup</p>
                </div>
                <div className="appointment-status status-confirmed">Confirmed</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
