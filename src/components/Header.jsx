import NumericInput from './NumericInput.jsx';
import { settingsRules } from '../lib/validation.js';

export default function Header({ settings, onSettingChange, children }) {
  return (
    <header className="app-header">
      <div>
        <h1>Kanban Calculator</h1>
        <p className="subtitle">Size kanban loops and simulate a supermarket</p>
        {children}
      </div>
      <div className="settings">
        <label className="setting">
          <span>Working hours/day</span>
          <NumericInput
            label="Working hours per day"
            value={settings.workingHoursPerDay}
            rule={settingsRules.workingHoursPerDay}
            onCommit={(value) => onSettingChange('workingHoursPerDay', value)}
          />
        </label>
        <label className="setting">
          <span>Simulation days</span>
          <NumericInput
            label="Simulation days"
            value={settings.simulationDays}
            rule={settingsRules.simulationDays}
            onCommit={(value) => onSettingChange('simulationDays', value)}
          />
        </label>
      </div>
    </header>
  );
}
