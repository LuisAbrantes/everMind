const React = require('react');

function createComponent(name) {
  return function MockComponent(props) {
    return React.createElement(name, props, props.children);
  };
}

module.exports = {
  View: createComponent('View'),
  Text: createComponent('Text'),
  Pressable: createComponent('Pressable'),
  ScrollView: createComponent('ScrollView'),
  SafeAreaView: createComponent('SafeAreaView'),
  ActivityIndicator: createComponent('ActivityIndicator'),
  StyleSheet: {
    create: (styles) => styles,
  },
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default,
  },
};
