import React, { useState, useEffect } from 'react';
import { 
  checkSimpleDashboardSetup,
  setupSimpleDashboardSystem,
  migrateExistingUsers,
  getMigrationStatus,
  testSimpleDashboardSystem
} from '../utils/migrationUtils';

/**
 * Migration Panel Component
 * 
 * This component provides an admin interface for migrating from the old
 * complex dashboard system to the new simplified user-owned system.
 */
const MigrationPanel = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Load migration status on component mount
  useEffect(() => {
    loadMigrationStatus();
  }, []);

  const loadMigrationStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const migrationStatus = await getMigrationStatus();
      setStatus(migrationStatus);
      addLog(`Migration status loaded: ${migrationStatus.message}`, 'success');
    } catch (err) {
      setError(err.message);
      addLog(`Error loading status: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSystem = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('Setting up simplified dashboard system...', 'info');
      const result = await setupSimpleDashboardSystem();
      
      if (result.success) {
        addLog('System setup completed successfully!', 'success');
        await loadMigrationStatus(); // Refresh status
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      addLog(`Setup failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('Starting user migration...', 'info');
      const result = await migrateExistingUsers();
      
      if (result.success) {
        addLog(`Migration completed: ${result.message}`, 'success');
        addLog(`Successfully migrated: ${result.successful} users`, 'success');
        if (result.failed > 0) {
          addLog(`Failed migrations: ${result.failed} users`, 'warning');
        }
        await loadMigrationStatus(); // Refresh status
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      addLog(`Migration failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSystem = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use a test user ID (you might want to make this configurable)
      const testUserId = 'test-user-' + Date.now();
      addLog(`Testing system with user ID: ${testUserId}`, 'info');
      
      const result = await testSimpleDashboardSystem(testUserId);
      
      if (result.success) {
        addLog('System test passed successfully!', 'success');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      addLog(`Test failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.status) {
      case 'ready': return 'text-green-600 bg-green-50 border-green-200';
      case 'not_setup': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard System Migration
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Migrate from the complex system/user override architecture to the simplified user-owned dashboard system.
        </p>
      </div>

      {/* Status Card */}
      {status && (
        <div className={`p-4 rounded-lg border mb-6 ${getStatusColor(status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">System Status</h3>
              <p className="text-sm mt-1">{status.message}</p>
            </div>
            <button
              onClick={loadMigrationStatus}
              disabled={loading}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          
          {status.stats && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Users</div>
                <div>{status.stats.uniqueUsers}</div>
              </div>
              <div>
                <div className="font-medium">Dashboards</div>
                <div>{status.stats.totalDashboards}</div>
              </div>
              <div>
                <div className="font-medium">Initialized</div>
                <div>{status.stats.initializedUsers}</div>
              </div>
              <div>
                <div className="font-medium">Templates</div>
                <div>{status.stats.templatesAvailable}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <div className="text-red-800 font-medium">Error</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <button
            onClick={() => setError(null)}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleSetupSystem}
          disabled={loading || status?.status === 'ready'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting up...' : 'Setup System'}
        </button>
        
        <button
          onClick={handleMigrateUsers}
          disabled={loading || status?.status !== 'ready'}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Migrating...' : 'Migrate Users'}
        </button>
        
        <button
          onClick={handleTestSystem}
          disabled={loading || status?.status !== 'ready'}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test System'}
        </button>
      </div>

      {/* Migration Steps */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Migration Steps</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>Run the SQL migration script to create new tables</li>
          <li>Click "Setup System" to create dashboard templates</li>
          <li>Click "Migrate Users" to copy templates to existing users</li>
          <li>Click "Test System" to verify everything works</li>
          <li>Update your application to use the new SimpleDashboard component</li>
          <li>Remove old dashboard system files (manual cleanup)</li>
        </ol>
      </div>

      {/* Logs */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white">Migration Logs</h3>
          <button
            onClick={clearLogs}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear
          </button>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-sm">No logs yet</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  <span className="text-gray-400">[{log.timestamp}]</span>
                  <span className={`ml-2 ${getLogColor(log.type)}`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationPanel;
