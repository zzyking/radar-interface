import React from 'react';
import CameraView from './components/CameraView';
import DraggableChatWindow from './components/DraggableChatWindow';

function App() {
  return (
    <div className="App">
      <CameraView/>
      <DraggableChatWindow/>
    </div>
  );
}

export default App;