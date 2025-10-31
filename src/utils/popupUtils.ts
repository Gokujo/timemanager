let popupWindow: Window | null = null;

/**
 * Opens a popup window with the time display
 * All data is loaded from localStorage
 */
export const openTimePopup = (): void => {
  // Close existing popup if open
  if (popupWindow && !popupWindow.closed) {
    closeTimePopup();
  }

  // Open popup without parameters - all data comes from localStorage
  const popupUrl = `${window.location.origin}/popup.html`;

  // Open a new popup window
  popupWindow = window.open(
    popupUrl,
    'TimePopup',
    'width=500,height=600,top=100,left=100,location=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no,status=no'
  );

  if (!popupWindow) {
    alert('Popup wurde blockiert. Bitte erlaube Popups für diese Seite.');
    return;
  }

  // Focus the popup window
  popupWindow.focus();
};

/**
 * Closes the popup window if it's open
 */
export const closeTimePopup = (): void => {
  if (popupWindow && !popupWindow.closed) {
    popupWindow.close();
    popupWindow = null;
  }
};
