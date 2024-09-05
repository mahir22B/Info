import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  Flex,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';

const API_URL = "https://instagraphix.pro:5000";

const hardcodedProducts = [
  {
    id: "333152",
    name: "20 Credits",
    price: 1900,
    price_formatted: "$19.00",
    description: "Perfect for first-time users or occasional projects. Each credit allows one generation cycle. Ideal for small businesses and individuals.",
    color: "#1A365D" // Bright dark blue
  },
  {
    id: "333153",
    name: "60 Credits",
    price: 3900,
    price_formatted: "$39.00",
    description: "Great for regular users or small teams. Create professional, customized infographics for your presentations, reports, and social media content.",
    color: "#805AD5" // Bright dark purple
  },
  {
    id: "333154",
    name: "120 Credits",
    price: 6900,
    price_formatted: "$69.00",
    description: "Ideal for power users, marketing teams, and agencies. Generate a wide range of stunning infographics for all your data visualization needs.",
    color: "#1A365D" // Bright dark blue
  }
];

const PricingModal = ({ isOpen, onClose }) => {
  const [buyUrls, setBuyUrls] = useState({});

  useEffect(() => {
    const fetchBuyUrls = async () => {
      try {
        const response = await fetch(`${API_URL}/api/get-lemon-squeezy-products`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product URLs');
        }

        const productsData = await response.json();
        const urlMap = {};
        productsData.forEach(product => {
          urlMap[product.id] = product.buy_now_url;
        });
        setBuyUrls(urlMap);
      } catch (error) {
        console.error('Error fetching product URLs:', error);
      }
    };

    if (isOpen) {
      fetchBuyUrls();
    }
  }, [isOpen]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const descriptionColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" closeOnEsc={false}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg={bgColor} maxWidth="100vw" height="100vh">
        <ModalHeader fontSize="4xl" textAlign="center" mt={8}>Choose Your Perfect Plan</ModalHeader>
        <ModalCloseButton size="lg" />
        <ModalBody>
          <Flex justifyContent="center" alignItems="center" height="100%">
            <Flex gap={8} flexWrap="wrap" justifyContent="center">
              {hardcodedProducts.map((product) => (
                <Box
                  key={product.id}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor={product.color}
                  overflow="hidden"
                  width="300px"
                  height="500px" // Increased height
                  textAlign="center"
                  position="relative"
                  bg={bgColor}
                >
                  {product.name === "60 Credits" && (
                    <Badge
                      position="absolute"
                      top="0"
                      right="0"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderBottomLeftRadius="md"
                      fontWeight="bold"
                      textTransform="uppercase"
                      bg={product.color}
                      color="white"
                    >
                      Most Popular
                    </Badge>
                  )}
                  <VStack spacing={6} height="100%" justifyContent="space-between" p={6}>
                    <VStack spacing={3}>
                      <Text fontSize="3xl" fontWeight="bold" color={product.color}>{product.name}</Text>
                      <Text fontSize="4xl" fontWeight="bold" color={textColor}>
                        {product.price_formatted}
                      </Text>
                      <Text fontSize="sm" color={descriptionColor}>{product.description}</Text>
                    </VStack>
                    <Button
                      as="a"
                      href={buyUrls[product.id] || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="lg"
                      width="100%"
                      height="50px"
                      fontSize="md"
                      fontWeight="semibold"
                      bg={product.color}
                      color="white"
                      borderRadius="md"
                      _hover={{
                        opacity: 0.9,
                      }}
                      onClick={(e) => {
                        if (!buyUrls[product.id]) {
                          e.preventDefault();
                          alert("Loading purchase link. Please try again in a moment.");
                        }
                      }}
                    >
                      Get Now!
                    </Button>
                  </VStack>
                </Box>
              ))}
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PricingModal;