import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider, extendTheme, type ThemeConfig } from '@chakra-ui/react';
import './index.css';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main accent
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#062f2a',
  },
  gray: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
};

const theme = extendTheme({
  config,
  colors,
  styles: {
    global: (props: any) => ({
      'html, body': {
        backgroundColor: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
        lineHeight: 'base',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      // Ensure consistent scrollbar styling
      '*::-webkit-scrollbar': {
        width: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
      },
      '*::-webkit-scrollbar-thumb': {
        background: props.colorMode === 'dark' ? 'gray.600' : 'gray.400',
        borderRadius: '4px',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        _focus: {
          boxShadow: 'outline', // Default Chakra focus outline
        },
      },
      variants: {
        solid: (props: any) => (
          props.colorScheme === 'teal' ? {
            bg: 'teal.500',
            color: 'white',
            _hover: {
              bg: 'teal.600',
              _disabled: {
                bg: 'teal.500'
              }
            },
            _active: {
              bg: 'teal.700'
            }
          } : {}
        )
      }
    },
    Input: {
      variants: {
        outline: (props: any) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.50',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
            },
            _focus: {
              borderColor: 'teal.500',
              boxShadow: `0 0 0 1px ${colors.teal[500]}`,
            },
          },
        }),
      },
    },
    Select: {
      variants: {
        outline: (props: any) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.50',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
            },
            _focus: {
              borderColor: 'teal.500',
              boxShadow: `0 0 0 1px ${colors.teal[500]}`,
            },
          },
          icon: {
            color: props.colorMode === 'dark' ? 'gray.400' : 'gray.600',
          }
        }),
      },
    },

  },
});


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
