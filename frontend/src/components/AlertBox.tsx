import React, { SyntheticEvent } from 'react';
import { Snackbar, Alert, SnackbarCloseReason } from '@mui/material';

interface AlertBoxProps {
  id: number;
  open: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  onClose: () => void;
}

const AlertBox: React.FC<AlertBoxProps> = ({ id, open, message, severity, onClose }) => {
  /*
  * Close the alert box, when the user clicks on the close button or after 3 seconds.
  */
  const handleClose = (_event: Event | SyntheticEvent<typeof Snackbar, Event>, reason: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };
  return (
    <Snackbar key={id} open={open} autoHideDuration={3000} onClose={handleClose}>
      <Alert onClose={onClose} severity={severity} variant='filled'>
        {message}
      </Alert>
    </Snackbar>
  );
};

interface AlertBoxContextProps {
  addAlert: (message: string, severity: 'error' | 'warning' | 'info' | 'success') => void;
}

/*
* Context to manage the alerts in the application.
*/
const AlertBoxContext = React.createContext<AlertBoxContextProps>({
  addAlert: () => {
    throw new Error('addAlert function not implemented');
  }
});

interface AlertBoxProviderProps {
  children: React.ReactNode;
}

export const AlertBoxProvider: React.FC<AlertBoxProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = React.useState<AlertBoxProps[]>([]);
  const nextId = React.useRef(0);

  /*
   * Adds an alert with the given message and severity.
   */
  const addAlert = (message: string, severity: 'error' | 'warning' | 'info' | 'success') => {
    const id = nextId.current++;
    setAlerts(prevAlerts => [...prevAlerts, { id, open: true, message, severity, onClose: () => closeAlert(id) }]);
  };

  /**
   * Close the alert with the given id.
   */
  const closeAlert = (id: number) => {
    setAlerts(prevAlert => prevAlert.filter(alert => alert.id !== id));
  };

  return (
    <AlertBoxContext.Provider value={{ addAlert }}>
      {children}
      {alerts.map((alert) => (
        <AlertBox key={alert.id} {...alert} />
      ))}
    </AlertBoxContext.Provider>
  );
};

// Custom hook to use the AlertBox context
// Use this to add alerts from any component
export const useAlertBox = () => {
  return React.useContext(AlertBoxContext);
};
