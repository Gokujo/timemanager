import { createRoot } from 'react-dom/client';
import React from 'react';
import PopupDisplay from '../components/PopupDisplay';

let popupWindow: Window | null = null;
let popupRoot: ReturnType<typeof createRoot> | null = null;
let updateInterval: number | null = null;

/**
 * Opens a popup window with the time display
 */
export const openTimePopup = (
  workedMinutes: number,
  plannedWork: number,
  endTime: string,
  getUpdatedValues?: () => { workedMinutes: number; plannedWork: number; endTime: string }
): void => {
  // Close existing popup if open
  if (popupWindow && !popupWindow.closed) {
    closeTimePopup();
  }

  // Open a new popup window without browser UI elements
  // Use specific dimensions and simplified parameters for better browser compatibility
  popupWindow = window.open(
    '',
    'TimePopup',
    'width=600,height=400,top=100,left=100,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no'
  );

  if (!popupWindow) {
    alert('Popup wurde blockiert. Bitte erlaube Popups für diese Seite.');
    return;
  }

  // Add basic styles to the popup document
  const popupDoc = popupWindow.document;
  popupDoc.title = 'Arbeitszeit';

  // Add the same CSS as the main app
  // Load index.css
  const indexCssLink = popupDoc.createElement('link');
  indexCssLink.rel = 'stylesheet';
  indexCssLink.href = window.location.origin + '/index.css';
  popupDoc.head.appendChild(indexCssLink);

  // Add critical styles directly to ensure they're applied
  const styleElement = popupDoc.createElement('style');
  styleElement.textContent = `
    /* Tailwind utility classes used in the popup */
    .h-screen { height: 100vh; }
    .w-screen { width: 100vw; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .justify-center { justify-content: center; }
    .items-center { align-items: center; }
    .p-2 { padding: 0.5rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .p-10 { padding: 2.5rem; }
    .m-2 { margin: 0.5rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-5xl { font-size: 3rem; line-height: 1; }
    .text-6xl { font-size: 3.75rem; line-height: 1; }
    .text-7xl { font-size: 4.5rem; line-height: 1; }
    .font-bold { font-weight: 700; }
    .text-white { color: white; }
    .text-center { text-align: center; }
    .bg-white/20 { background-color: rgba(255, 255, 255, 0.2); }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .absolute { position: absolute; }
    .bottom-4 { bottom: 1rem; }
    .left-4 { left: 1rem; }
    .right-4 { right: 1rem; }
    .cursor-pointer { cursor: pointer; }

    /* Responsive breakpoints */
    @media (min-width: 640px) {
      .sm\\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .sm\\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
      .sm\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
      .sm\\:text-5xl { font-size: 3rem; line-height: 1; }
      .sm\\:text-6xl { font-size: 3.75rem; line-height: 1; }
      .sm\\:p-6 { padding: 1.5rem; }
      .sm\\:p-8 { padding: 2rem; }
      .sm\\:mb-2 { margin-bottom: 0.5rem; }
      .sm\\:mb-4 { margin-bottom: 1rem; }
    }

    @media (min-width: 768px) {
      .md\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
      .md\\:text-6xl { font-size: 3.75rem; line-height: 1; }
      .md\\:text-7xl { font-size: 4.5rem; line-height: 1; }
      .md\\:p-8 { padding: 2rem; }
      .md\\:p-10 { padding: 2.5rem; }
    }

    /* Background gradient */
    .bg-gradient-to-br { background: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
    .from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0)); }
    .to-purple-600 { --tw-gradient-to: #9333ea; }

    /* Status colors */
    .status-green { background-color: #10b981; }
    .status-yellow { background-color: #f59e0b; }
    .status-red { background-color: #ef4444; }

    /* Glass effect - without borders */
    .glass-effect {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    }
  `;
  popupDoc.head.appendChild(styleElement);

  // Create a container for our React component
  const container = popupDoc.createElement('div');
  container.id = 'popup-root';
  popupDoc.body.appendChild(container);

  // Set body styles to remove margins
  popupDoc.body.style.margin = '0';
  popupDoc.body.style.padding = '0';
  popupDoc.body.style.overflow = 'hidden';

  // Create a root for the container
  popupRoot = createRoot(container);

  // Function to render or update the component
  const renderPopup = (
    workedMins: number,
    plannedWorkMins: number,
    endTimeStr: string
  ) => {
    popupRoot?.render(
      React.createElement(PopupDisplay, {
        workedMinutes: workedMins,
        plannedWork: plannedWorkMins,
        endTime: endTimeStr
      })
    );
  };

  // Initial render
  renderPopup(workedMinutes, plannedWork, endTime);

  // Keep the popup updated - force immediate update and use requestAnimationFrame for better performance
  const updatePopup = () => {
    if (popupWindow && !popupWindow.closed) {
      if (getUpdatedValues) {
        try {
          // Get fresh values and update the popup
          const { workedMinutes: newWorked, plannedWork: newPlanned, endTime: newEndTime } = getUpdatedValues();
          renderPopup(newWorked, newPlanned, newEndTime);
        } catch (error) {
          console.error('Error updating popup:', error);
        }

        // Schedule next update
        if (popupWindow) {
          popupWindow.requestAnimationFrame(updatePopup);
        }
      }
    } else {
      if (updateInterval !== null) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    }
  };

  // Start the update loop immediately
  if (popupWindow) {
    try {
      popupWindow.requestAnimationFrame(updatePopup);
    } catch (error) {
      console.error('Error starting requestAnimationFrame:', error);
    }
  }

  // Fallback interval as a safety measure - update more frequently (every 100ms)
  updateInterval = window.setInterval(() => {
    if (popupWindow && !popupWindow.closed && getUpdatedValues) {
      try {
        const { workedMinutes: newWorked, plannedWork: newPlanned, endTime: newEndTime } = getUpdatedValues();
        renderPopup(newWorked, newPlanned, newEndTime);
      } catch (error) {
        console.error('Error in fallback update:', error);
      }
    } else if (!popupWindow || popupWindow.closed) {
      if (updateInterval !== null) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    }
  }, 100); // Update every 100ms as fallback for smoother updates
};

/**
 * Closes the popup window if it's open
 */
export const closeTimePopup = (): void => {
  if (popupWindow && !popupWindow.closed) {
    // Unmount the React component and clean up the root
    if (popupRoot) {
      popupRoot.unmount();
      popupRoot = null;
    }

    // Clear the update interval
    if (updateInterval !== null) {
      clearInterval(updateInterval);
      updateInterval = null;
    }

    popupWindow.close();
    popupWindow = null;
  }
};
