import React from 'react';
import GlobeVisualization from './components/GlobeVisualization';

const App: React.FC = () => (
  <div style={{ fontFamily: 'sans-serif', background: '#f4f7fa', minHeight: '100vh' }}>
    <header style={{ padding: '2rem', textAlign: 'center', background: '#2194ce', color: '#fff' }}>
      <h1>VERDANT</h1>
      <p>
        Real-Time Global Climate Simulation and Visualization Platform
      </p>
    </header>
    <main style={{ padding: '2rem', maxWidth: 1200, margin: 'auto' }}>
      <section style={{ marginBottom: '2rem' }}>
        <GlobeVisualization />
      </section>
    </main>
    <footer style={{ textAlign: 'center', padding: '1rem', background: '#e5eaf0', color: '#444' }}>
      &copy; {new Date().getFullYear()} Climate Nexus
    </footer>
  </div>
);

export default App;