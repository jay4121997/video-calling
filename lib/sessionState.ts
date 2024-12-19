type Session = {
    user: string; // Either "me" or "wife"
    instanceId: string; // A unique identifier for the session
    timestamp: number; // Timestamp of the session
  };
  
  // In-memory session store
  let activeSession: Session | null = null;
  
  // Function to set a session
  export function setSession(user: string, instanceId: string) {
    activeSession = { user, instanceId, timestamp: Date.now() };
  }
  
  // Function to get the active session
  export function getSession() {
    return activeSession;
  }
  
  // Function to clear the session
  export function clearSession(instanceId: string) {
    if (activeSession?.instanceId === instanceId) {
      activeSession = null;
    }
  }
  