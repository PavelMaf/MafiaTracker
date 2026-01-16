import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './ui/Layout';
import Home from './pages/Home';
import NewGame from './pages/NewGame';
import RolesSetup from './pages/RolesSetup';
import Table from './pages/Table';
import Night from './pages/Night';
import Day from './pages/Day';
import Log from './pages/Log';
import RolesLibrary from './pages/RolesLibrary';
import SettingsPage from './pages/Settings';

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new" element={<NewGame />} />
      <Route path="/roles" element={<RolesSetup />} />
      <Route path="/table" element={<Table />} />
      <Route path="/night" element={<Night />} />
      <Route path="/day" element={<Day />} />
      <Route path="/log" element={<Log />} />
      <Route path="/roles-db" element={<RolesLibrary />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
);

export default App;
