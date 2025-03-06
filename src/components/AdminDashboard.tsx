
import React, { useState, useEffect } from 'react';
import { EditTrackingService } from '../services/edit-tracking.service';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const editTracker = EditTrackingService.getInstance();

  useEffect(() => {
    const statistics = editTracker.getStatistics();
    setStats(statistics);
  }, []);

  if (!stats) {
    return <div className="p-4">Loading statistics...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Extraction Analysis Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Sessions</h2>
          <p className="text-3xl font-bold">{stats.totalSessions}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Sessions With Edits</h2>
          <p className="text-3xl font-bold">{stats.sessionsWithEdits}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalSessions > 0 
              ? `${((stats.sessionsWithEdits / stats.totalSessions) * 100).toFixed(1)}% of sessions required edits`
              : 'No sessions recorded'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Edits</h2>
          <p className="text-3xl font-bold">{stats.totalEdits}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.sessionsWithEdits > 0 
              ? `${(stats.totalEdits / stats.sessionsWithEdits).toFixed(1)} edits per session (avg)`
              : 'No edits recorded'}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Edits by Field</h2>
        {Object.keys(stats.editsByField).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(stats.editsByField)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(([field, count]) => (
                <div key={field} className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">{field}</span>
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">
                      {count} edits ({((count as number / stats.totalEdits) * 100).toFixed(1)}%)
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div 
                      style={{ width: `${((count as number / stats.totalEdits) * 100).toFixed(1)}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No field edits recorded yet</p>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">AI Accuracy Analysis</h2>
        
        {stats.totalSessions > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Overall AI Accuracy</span>
              <span className="font-semibold">
                {stats.sessionsWithEdits === 0 
                  ? '100%' 
                  : `${(100 - (stats.sessionsWithEdits / stats.totalSessions) * 100).toFixed(1)}%`}
              </span>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-700 mb-2">Suggestions for Improvement</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                {Object.entries(stats.editsByField)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .slice(0, 3)
                  .map(([field]) => (
                    <li key={field}>Improve recognition of "{field}" field</li>
                  ))}
                {Object.keys(stats.editsByField).length === 0 && (
                  <li>No specific improvements needed based on current data</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No data available for analysis</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
