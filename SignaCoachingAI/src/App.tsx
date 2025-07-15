// React import removed since it's not used directly
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import VoiceOnlyScreen from '@/pages/VoiceOnlyScreen';
import '@/styles/globals.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/voice" element={<VoiceOnlyScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;