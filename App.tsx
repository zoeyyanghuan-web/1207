import React, { useState } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';

const App: React.FC = () => {
  const [isFormed, setIsFormed] = useState(true);

  const toggleFormed = () => {
    setIsFormed((prev) => !prev);
  };

  return (
    <div className="relative w-full h-full bg-black">
      <Experience isFormed={isFormed} />
      <Overlay isFormed={isFormed} toggleFormed={toggleFormed} />
    </div>
  );
};

export default App;
