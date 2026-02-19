import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  useToast,
} from '@chakra-ui/react';

export const RateLimitNotification: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const handleRateLimitWarning = (event: CustomEvent<{ remaining: number }>) => {
      const { remaining } = event.detail;
      setRemainingRequests(remaining);
      setShowAlert(true);

      // Show toast notification
      toast({
        title: "Rate Limit Warning",
        description: `You have ${remaining} requests remaining today.`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      // Hide alert after 10 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 10000);
    };

    // Add event listener
    window.addEventListener('rateLimitWarning', handleRateLimitWarning as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('rateLimitWarning', handleRateLimitWarning as EventListener);
    };
  }, [toast]);

  if (!showAlert) return null;

  return (
    <Box position="fixed" top="4" right="4" zIndex="toast" width="300px">
      <Alert status="warning" variant="solid" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Rate Limit Warning</AlertTitle>
          <AlertDescription>
            You have {remainingRequests} requests remaining today.
          </AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
}; 