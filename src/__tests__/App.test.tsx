import React from 'react';
import App from '../../App';

describe('App (Application Root)', () => {
  it('should be defined and render cleanly', () => {
    expect(App).toBeDefined();
    const element = App();
    expect(element).toBeDefined();
  });
});
