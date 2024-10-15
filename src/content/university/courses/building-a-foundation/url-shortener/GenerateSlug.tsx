import React, { useState } from 'react';

function intToSlug(n: number): string {
  const chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let s = '';
  while (n > 0) {
    s = chars[n % 62] + s;
    n = parseInt(n / 62);
  }
  return s || '0';
}

function GenerateSlug() {
  const [inputValue, setInputValue] = useState('');
  const [slugOutput, setSlugOutput] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setSlugOutput(intToSlug(parseInt(event.target.value)));
  };

  return (
    <div className="converter-box">
      <input
        name="ident"
        className="input-field"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter a number..."
      />
      <p>Slug Output:</p>
      <input
        name="slug"
        className="output-field"
        readOnly
        value={slugOutput}
      />
    </div>
  );
}

export default GenerateSlug;
